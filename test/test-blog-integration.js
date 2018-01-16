const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const expect = chai.expect;
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');
chai.use(chaiHttp);



//---------- MAKE TEST DATA --------------

function seedBlogPostData() {
  console.log('seeding blog post data');
  const seedData = [];

  for (let i = 0; i < 10; i++) {
    seedData.push(generateBlogPostData());
  }
  return BlogPost.insertMany(seedData);
}

function generateAuthorName() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  authorName = {
    firstName: firstName,
    lastName: lastName
  }
  return authorName;
}

function generateTitle() {
  const titles = ["title1", "title2", "title3", "title4"];
  return titles[Math.floor(Math.random() * titles.length)];
}

function generateContent() {
  const content = ["content1", "content2", "content3", "content4"]
  return content[Math.floor(Math.random() * content.length)];
}

// the BlogPost object constructor
function generateBlogPostData() {
  return {
    author: generateAuthorName(),
    title: generateTitle(),
    content: generateContent()
  }
}




// Deletes database, called during afterEach()
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}




//-------------- TESTS -----------------

describe('Blog posts API resource', function() {

  // -------- BEFORE/AFTER EACH TEST -----------
  before(function() {
    return runServer(TEST_DATABASE_URL)
  });

  beforeEach(function() {
    return seedBlogPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });



  // --------- ENDPOINT TESTS -----------
  
  describe('GET endpoint', function() {
    it('should return all existing blog posts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res.body.blogPosts).to.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body.blogPosts).to.have.length.of(count);
        });
    });

    it('should return blog posts with correct fields', function() {
      let resBlogPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.blogPosts).to.be.a('array');
          expect(res.body.blogPosts).to.have.length.of.at.least(1);

          // For each blog post in the response...
          res.body.blogPosts.forEach(function(blogPost) {
            expect(blogPost).to.be.a('object');
            expect(blogPost).to.include.keys(
              'id', 'author', 'title', 'content', 'created');
          });
          resBlogPost = res.body.blogPosts[0];
          return BlogPost.findById(resBlogPost.id);
        })
        .then(function(blogPost) {
          // This variable helps us avoid obj/string comparison errors
          requestAuthor = `${blogPost.author.firstName} ${blogPost.author.lastName}` 
          expect(requestAuthor).to.equal(resBlogPost.author);
          expect(resBlogPost.id).to.equal(blogPost.id);
          expect(resBlogPost.title).to.equal(blogPost.title);
          expect(resBlogPost.content).to.equal(blogPost.content);
          // Doesn't check 'created', as the value won't match.
        });
    });
    
  });
  
  describe('POST endpoint', function() {
    it('should add a new blog post', function() {
      const newBlogPost = generateBlogPostData();

      return chai.request(app)
        .post('/posts')
        .send(newBlogPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'author', 'title', 'content', 'created');
          expect(res.body.name).to.equal(newBlogPost.name);
          expect(res.body.id).to.not.be.null;
          expect(res.body.title).to.equal(newBlogPost.title);
          expect(res.body.content).to.equal(newBlogPost.content);
          return BlogPost.findById(res.body.id);
        })
        .then(function(blogPost) {

          // To avoid object comparison issues
          const requestAuthorName = 
          `${newBlogPost.author.firstName} ${newBlogPost.author.lastName}`;
          const responseAuthorName =
          `${newBlogPost.author.firstName} ${newBlogPost.author.lastName}`;
          expect(requestAuthorName).to.equal(responseAuthorName);

          expect(blogPost.title).to.equal(newBlogPost.title);
          expect(blogPost.content).to.equal(newBlogPost.content);
        });
    });
  });  
  
  
  describe('PUT endpoint', function() {
    it('should update fields you send over', function() {
      const updateData = {
        title: 'a title',
        content: 'some content'
      };

      return BlogPost
        .findOne()
        .then(function(blogPost) {
          updateData.id = blogPost.id;
          return chai.request(app)
            .put(`/posts/${blogPost.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);

          return BlogPost.findById(updateData.id);
        })
        .then(function(blogPost) {
          expect(blogPost.title).to.equal(updateData.title);
          expect(blogPost.content).to.equal(updateData.content);
        });
    });
  });
  

  describe('DELETE endpoint', function() {
    it('delete a blog post by id', function() {
  
      let blogPost;

      return BlogPost 
        .findOne()
        .then(function(_blogPost) {
          blogPost = _blogPost;
          return chai.request(app).delete(`/posts/${blogPost.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(blogPost.Id);
        })
        .then(function(_blogPost) {
          expect(_blogPost).to.be.null;
        })
    });
  });
});
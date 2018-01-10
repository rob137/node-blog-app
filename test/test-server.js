const chai = require('chai');
const chaiHttp = require('chai-http');

      // need to add these to server.js!
const {app, runServer, closeServer} = require('../server');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Blog posts', function() {

  before(function() {
    return runServer();
  })

  after(function() {
    return closeServer();
  })

  // For GET requests
  it('should list blog posts on GET', function() {
    return chai.request(app)
      .get(`/blog-posts`)
      .then(function(res) {
        expect(res).to.have.status(200);
        // It comes as [ {}, {}, {} ].  Isn't JSON {}?
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['id', 'author', 'content', 'publishDate', 'title'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });

  // For POST requests
  it('should add a blog post on POST', function() {
    const newItem = {
      author: 'foo',
      content: 'barr',
      title: 'yep',
      publishDate: '1 Jan 2000'
    };
    return chai.request(app)
      .post('/blog-posts')
      .send(newItem)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'author', 'content', 'publishDate', 'title');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

  // For PUT  requests
  it('should update blog post on PUT', function() {
    const updateData = {
      author: 'foo',
      content: 'barr',
      title: 'yep',
      publishDate: '1 Jan 2000'
    };

    return chai.request(app)
      .get(`/blog-posts`)
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

  // For DELETE requests
  it('should delete blog post on DELETE', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });

});
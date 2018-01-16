'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
                                  
const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require('./models');

const app = express();
app.use(bodyParser.json());




// -------------------- GET ----------------------
app.get('/posts', (req, res) => {
  console.log(`GET request received.`);
  BlogPost
    .find()
    .then(blogPosts => {
      res.json({
        blogPosts: blogPosts.map(
          (blogPost) => blogPost.serialize())
      })
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/posts/:id', (req, res) => {
  console.log(`GET request received.`);
  BlogPost
    .findById(req.params.id)
    .then(blogPost => res.json(blogPost.serialize()))
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: `Internal server error` })
    });
});




// -------------------- POST ----------------------
app.post('/posts', (req, res) => {

  const requiredFields = ['title', 'author', 'content'];
  for (let num in requiredFields) {
    const field = requiredFields[num];
    if (!(field in req.body)) {
      const message = `missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if ( !(req.body.author.firstName && req.body.author.lastName) ) {
    const message = `Missing author first or last name in request body`;
    console.error(message);
    return res.status(400).send(message);
  };
  BlogPost
    .create({
      author: req.body.author,
      title: req.body.title,
      content: req.body.content
    })
    .then(console.log('Creating a new blog post...'))
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});





// -------------------- PUT ----------------------
app.put('/posts/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});




// -------------------- DELETE ----------------------
app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(console.log(`Deleting a blog post...`))
    .then(blogPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
});


app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not found'});
});

let server;

function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve,reject) => {
    mongoose.connect(databaseUrl, {useMongoClient: true}, err => {
      if(err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}



function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log(`Closing server`);
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
});
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
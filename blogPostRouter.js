const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

// Need to understand this line!
const {BlogPosts} = require('./models')

// Need to set up! Include date parameter?
BlogPosts.create('Blah blah, blaha blah');
BlogPosts.create('Words words, words words');
BlogPosts.create('Typing blog, bloggy blog');


router.get('/', (req, res) => {
	res.json(BlogPosts.get());
});

router.post('/', jsonParser, (req, res) => {

});

router.delete('/:id', (req, res) => {

});

router.put('/:id', jsonParser, (req, res) => {

});

module.exports = router;
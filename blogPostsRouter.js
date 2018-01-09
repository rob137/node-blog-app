const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const {BlogPosts} = require('./models')

BlogPosts.create(`First Post`, `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat.`, `Mel`, `1 Jan 18`);
BlogPosts.create(`Second Post`, `Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`, `Jim`, `4 Jan 18`);
BlogPosts.create(`Third Post`, `Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat.`, `Sally`, `8 Jan 18`);


router.get('/', (req, res) => {
	console.log('success!------------------------------------------');
	res.json(BlogPosts.get());
});


router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'publishDate'];
	for (fieldNum in requiredFields) {
		if (!(field in req.body)) {
			const message = `missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}															// Confirm that these are the keys required by models.js!
	const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
	res.status(201).json(item);
});


router.delete('/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted blog post ${req.params.id}`);
	res.status(204).end();
});


router.put('/:id', jsonParser, (req, res) => {
	const requiredFields = ['id', 'author', 'content', 'title', 'date'];
	for (fieldNum in requiredFields) {
		const field = requiredFields[fieldNum];
		if (!(field in req.body)) {
			const message = `Missing ${field} in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	if (req.prarams.id !== req.body.id) {
		const message = (
			`Request path id (${req.params.id}) and request body id `
			`(${req.body.id} must match`);
		console.error(message);
		return res.status(400).send(message);
	}
	console.log('Updating blog post ${req.params.id}');
	const updatedPost = BlogPosts.update ({
		id: req.params.id,
		author: req.body.author,
		title: req.body.title,
		content: req.body.content,
		date: date
	})
});


module.exports = router;

/*
update: function(updatedPost) {
    const {id} = updatedPost;
    const postIndex = this.posts.findIndex(
      post => post.id === updatedPost.id);
    if (postIndex === -1) {
      throw new StorageException(
        `Can't update item \`${id}\` because doesn't exist.`)
    }
    this.posts[postIndex] = Object.assign(
      this.posts[postIndex], updatedPost);
    return this.posts[postIndex];

*/
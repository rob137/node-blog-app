const express = require('express');
const morgan = require('morgan');

const app = express();

const blogPostsRouter = require('./blogPostsRouter');

app.use(morgan('common'));

// Need to set this up!
app.use(express.static('public'));

app.get('/', (req, res) => {
													// Need to create this!
	res.sendFile(__dirname + '/views/index.html');
});

					// Need to set this up!
app.use('./blog-posts', blogPostsRouter);

app.listen(process.env.PORT || 8080, () => {
							// Play with this to see what's going on in the ${} brackets!
	console.log(`Your app is listening on port ${process.env.PORT || 8080}`);
})
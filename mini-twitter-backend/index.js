const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
// const commentRoutes=require('./routes/comment');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({origin : 'http://mini-twitter-frontend.s3-website.eu-north-1.amazonaws.com'}));
app.use(bodyParser.json());

// Base route for testing server status
app.get('/', (req, res) => {
  res.send('Mini Twitter Backend is running 🚀');
});

// Mount routes with clean base URLs:
app.use('/auth', authRoutes);    // Auth routes: /auth/signup, /auth/login, /auth/me
app.use('/posts', postRoutes);   // Posts routes: /posts
// app.use('/comments', commentRoutes);

app.listen(PORT,'0.0.0.0' ,() => {
  console.log(`✅ Server running ${PORT}`);
});

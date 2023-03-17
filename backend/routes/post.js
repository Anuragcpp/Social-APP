const express = require('express');
const { createPosts, likeAndUnLikePost, deletePost, getPostOfFollowing, updateCaptin, commentOnPost, deleteComment } = require('../controller/post');
const { isAuthenticated } = require('../middlewares/auth');


const router = express.Router();

router.route("/post/upload").post( isAuthenticated,createPosts);

router.route("/post/:id").get(isAuthenticated,likeAndUnLikePost).put(isAuthenticated,updateCaptin).delete(isAuthenticated,deletePost);

router.route("/posts").get(isAuthenticated,getPostOfFollowing);

router.route('/posts/comment/:id').put(isAuthenticated,commentOnPost).delete(isAuthenticated,deleteComment);


module.exports = router;



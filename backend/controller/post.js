const Post = require('../models/Post');
const User = require('../models/User');

exports.createPosts = async (req,res)=>{

  try {

    let newPostData = {
        caption: req.body.caption,
        image:{
            public_ID:"req.body.public_ID",
            url:"req.body.url",
        },
        owner : req.user._id,
    }
   
    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.push(post._id);

    // user.Posts.push(post._id);

    await user.save();


    res.status(200).json({
        success:true,
        post,
    })


    
  } catch (error) {
    res.status(500).json({
        success:false,
        message:error.message
    })
  }


};

exports.likeAndUnLikePost = async (req,res)=>{
try {
  
  const post = await Post.findById(req.params.id);

  if( !post ){
    return res.status(404).json({
      success:false,
      message:"Post not found",
    })
  }

  if(post.likes.includes(req.user._id)){

    const index = post.likes.indexOf(req.user._id);

    post.likes.splice(index , 1);

    await post.save();

    return res.status(200).json({
      success:true,
      message:"Post Unliked",
    })
  }else{

    post.likes.push(req.user._id);
  
    await post.save();

    return res.status(200).json({
      success:true,
      message:"Post Liked",
    })
  }

} catch (error) {
   res.status(500).json({
    success:false,
    message:error.message,
   })
}
};

exports.deletePost = async (req,res) =>{
  try {
    
     const post = await Post.findById(req.params.id);

     if( !post ){
      return res.status(404).json({
        success:false,
        message:"Post not found",
      });
    }

      if(post.owner.toString() !== req.user._id.toString()){
        return res.status(401).json({
          success:false,
          message:"Unauthorised",
        })
      }else{
        await post.deleteOne();

        const user = await User.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index , 1);
        await user.save();
  
        return res.status(200).json({
          success:true,
          message:"Post deleted",
        })
      }

     

  } catch (error) {
    res.status(500).json({
      success: false,
      message:error.message,
    })
  }
};

exports.getPostOfFollowing = async (req,res) =>{
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.find({
      owner:{
        $in: user.following,
      }
    })

    res.status(200).json({
      success:true,
      post,
    })

  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
};

exports.updateCaptin = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    const {caption} = req.body;
    if(post.owner.toString() !== req.user._id.toString()){
      return res.status(400).json({
        success:false,
        message: "Unauthorised",
      })
    }else{
      post.caption = caption;
      await post.save();

      res.status(200).json({
        success:true,
        message:"Caption Updated",
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
};

exports.commentOnPost = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    let commentIndex = -1;
    post.comments.forEach((item,index)=>{
      if(item.user.toString()===req.user._id.toString()){
        commentIndex = index ; 
      };
    })
    if(commentIndex !== -1){
      post.comments[commentIndex].comment = req.body.comment;
      await post.save();

      return res.status(200).json({
        success:true,
        message:"Comment Updated",
      })
    }else{
      await post.comments.push({
        user:req.user._id,
        comment:req.body.comment,
      })
      await post.save();

      res.status(200).json({
        success:true,
        message:"Comment Added"
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
};

exports.deleteComment = async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if(!post){
      return res.status(400).json({
        success:false,
        message:"Post not found",
      });
    }
    //checking if owner wants to delete
    if(post.owner.toString()===req.user._id.toString()){

      if(req.body.commentId === undefined){
        return res.status(400).json({
          success:false,
          message:"Enter comment Id",
        })
      }

      post.comments.forEach((item,index)=>{
        if(item._id.toString()===req.body.commentId.toString()){
          return post.comments.splice(index,1); 
        };
      });

      await post.save();

      return res.status(200).json({
        success:true,
        message:"Selected comment has deleted"
      })

    }else{
      post.comments.forEach((item,index)=>{
        if(item.user.toString()===req.user._id.toString()){
          return post.comments.splice(index,1); 
        };
        if(item.user.toString() !== req.user._id.toString()){
          return res.status(400).json({
            success:false,
            message:"Comment not found",
          });
        };
      })

      await post.save();

      res.status(200).json({
        success:true,
        message:"Your comment has deleted",
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}
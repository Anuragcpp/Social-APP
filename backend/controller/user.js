const User= require('../models/User');
const Post = require('../models/Post');

exports.register = async (req,res)=>{
 try {
    
    const{name,email,password}= req.body;

    let user = await User.findOne({email});
    if(user){
     return  res
              .status(400)
              .json({
               success:false,
               message: "user already exists"
              })
    };
 
    user = await User.create({
      name,
      email,
      password,
      avatar:{ public_ID:"sample_ID", url:"sample_URL" }
    });

    const token = await user.generateToken();

     const options = {
      expires : new Date(Date.now() + 90*24*60*60*1000),
      httpOnly:true,
     }

     res.status(201)
     .cookie("token", token , options)
     .json({
      success:true,
      message:"Congratulation you have registered successfully",
      user,
      token,
     })

 } catch (error) {
    res.status(500).json({
        success:false,
        message: error.message
    })
 }
}

exports.login = async (req,res) =>{
   try {
      
      const {email,password} =req.body;

      let user = await User.findOne({email}).select("+password");

     if( !user ) {
      return res.status(400).json({
         success:false,
         message: "User does not exists"
      });
     }

     const isMatch = await user.matchPassword(password);

     if( !isMatch){
      return res.status(400).json({
         success:false,
         message:"Incurrect Password",
      });
     }

     const token = await user.generateToken();

     const options = {
      expires : new Date(Date.now() + 90*24*60*60*1000),
      httpOnly:true,
     }

     res.status(200)
     .cookie("token", token , options)
     .json({
      success:true,
      user,
      token,
     })
     


   } catch (error) {
       res.status(500).json({
         success:false,
         message:error.message,
       })
   }
};

exports.logout = async (req,res)=>{
  try {
    res.status(200).cookie("token",null ,{expires:new Date(Date.now()),httpOnly:true}).json({
      success:true,
      message:"Logout sucessfully",
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message: error.message,
    })
  }
};

exports.followUser = async (req, res) => {
   try {
     const userTofollow = await User.findById(req.params.id);
     const logedinUser = await User.findById(req.user._id);
 
     if( !userTofollow){
       return res.status(404).json({
         success:false,
         message:"User not found",
       })
      };

      if(logedinUser.following.includes(userTofollow._id)){
         const indexFollowers = userTofollow.followers.indexOf(logedinUser._id);
         const indexFollowing = logedinUser.following.indexOf(userTofollow._id);

         logedinUser.following.splice(indexFollowing , 1);
         userTofollow.followers.splice(indexFollowers , 1);

         await userTofollow.save();
         await logedinUser.save();

         return res.status(200).json({
          success:true,
          message: " User Unfollowed",
         })
      }else{

        logedinUser.following.push(userTofollow._id);
        userTofollow.followers.push(logedinUser._id);
  
        await logedinUser.save();
        await userTofollow.save();
  
        res.status(200).json({
          success:true,
          message:"User followed",
        });
      }

      

   } catch (error) {
     res.status(500).json({
       success:false,
       message:error.message,
     })
   }
 };

 exports.updatePassword= async (req,res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const {oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword){
      return res.status(400).json({
        success:false,
        message:"Please provide old passwoed and new password",
      })
    }
    const isMatch = await user.matchPassword(oldPassword);

    if( !isMatch ){
      return res.status(400).json({
         success:false,
         message:"Incurrect Old Password",
      })
    }else{
      user.password= newPassword;
      await user.save();

      res.status(200).json({
        success:true,
        message:"Password Updated",
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
 };

 exports.updateProfile = async (req,res) =>{
  try {
    const user = await User.findById(req.user._id);
    const {name,email} = req.body;
    if(name){
      user.name= name;
    } 
    if(email){
      user.email= email;
    }

    //avtar to doo

    await user.save();
   
    res.status(200).json({
      success:true,
      message:"Porfile Updated"
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
 };
 
 exports.deleteMyProfile = async (req,res) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = user.posts;
    const followers = user.followers;
    const following = user.following;
    const userId = user._id;
    
    //delete profile
    await user.deleteOne();
    //loged out user
    res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true});

    //remove user from followers following (they follow user)
    for (let i = 0; i < followers.length; i++) {
       const follow = await User.findById(followers[i]);
       const index = follow.following.indexOf(userId);
       
       follow.following.splice(index,1);
       await follow.save();
    };
    //removing user form following followers (user follow them)
    for (let i = 0; i < following.length; i++) {
      const follow = await User.findById(following[i]);
      const index = follow.followers.indexOf(userId);

      follow.followers.splice(index,1);
      await follow.save(); 
    }
    
    //deleting all the post of the users
    for (let i = 0; i < posts.length; i++) {
      const post = await Post.findById(posts[i]);
      await post.deleteOne();  
    }

    res.status(200).json({
      success:true,
      message:"Profile Deleted Successfully",
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    })
  }
 };

 exports.myProfile = async (req,res) => {
  try {
    const user = await User.findById(req.user._id).populate("posts");

    res.status(200).json({
      success:true,
      user,
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
 };

 exports.getUserProfile = async (req,res) => {
  try {
    const user = await User.findById(req.params.id).populate("posts");

    if( !user ){
      return res.status(400).json({
        success:false,
        message:"User does not found"
      })
    }else{
      res.status(200).json({
        success:true,
        user,
      })
    }
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
 };

 exports.getAllUsers = async (req,res) => {
  try {
    const users = await User.find({});

    res.status(200).json({
      success:true,
      users,
    })
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
 };

 exports.forgetPassword = async (req,res) => {
  try {
    const user = await User.findById({email:req.body.email});

    if( !user ){
      return res.status(400).json({
        success:false,
        message:"User not found",
      });
    };

    
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    })
  }
 }
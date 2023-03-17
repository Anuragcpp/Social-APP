const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

    caption : String,
    image:{
        public_id:String,
        url: String
    },
    owner:String,
    createdAt:{
        type: Date,
        default: Date.now
    },
    likes: [

            {  
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
    ],
    comments:[
        {
            user:{
                type: mongoose.Schema.Types.ObjectId,
                ref:"user",
            },
            comment:{
                type:String,
                required:true,
            }
        }
    ]


});

module.exports= mongoose.model("posts",postSchema);

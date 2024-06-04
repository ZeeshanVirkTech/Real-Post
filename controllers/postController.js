const post_model = require("../model/post");
const user_model = require("../model/user");
const { generatePostContent, useOpenAI } = require("../utils/openAi");
const { validationResult } = require("express-validator");
const {createApi} = require("unsplash-js");
const fetch = require("node-fetch-commonjs");
const { unsplashToAWS } = require("../utils/unsplashToAws");
const { deleteImageFromS3 } = require("../uploader/imagesUploader");
const { sendPushNotification } = require("../services/firebase");

const unsplash = createApi({
  fetch: fetch,
  accessKey:process.env.UNSPLASH_ACCESS_KEY
});

const generatePost = async (req, res, next) => {
  const userId = req.extractedUserId;
  const { persona, tone } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }
  
  let response , generatedImages=[];
  try {
        
  const mappedPersona = {
    heading: persona?.heading,
    name: persona?.name,
    background: persona?.background,
    housing_needs: persona?.housing_needs,
    other_requirements: persona?.other_requirements,
    creator: userId,
  };

try {
  const openai = useOpenAI();
   response = await generatePostContent(openai, mappedPersona, tone);
} catch  {
  const error = new Error("Something went wrong generating data");
  error.code = 500;
  return next(error);
}

let photos
try
{   photos = await unsplash.search.getPhotos({
  query: `${response.keywords.join(",")}` ,
  perPage:3
});

}

catch  {
  const error = new Error("Something went wrong");
  error.code = 500;
  return next(error);
}

  const imgUrls = photos.response?.results;
  for(let url of imgUrls)
  {
  generatedImages.push(url?.urls?.regular);
   console.log(url.links.download_location);
  }

  } catch  (err) {
      console.log("Whole try catch : " + err);
        const error = new Error("Something went wrong");
        error.code =500;
        return next(error);
  };

  
  res.status(201).json({ post: {...response},generatedImages  });
};
const confirmPost = async (req, res, next) => {

  const errors = validationResult(req);
  const files = req.files;

  if (!errors.isEmpty()) {
      if(req.files.length!==0 && req.files)
      {
        deleteImageFromS3(files);
      }
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  const { description, heading , generatedImages} = req.body;

  const userId = req.extractedUserId;
  const paramsuid = req.params.uid;

  if (userId !== paramsuid) {
    const error = new Error("Unauthorized user access");
    error.code = 403;
    return next(error);
  }

  let user;
  try {
           user = await user_model.findById(userId);
  } catch {
      const error = new Error("Something went wrong");
      error.code = 500;
      return next(error);
  }

  if(!user?.username)
  {
      const error = new Error("No such user exists");
      error.code = 403;
      return next(error);
  }

  let images=[] , imageServer;

if(req.files.length!==0 && req.files){
   for(let i=0 ; i< files.length; i++)
  {
     images.push(files[i]);
  }
}

else
{
  if(generatedImages)
  {
    // const returnedImages = await unsplashToAWS(generatedImages);
    //  if(returnedImages.code==500)
    //  {
    //   const error = new Error("Something went wrong");
    //   error.code = 500;
    //   return next(error);
    //  }
     
    images.push(...generatedImages);
    
  }
  
} 


  let post;
  try {
    post = new post_model({
      heading: heading,
      description: description,
      images : images,
      creator: userId,
    });
    await post.save();
  } catch (err) {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }

  await sendPushNotification("Remuse"  ,"New updates are available" , user?.device_token);

  res.status(201).json({ message: "Post created!" });
};

const editPost = async (req, res, next) => {
  const { heading, description } = req.body;
  const postId = req.params.postid;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  let post;
  try {
    post = await post_model.findById(postId);
  } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  if(!post)
  {
      const error = new Error("No such post exists");
    error.code = 400;
    return next(error);
  }

  if (req.extractedUserId !== post.creator.toString()) {
    const error = new Error("Unauthorized user access");
    error.code = 403;
    return next(error);
  }
    
  try {
       post.heading = heading;
       post.description = description;
       post.save();
  } catch  {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(201).json({message: "Post updated successfully!" , heading : post.heading , description : post.description , creator: post.creator})
};

const getUserPosts=async(req , res , next)=>{
  const userId = req.extractedUserId;
  let posts;
   try {
         posts = await post_model.find({creator : userId});
   } catch  {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
   }

   res.status(200).json({posts : posts.map((post)=> post.toObject({getters:true}))});
};

const deletePost=async(req , res , next)=>{
    const userId = req.extractedUserId;
   const {postid} = req.params;
   let post;
   try {
       post = await post_model.findById(postid);
   } catch  {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
   }

   if(!post?.description)
   {
    const error = new Error("No such post exists");
    error.code=400;
    return next(error);
   } 
   
   if(userId!==post?.creator?.toString())
   {
    const error = new Error("Unauthorized user access");
    error.code = 403;
    return next(error);
   }

   try {
       await post.remove();
   } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
   }

   res.status(201).json({message: "Post deleted successfully!"});
   
};

const getPostById=async(req, res , next)=>{
   const postid = req.params.postid;
   let post;
   try {
       post = await post_model.findById(postid);
   } catch  {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
   }

   if(!post)
   {
    const error = new Error("no such post exists");
    error.code =400;
    return next(error);
   }

   res.status(200).json({post : post});
};

const setReminder=async(req,res,next)=>{
   const userId = req.extractedUserId;
   const {reminder_type , device_token} = req.body;
   let user;
   try {
            user = await user_model.findById(userId);
   } catch {
       const error = new Error("Something went wrong");
       error.code = 500;
       return next(error);
   }

   if(!user?.username)
   {
       const error = new Error("No such user exists");
       error.code = 400;
       return next(error);
   }

   try {
        user.reminder_type = reminder_type;
        user.device_token = device_token;
        await user.save();

   } catch  {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
   }

   res.status(201).json({message: `Reminder set to ${reminder_type}`});
};


exports.generatePost = generatePost;
exports.editPost = editPost;
exports.confirmPost = confirmPost;
exports.getUserPosts = getUserPosts;
exports.deletePost = deletePost;
exports.getPostById = getPostById;
exports.setReminder =setReminder;
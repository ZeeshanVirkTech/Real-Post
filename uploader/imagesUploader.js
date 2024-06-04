const multer = require("multer");
const AWS = require('aws-sdk'),
      {
        S3Client , PutObjectCommand, DeleteObjectCommand 
      } = require("@aws-sdk/client-s3");
      



const uploadImages=async(req , res , next)=>{

  const limits = {fileSize: 1024*1024*5} ;

const fileFilter = (req, file, cb) => {
  const isValid = file.mimetype.startsWith("image/");

  const error = isValid ? null : new Error("INVALID MIMETYPE");

  cb(error, isValid);
};


  // AWS.config.update({
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ,
  // });
  
  const s3 = new S3Client({
    endpoint :`https://${process.env.AWS_ENDPOINT}` ,
    region : process.env.AWS_REGION
  });


  // const storage = multer_s3({
  //   s3 : s3 ,
  //   bucket : "remuse-practice7867" ,
  //   acl : 'public-read' ,
  //  // metadata : fileFilter
  // }) ;

  const uploader = multer({
    storage : multer.memoryStorage(),
    limits :limits ,
    fileFilter: fileFilter
  }).array("images");



uploader(req, res, async(error) => {
  if (error instanceof multer.MulterError) 
     {
      const err = new Error(error.message);
      err.code = 400;
      return next(err);
     }
  
  if (error) 
     {
         const err = new Error(error.message);
         err.code = 500;
         return next(err);
     }

     let imageArr=[] , fileName;
 for(let i=0 ;i<req.files.length; i++){   
  fileName=Math.random() +req.files[i].originalname;

  try {
    await s3.send(new PutObjectCommand({
      Bucket:process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: req.files[i].buffer
    }));
  } catch (error) {
    const err = new Error(error.message);
    err.code = 500;
    return next(err);
}
      
    imageArr.push(`https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_ENDPOINT}/${fileName}`);
  }
    
    req.files = imageArr;
     next();
});

}


const deleteImageFromS3=async(s3UrlsArr) =>{
  const s3 = new S3Client({
    endpoint :`https://${process.env.AWS_ENDPOINT}` ,
    region : process.env.AWS_REGION
  });

  for(let i=0 ;i<s3UrlsArr.length; i++){   
    fileName=s3UrlsArr[i].split(`${process.env.AWS_ENDPOINT}/`)[1];
  
    try {
      await s3.send(new DeleteObjectCommand({
        Bucket:process.env.AWS_BUCKET_NAME,
        Key: fileName,
      }));
    } catch  {
      const err = new Error("Something went wrong");
      err.code = 500;
      return next(err);
  }
        
    }


}





module.exports = {uploadImages , deleteImageFromS3 };

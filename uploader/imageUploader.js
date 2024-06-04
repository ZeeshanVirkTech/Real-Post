const multer = require("multer");
const AWS = require('aws-sdk'),
      {
        S3Client , PutObjectCommand, DeleteObjectCommand 
      } = require("@aws-sdk/client-s3");

      const s3 = new S3Client({
        endpoint :`https://${process.env.AWS_ENDPOINT}` ,
        region : process.env.AWS_REGION
      });

      const limits = {fileSize: 1024*1024*5} ;

      const fileFilter = (req, file, cb) => {
        const isValid = file.mimetype.startsWith("image/");
      
        const error = isValid ? null : new Error("INVALID MIMETYPE");
      
        cb(error, isValid);
      };

const uploadImage=async(req, res ,next)=>{

    const uploade = multer({
        storage : multer.memoryStorage(),
        limits :limits ,
        fileFilter: fileFilter
      }).single("image");
    
      uploade(req, res, async(error) => {
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
      
      
       let fileName=Math.random() +req.file.originalname.split(" ").join("aws").split("-").join("aws");
      
          try {
            await s3.send(new PutObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileName,
              Body: req.file.buffer
            }));
          } catch (err) {
                const error = new Error(err.message);
                error.code=500;
                return next(error);
          }
            
          const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.${process.env.AWS_ENDPOINT}/${fileName}`
          
          req.file = imageUrl;
          
           next();

    
      });
};

module.exports = {uploadImage};
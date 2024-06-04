const express = require("express");
const { check } = require("express-validator");
const auth = require("../middlewares/auth-mw");
const { generatePost, editPost, confirmPost, getUserPosts, deletePost, downloadUnsplashImages, getPostById, setReminder } = require("../controllers/postController");
const checkUser = require("../utils/checkUserDb");
const { confirmPostValidation, generatePostValidation } = require("../utils/fieldsValidation");
const {uploadImages, uploader} = require("../uploader/imagesUploader");

const router = express.Router();

/**
     * @openapi
     * '/api/post/generate':
     *  post:
     *     tags:
     *     - Post Controllers
     *     summary: Generate post based upon input
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *             schema:
     *              type: object
     *              required:
     *               - personas
     *               - tone
     *              properties:   
     *                persona:         
     *                  type: object
     *                  required:
     *                    - heading
     *                    - name
     *                    - backgroud
     *                    - housing_needs
     *                    - other_requirements
     *                  properties:
     *                    heading:
     *                      type :  string
     *                      default : some heading
     *                    name:
     *                      type: string
     *                      default: name
     *                    background:
     *                      type: string
     *                      default: background
     *                    housing_needs:
     *                      type: string
     *                      default: housing needs
     *                    other_requirements:
     *                      type: string
     *                      default: other requirements
     *                tone:
     *                    type: array
     *                    example: [conversational ,casual]           
     *     responses:
     *      201:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - post
     *              properties:   
     *                post:         
     *                  type: object
     *                  required:
     *                    - heading
     *                    - description
     *                    - creator
     *                    - generatedImages
     *                    - unsplashDownloadLinks
     *                  properties:
     *                    heading:
     *                      type :  string
     *                      default : some heading
     *                    description:
     *                      type: string
     *                      default: some description
     *                    creator:
     *                      type: string
     *                      default: user's id
     *                    generatedImages:
     *                       type: array
     *                       example: [url1 , url2 , url3]
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists / custom feild validation error
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong (sometimes appended with generating data)
     */
router.post("/generate", auth, generatePostValidation() , checkUser , generatePost);

/**
     * @openapi
     * /api/post/edit/{postid}:
     *  patch:
     *     parameters:
     *       - in: path
     *         name: postid
     *         required: true
     *         type: string
     *         minimum: 1
     *         description: id of post to edit
     *     tags:
     *     - Post Controllers
     *     summary: Edit post based upon input
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *             schema:
     *               type: object
     *               required:
     *                    - heading
     *                    - description
     *               properties:
     *                    heading:
     *                      type :  string
     *                      default : some heading
     *                    description:
     *                      type: string
     *                      default: description 
     *     responses:
     *      201:
     *        content:
     *          application/json:
     *             schema:    
     *                  type: object
     *                  required:
     *                    - heading
     *                    - description
     *                    - creator
     *                    - message
     *                  properties:
     *                    heading:
     *                      type :  string
     *                      default : some heading
     *                    description:
     *                      type: string
     *                      default: some description
     *                    creator:
     *                      type: string
     *                      default: user's id
     *                    message:
     *                      type: string
     *                      default: Post updated successfully!
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists / custom feild validation error
     *      403:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: unauthorzied user access
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong (sometimes appended with generating data)
     */
router.patch("/edit/:postid", auth, confirmPostValidation(), checkUser, editPost);

/**
     * @openapi
     * /api/post/confirm/{uid}:
     *  post:
     *     parameters:
     *       - in: path
     *         name: uid
     *         required: true
     *         default: userid
     *         type: string
     *         minimum: 1
     *         description: id of user 
     *     tags:
     *     - Post Controllers
     *     summary: Confirm saving post in database
     *     description: Only one type of images should be passed from client between generatedImages(unsplash images) and images(system uploaded file) 
     *     requestBody:
     *      required: true
     *      description:  Only one type of images should be passed from client between generatedImages(unsplash images) and images(system uploaded file). Both are arrays , generatedImages array sent from client looks like ["url1" , "url2"] . When sending generatedImages only then unsplashDownloadLinks array should be sent 
     *      content:
     *        multipart/form-data:
     *             schema:
     *              type: object
     *              required:
     *               - heading
     *               - description
     *              properties:
     *                 heading:
     *                    type :  string
     *                    default : some heading 
     *                 description:
     *                    type: string
     *                    default: description of post     
     *                 images:
     *                     type: array
     *                     items:
     *                       type: string
     *                       default : image1
     *                       format: binary
     *                 generatedImages[0]:
     *                       type: string
     *                       default: https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTA0MTR8MHwxfHNlYXJjaHwxfHxob21lYnV5ZXIlMkNyZWFsJTIwZXN0YXRlJTIwbWFya2V0JTJDc3BhY2lvdXMlMjBob3VzZXxlbnwwfHx8fDE2OTY1MDc0Njl8MA&ixlib=rb-4.0.3&q=80&w=1080
     *                 generatedImages[1]:
     *                       type: string
     *                       default: https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTA0MTR8MHwxfHNlYXJjaHwxfHxob21lYnV5ZXIlMkNyZWFsJTIwZXN0YXRlJTIwbWFya2V0JTJDc3BhY2lvdXMlMjBob3VzZXxlbnwwfHx8fDE2OTY1MDc0Njl8MA&ixlib=rb-4.0.3&q=80&w=1080
     *                 generatedImages[2]:
     *                       type: string
     *                       default: https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1MTA0MTR8MHwxfHNlYXJjaHwxfHxob21lYnV5ZXIlMkNyZWFsJTIwZXN0YXRlJTIwbWFya2V0JTJDc3BhY2lvdXMlMjBob3VzZXxlbnwwfHx8fDE2OTY1MDc0Njl8MA&ixlib=rb-4.0.3&q=80&w=1080
     *     responses:
     *      201:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - message
     *              properties:   
     *                message:         
     *                  type: object
     *                  default : Post created!
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists / custom feild validation error
     *      403:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: unauthorzied user access
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong / jwt error 
     */

router.post("/confirm/:uid", auth,  uploadImages  , confirmPostValidation(), confirmPost);

/**
     * @openapi
     * /api/post:
     *  get:
     *     tags:
     *     - Post Controllers
     *     summary: Get all posts related to logged in user
     *     description: number of user posts will be returned
     *     responses:
     *      200:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - posts
     *              properties:   
     *                posts:         
     *                  type: array
     *                  items:
     *                   type: object
     *                   required:
     *                    - id
     *                    - heading
     *                    - description
     *                    - creator
     *                    - images
     *                   properties:
     *                    id:
     *                      type: string
     *                      default: idddddd
     *                    heading:
     *                      type :  string
     *                      default : some heading
     *                    description:
     *                      type: string
     *                      default: name
     *                    creator:
     *                      type: string
     *                      default : userid comes here
     *                    images:
     *                      type: array
     *                      items:
     *                       type: string
     *                       default: image1 url
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists / custom field validation error
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong / Jwt token error
     */

router.get("/" , auth , checkUser , getUserPosts);

/**
     * @openapi
     * /api/post/{postid}:
     *  delete:
     *     parameters:
     *       - in: path
     *         name: postid
     *         required: true
     *         type: string
     *         minimum: 1
     *         description: id of post
     *     tags:
     *     - Post Controllers
     *     summary: Delete the post from database   
     *     responses:
     *      201:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - message
     *              properties:   
     *                message:         
     *                  type: object
     *                  default : Post delete successfully!
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such post exists / no such user exists
     *      403:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: unauthorzied user access
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong / jwt error 
     */


router.delete("/:postid" , auth , checkUser , deletePost);
router.get("/single/:postid" , auth ,checkUser , getPostById);
/**
     * @openapi
     * /api/post/download/{postid}:
     *  get:
     *     parameters:
     *      - in: path
     *        required: true
     *        type: string
     *        name: postid
     *        description: id of the post
     *     tags:
     *     - Post Controllers
     *     summary: Download images
     *     description: All images related to specific post will be downloaded in device
     *     responses:
     *      200:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - message
     *              properties:
     *                 message:
     *                  type: string
     *                  default: Images Downloaded
     *      400:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: No such user exists / no such post exists
     *      403:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Unauthorized user access
     *      500:
     *          description:
     *          content:
     *              application/json:
     *                schema:
     *                   type: object
     *                   required:
     *                     - message
     *                   properties:
     *                     message:
     *                       type: string
     *                       default: Something went wrong / Jwt token error
     */

   router.post("/reminder/set" , auth , setReminder);

module.exports = router;

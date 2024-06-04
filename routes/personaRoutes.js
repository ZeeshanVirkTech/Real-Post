const express = require("express");
const { check } = require("express-validator");
const auth = require("../middlewares/auth-mw");
const {
  generatePersonas,
  editPersona,
  getUserPersonas,
} = require("../controllers/personaController");
const checkUser = require("../utils/checkUserDb");
const { editPersonaValidation, generatePersonaValidation } = require("../utils/fieldsValidation");

const router = express.Router();

/**
     * @openapi
     * '/api/persona/generate':
     *  post:
     *     tags:
     *     - Persona Controllers
     *     summary: Generate personas based upon input
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - name
     *              - cities
     *              - usp
     *              - idealTraits
     *            properties:
     *              name:
     *                type: string
     *                default: john & sarah
     *              cities:
     *                type: string
     *                default: chigago, new york
     *              usp:
     *                type: string
     *                default : experienced in finding good houses
     *              idealTraits:
     *                type: string
     *                default : Homebuyer , Property dealer
     *     responses:
     *      201:
     *        description: A named array "personas" ; [] will contain three objects like the object shown in below example
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - personas
     *              properties:   
     *               personas:         
     *                type: array
     *                items:
     *                  type: object
     *                  required:
     *                   - heading
     *                   - name
     *                   - backgroud
     *                   - housing_needs
     *                   - other_requirements
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
     *                    creator:
     *                      type: string
     *                      default : userid comes here
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
     *                       default: Something went wrong, sometimes appended with generating data
     */
router.post("/generate", auth, generatePersonaValidation() , checkUser, generatePersonas);

/**
     * @openapi
     * /api/persona/edit/{personaid}:
     *  patch:
     *     parameters:
     *       - in: path
     *         name: personaid
     *         required: true
     *         type: string
     *         minimum: 1
     *         description: id of persona to edit
     *     tags:
     *     - Persona Controllers
     *     summary: edit persona 
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - name
     *              - background
     *              - housing_needs
     *              - other_requirements
     *            properties:
     *              name:
     *                type: string
     *                default: john & sarah
     *              background:
     *                type: string
     *                default: couples looking for a house
     *              housing_needs:
     *                type: string
     *                default : big house with good play area
     *              other_requirements:
     *                type: string
     *                default: Property dealer
     *     responses:
     *      201:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - persona
     *              properties:   
     *                persona:         
     *                  type: object
     *                  required:
     *                   - heading
     *                   - name
     *                   - backgroud
     *                   - housing_needs
     *                   - other_requirements
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
     *                    creator:
     *                      type: string
     *                      default : userid comes here
     *                    id:
     *                      type: string
     *                      default: iddd
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
     *                       default: No persona found / custom feild validation error
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
     *                       default: Something went wrong
     */

router.patch("/edit/:personsaid", auth, editPersonaValidation(), checkUser, editPersona);

/**
     * @openapi
     * /api/persona:
     *  get:
     *     tags:
     *     - Persona Controllers
     *     summary: Get all personas related to logged in user
     *     responses:
     *      200:
     *        content:
     *          application/json:
     *             schema:
     *              type: object
     *              required:
     *               - personas
     *              properties:   
     *                personas:         
     *                  type: array
     *                  items:
     *                   type: object
     *                   required:
     *                    - id
     *                    - heading
     *                    - name
     *                    - backgroud
     *                    - housing_needs
     *                    - other_requirements
     *                    - creator
     *                   properties:
     *                    id:
     *                      type: string
     *                      default: idddddd
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
     *                    creator:
     *                      type: string
     *                      default : userid comes here
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
     *                       default: No such user exists
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

router.get("/", auth, checkUser, getUserPersonas);

module.exports = router;

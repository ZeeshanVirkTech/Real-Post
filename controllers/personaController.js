const { useOpenAI, generateNewPersonas } = require("../utils/openAi");
const persona_model = require("../model/persona");
const { validationResult } = require("express-validator");

const generatePersonas = async (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  const userId = req.extractedUserId;
  const { idealTraits, name, cities, usp } = req.body;

  let response;
  try {
    const openai = useOpenAI();

     response = await generateNewPersonas(
      openai,
      idealTraits,
      name,
      cities,
      usp
    );
  } catch (err)  {
    const error = new Error(err);
    error.code = 500;
    return next(error);
  }
  
  let personas;
  if (response.personas?.personas) {
    personas = response.personas.personas.map((persona) => {
      return {
        heading: persona?.heading,
        name: persona?.full_name,
        background: persona?.background,
        housing_needs: persona?.housing_needs,
        other_requirements: persona?.other_requirements,
        creator: userId,
      };
    });
  } else if(response.personas) {
    personas = response.personas.map((persona) => {
      return {
        heading: persona?.heading,
        name: persona?.full_name,
        background: persona?.background,
        housing_needs: persona?.housing_needs,
        other_requirements: persona?.other_requirements,
        creator: userId,
      };
    });
  }

  else if(response) {
    personas = response.map((persona) => {
      return {
        heading: persona?.heading,
        name: persona?.full_name,
        background: persona?.background,
        housing_needs: persona?.housing_needs,
        other_requirements: persona?.other_requirements,
        creator: userId,
      };
    });
  }

  let newPersonas;
  try {
       newPersonas = await persona_model.insertMany(personas);
  } catch  {
    const error = new Error("Something went wrong generating data");
    error.code = 500;
    return next(error);
  }

  res.status(201).json({ personas : newPersonas.map((persona)=>persona.toObject({getters:true})) });
};

const editPersona = async (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.code = 400;
    return next(error);
  }

  
  const { personsaid } = req.params;
  const { name, background, housing_needs, other_requirements } = req.body;


  let persona;
  try {
    persona = await persona_model.findById(personsaid);
  } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  if (!persona.heading) {
    const error = new Error("No persona found");
    error.code = 400;
    return next(error);
  }

  if(req.extractedUserId!==persona?.creator?.toString())
  {
    const error = new Error("Unauthorized user access");
    error.code = 403;
    return next(error);
  }

  try {
    persona.name = name;
    persona.background = background;
    persona.housing_needs = housing_needs;
    persona.other_requirements = other_requirements;
    await persona.save();
  } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(201).json({ persona: persona.toObject({getters:true}) });
};

const getUserPersonas = async (req, res, next) => {
  const userId = req.extractedUserId;
  let userPersonas;
  try {
    userPersonas = await persona_model.find({ creator: userId });
  } catch {
    const error = new Error("Something went wrong");
    error.code = 500;
    return next(error);
  }

  res.status(200).json({
    personas: userPersonas.map((persna) => persna.toObject({ getters: true })),
  });
};

exports.generatePersonas = generatePersonas;
exports.editPersona = editPersona;
exports.getUserPersonas = getUserPersonas;

const openAI = require("openai");
const readlineSync = require("readline-sync");
require("dotenv").config();

const useOpenAI = () => {
  const openai = new openAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openai;
};

// New chat completion
const generateNewPersonas = async (openai, idealTraits, name, cities, usp) => {
  // const messages = idealTraits.map((trait, i) =>{
  //   return {
  //         role :"user" ,
  //         content :  `Generate a persona based on the data , full_name: ${name} , Ideal traits : ${trait}, City/Town: ${cities}, USP: ${usp}.
  //         Provide your response as a JSON object with the following schema where full_name is the referenced person/persons: {"full_name" : 'full name is the actual entity about whom we are writing persona so it should be priority in every field' , "background" : "about the full name" , "housing_needs" :"for full name" , "other_requirements" :"for full name" }  and no of personas depend upon no of ideal traits and dont seperate full_name in personas it should be same`
  //   }
  // }
  // );

  const content = `Generate a persona based on the data  , Ideal traits : ${idealTraits}, City/Town: ${cities}, USP: ${usp}.
        Provide your response as a JSON object with the following schema  { "heading" : "same as ideal trait to be used" ,full_name" : 'generate your own people names for this' , "background" : "about the full name" , "housing_needs" :"for full name" , "other_requirements" :"for full name" }  and no of personas generated should be 3 each with different ideal customer traits `;

  const responses = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: content }],
  });

  const personas = JSON.parse(responses.choices[0].message.content);
  console.log(personas)
  return personas;

  // }));

  //   return personas;
};

const generatePostContent = async (openai, persona, tone) => {
    const responses = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `  Generate description field as social media posts using  persona: ${persona}. Think of a challenge, fear, or concern this user persona would have being a ${persona.heading}. Write a short social media post about how i could help solve their challenge, fear, or concern. Make it 50 words or less. Make it sound in following tones${tone})."
            , also  generate heading field ,creator field : ${persona.creator} and keywords(array containing 3 keywords related to description) field too in json format : `,
        },
      ],
    });

    const content = JSON.parse(responses.choices[0].message.content);
    return content;

};

module.exports = { useOpenAI, generatePostContent, generateNewPersonas };
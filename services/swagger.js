const swaggerJsdoc =  require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Remuse app',
      description: 'Api documentation for remuse app',
      version: '1.0.0',
    },

    components : {
      securitySchemes : {
         bearerAuth : {
           type :"http" ,
           scheme : "bearer"
         }
      }
    },
    security : [
     {
       bearerAuth : []
     }
    ],
   // looks for configuration in specified directories
  },

  apis: ['./**/swagger-doc.yaml'],

}

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  // Swagger Page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  //Documentation in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}

module.exports = swaggerDocs;
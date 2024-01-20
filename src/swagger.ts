import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MyTrip API',
      version: '1.0.0',
      description: 'Api that access MyTrip database and return the relevant data for the request',
    },
  },
  apis: ['./src/api/posts/postRouter.ts',
         './src/api/messages/messageRoute.ts',
         './src/api/comments/commentsRoute.ts',
         './src/api/users/UserRoute.ts'], // path to our route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
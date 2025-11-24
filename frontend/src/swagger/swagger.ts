// We must use require() because swagger-jsdoc is a CommonJS module
const swaggerJsdoc = require("swagger-jsdoc");

export const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "API documentation for Account, Admin, Auth, Chat, and Usage endpoints."
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },

    // IMPORTANT: this path must match your real project structure
    apis: ["./src/app/api/**/*.ts"]
});

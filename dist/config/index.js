"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
require("dotenv/config");
const envVarsSchema = joi_1.default.object()
    .keys({
    NODE_ENV: joi_1.default.string()
        .valid("production", "development", "test")
        .required(),
    USER_SERVICE_PORT: joi_1.default.number().default(50051),
    USER_SERVICE_DATABASE: joi_1.default.string().required().description("Mongo DB url"),
    RABBITMQ_URL: joi_1.default.string().required().description("RabbitMQ url"),
})
    .unknown();
const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
const config = {
    env: envVars.NODE_ENV,
    port: envVars.USER_SERVICE_PORT,
    jwtSecret: envVars.JWT_SECERET,
    rabbitmq: {
        url: envVars.RABBITMQ_URL,
    },
    mongoose: {
        url: envVars.USER_SERVICE_DATABASE,
        options: {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        },
    },
};
exports.default = config;

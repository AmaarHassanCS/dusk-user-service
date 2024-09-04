"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventPublisher = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const grpc_js_1 = require("@grpc/grpc-js");
const config_1 = __importDefault(require("./config"));
const userService = __importStar(require("./services/customer.service"));
const user_1 = require("@amaarhassancs/dusk-protos/dist/proto/users/user");
const event_publisher_service_1 = require("./services/event-publisher.service");
const constants_1 = require("./constants");
exports.eventPublisher = new event_publisher_service_1.EventPublisher(constants_1.QUEUE_NAME, constants_1.USER_SERVICE_EXCHANGE, constants_1.ROUTING_KEY);
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // connect to mongoDB
            yield mongoose_1.default
                .connect(config_1.default.mongoose.url)
                .then(() => __awaiter(this, void 0, void 0, function* () {
                // connect to rabbit mq
                yield exports.eventPublisher.connectToRabbitMQ();
            }))
                .then(() => {
                // create and configure grpc server
                const server = new grpc_js_1.Server();
                server.addService(user_1.UserServiceService, Object.assign({}, userService));
                server.bindAsync(`0.0.0.0:${config_1.default.port}`, grpc_js_1.ServerCredentials.createInsecure(), (error, port) => {
                    if (error)
                        throw error;
                    console.log(`gRPC server running on port ${port}`);
                    // start the gRPC server
                    server.start();
                });
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
start();

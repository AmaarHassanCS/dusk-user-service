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
exports.generateVerifyToken = exports.registerCustomer = void 0;
const crypto = __importStar(require("crypto"));
const customer_model_1 = __importDefault(require("../models/customer.model"));
const jwt_service_1 = require("./jwt.service");
const response_handler_utils_1 = require("../utils/response-handler.utils");
const server_1 = require("../server");
const types_1 = require("../types");
const jwtService = new jwt_service_1.JwtService();
/**
 * @summary gRPC service implementation for User proto
 * Encode password, create customer obj
 * Create a verifiable token that can be used to verify the event
 * Create new customer
 * Publish event of customer creation
 * @param call
 * @param callback
 * @returns
 */
const registerCustomer = (call, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // encode pwd
        const password = jwtService.encodePassword(call.request.password);
        // formulate customer object
        const verifyTokens = (0, exports.generateVerifyToken)();
        const payload = Object.assign(Object.assign({}, call.request), { password, verifyToken: verifyTokens.hashedVerifyToken });
        // create customer
        const customer = yield customer_model_1.default.create(payload).then((data) => {
            return {
                id: data.id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role,
                phone: data.phone,
                isVerified: data.isVerified,
                // createdAt: data.createdAt,
                // updatedAt: data.updatedAt
            };
        });
        // publish event about customer creation
        const data = {
            id: customer.id,
            email: customer.email,
            name: customer.firstName,
            verifyToken: verifyTokens.verifyToken,
        };
        yield server_1.eventPublisher.publishEvent(types_1.EventTypes.VERIFY_CUSTOMER, data);
        return callback(null, (0, response_handler_utils_1.responseHandler)(customer));
    }
    catch (error) {
        return callback(null, (0, response_handler_utils_1.responseHandler)(error));
    }
});
exports.registerCustomer = registerCustomer;
/**
 * Generates a token, computes its has and returns both
 * @returns { verifyToken: string, hashedVerifyToken: string }
 */
const generateVerifyToken = () => {
    const verifyToken = crypto.randomBytes(32).toString("hex");
    return {
        verifyToken,
        hashedVerifyToken: crypto
            .createHash("sha256")
            .update(verifyToken)
            .digest("hex"),
    };
};
exports.generateVerifyToken = generateVerifyToken;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHash = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateHash = () => {
    // Generate a random string
    const randomString = Math.random().toString(36).substring(2);
    // Create a hash of the random string using SHA-256
    return crypto_1.default.createHash("sha256").update(randomString).digest("hex");
};
exports.generateHash = generateHash;

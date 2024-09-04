"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHandler = void 0;
const http_status_1 = __importDefault(require("http-status"));
const responseHandler = (err) => {
    let error = err;
    if (err instanceof Error) {
        if (err.message === `${http_status_1.default.NOT_FOUND}`) {
            return {
                statusCode: http_status_1.default.NOT_FOUND,
                message: "Record not found",
                data: {},
            };
        }
        if (err.message === `${http_status_1.default.BAD_REQUEST}`) {
            return {
                statusCode: http_status_1.default.BAD_REQUEST,
                message: "Invalid data provided, Please check and try again",
                data: {},
            };
        }
        if (error["code"] && error["code"].toString() === "11000") {
            const statusCode = http_status_1.default.BAD_REQUEST;
            const regex = /dup key: {\s*([^:]+)\s*:\s*"[^"]+"\s*}/;
            const match = error.message.match(regex);
            const duplicatedFieldKey = match ? match[1] : null;
            const message = `${duplicatedFieldKey} already exists`;
            return { statusCode, message, data: {} };
        }
        else {
            return {
                statusCode: 500,
                message: err.message || "Internal Server Error",
                data: {},
            };
        }
    }
    return { statusCode: 200, message: "success", data: Object.assign({}, err) };
};
exports.responseHandler = responseHandler;

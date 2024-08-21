import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import * as crypto from "crypto";
import {
  RegisterUserRequest,
  RegisterUserResponse,
  ServiceResponse,
} from "@amaarhassancs/dusk-protos/dist/proto/users/user";
import CustomerModel from "../models/customer.model";
import { JwtService } from "./jwt.service";
import { responseHandler } from "../utils/response-handler.utils";
import { eventPublisher } from "../server";
import { VerifyCustomerEventData } from "../interfaces";
import { EventTypes } from "../types";

const jwtService = new JwtService();

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
export const registerCustomer = async (
  call: ServerUnaryCall<RegisterUserRequest, RegisterUserResponse>,
  callback: sendUnaryData<ServiceResponse>
) => {
  try {
    // encode pwd
    const password = jwtService.encodePassword(call.request.password);

    // formulate customer object
    const verifyTokens = generateVerifyToken();
    const payload = {
      ...call.request,
      password,
      verifyToken: verifyTokens.hashedVerifyToken,
    };

    // create customer
    const customer = await CustomerModel.create(payload).then((data) => {
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
    const data: VerifyCustomerEventData = {
      id: customer.id,
      email: customer.email,
      name: customer.firstName,
      verifyToken: verifyTokens.verifyToken,
    };
    await eventPublisher.publishEvent<VerifyCustomerEventData>(
      EventTypes.VERIFY_CUSTOMER,
      data
    );

    return callback(null, responseHandler(customer));
  } catch (error) {
    return callback(null, responseHandler(error));
  }
};

/**
 * Generates a token, computes its has and returns both
 * @returns { verifyToken: string, hashedVerifyToken: string }
 */
export const generateVerifyToken = () => {
  const verifyToken = crypto.randomBytes(32).toString("hex");
  return {
    verifyToken,
    hashedVerifyToken: crypto
      .createHash("sha256")
      .update(verifyToken)
      .digest("hex"),
  };
};

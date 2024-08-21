import mongoose from "mongoose";
import { Server, ServerCredentials } from "@grpc/grpc-js";

import config from "./config";
import * as userService from "./services/customer.service";
import { UserServiceService } from "@amaarhassancs/dusk-protos/dist/proto/users/user";
import { EventPublisher } from "./services/event-publisher.service";
import { QUEUE_NAME, ROUTING_KEY, USER_SERVICE_EXCHANGE } from "./constants";

export const eventPublisher = new EventPublisher(
  QUEUE_NAME,
  USER_SERVICE_EXCHANGE,
  ROUTING_KEY
);

async function start() {
  try {
    // connect to mongoDB
    await mongoose
      .connect(config.mongoose.url)
      .then(async () => {
        // connect to rabbit mq
        await eventPublisher.connectToRabbitMQ();
      })
      .then(() => {
        // create and configure grpc server
        const server = new Server();
        server.addService(UserServiceService, { ...userService });

        server.bindAsync(
          `0.0.0.0:${config.port}`,
          ServerCredentials.createInsecure(),
          (error, port) => {
            if (error) throw error;
            console.log(`gRPC server running on port ${port}`);
            // start the gRPC server
            server.start();
          }
        );
      });
  } catch (error) {
    console.log(error);
  }
}

start();

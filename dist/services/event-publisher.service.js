"use strict";
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
exports.EventPublisher = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const config_1 = __importDefault(require("../config"));
class EventPublisher {
    constructor(queueName, userServiceExchange, routingKey) {
        this.queueName = queueName;
        this.exchangeName = userServiceExchange;
        this.routingKey = routingKey;
        this.connection = null;
        this.channel = null;
    }
    /**
     * Create connection with RabbitMQ
     * Create a channel with that connection
     * Create a queue inside that channel
     * Give an exchange_naem to that channel (for pub/sub)
     */
    connectToRabbitMQ() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.connection = yield amqplib_1.default.connect(config_1.default.rabbitmq.url);
                this.channel = yield this.connection.createChannel();
                yield this.channel.assertQueue(this.queueName, { durable: true });
                yield this.channel.assertExchange(this.exchangeName, "fanout", {
                    durable: true,
                });
                yield this.channel.bindQueue(this.queueName, this.exchangeName, "");
                console.log("Connected to RabbitMQ");
            }
            catch (error) {
                console.error("Error connecting to RabbitMQ", error);
            }
        });
    }
    /**
     * Publish the event to the channel of rmq
     * @param eventType
     * @param eventData
     */
    publishEvent(eventType, eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.channel) {
                try {
                    const data = { eventType, data: eventData };
                    this.channel.publish(this.exchangeName, this.routingKey, Buffer.from(JSON.stringify(data)), { persistent: true });
                }
                catch (error) {
                    console.error("Error publishing Event: ", error);
                }
            }
        });
    }
    closeConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connection) {
                yield this.connection.close();
                console.log("RabbitMQ connection closed");
            }
        });
    }
}
exports.EventPublisher = EventPublisher;

import amqp from "amqplib";
import config from "../config";
import { EventData, EventTypes } from "../types";

export class EventPublisher {
  private queueName: string;
  private routingKey: string;
  private exchangeName: string;
  private connection: amqp.Connection | null;
  private channel: amqp.Channel | null;

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
  async connectToRabbitMQ() {
    try {
      this.connection = await amqp.connect(config.rabbitmq.url);
      this.channel = await this.connection.createChannel();

      await this.channel.assertQueue(this.queueName, { durable: true });
      await this.channel.assertExchange(this.exchangeName, "fanout", {
        durable: true,
      });

      await this.channel.bindQueue(this.queueName, this.exchangeName, "");

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Error connecting to RabbitMQ", error);
    }
  }

  /**
   * Publish the event to the channel of rmq
   * @param eventType
   * @param eventData
   */
  async publishEvent<T>(eventType: EventTypes, eventData: T) {
    if (this.channel) {
      try {
        const data: EventData<T> = { eventType, data: eventData };
        this.channel.publish(
          this.exchangeName,
          this.routingKey,
          Buffer.from(JSON.stringify(data)),
          { persistent: true }
        );
      } catch (error) {
        console.error("Error publishing Event: ", error);
      }
    }
  }

  async closeConnection() {
    if (this.connection) {
      await this.connection.close();
      console.log("RabbitMQ connection closed");
    }
  }
}

import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitMQService {
  static readonly QUEUE_FILE = 'fileQueue';
  static readonly QUEUE_UPLOAD_RESULT = 'uploadResultQueue';

  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();
  }

  async sendToQueue(queue: string, message: any) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }

  async consume(queue: string, callback: (msg: ConsumeMessage) => void) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        callback(msg);
        this.channel.ack(msg);
      }
    });
  }

  async consumeById(
    queue: string,
    id: string,
    callback: (msg: ConsumeMessage) => void,
  ) {
    await this.channel.assertQueue(queue, { durable: true });
    this.channel.consume(queue, (msg) => {
      if (msg !== null) {
        const { messageId: receivedMessageId } = JSON.parse(
          msg.content.toString(),
        );
        if (receivedMessageId !== id) {
          return;
        }

        callback(msg);
        this.channel.ack(msg);
      }
    });
  }
}

const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'test',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

const run = async () => {
  await producer.connect();

  await producer.send({
    topic: 'test-topic',
    messages: [
      { key: 'x', value: 'v1' },
    ],
  });

  console.log('sent');
};

run().catch(console.error);
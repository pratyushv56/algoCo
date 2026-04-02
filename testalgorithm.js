const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'AlgoEngine',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
  groupId: 'AlgoEngine',
});

const run = async () => {
  await consumer.connect();
  console.log('Consumer connected');    


  await consumer.subscribe({
    topic: 'candles',
    fromBeginning: false, 
  });

  await consumer.run({ 
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      const value = message.value?.toString();
      const timestamp = message.timestamp;
        console.log(`Received message: key=${key}, value=${value}`);

        const candle = JSON.parse(value);

        const latency = Math.abs(Date.now() - timestamp);
        console.log('Latency = ', latency, 'ms');
    }
  
});




}

run();

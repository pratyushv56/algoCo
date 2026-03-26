const { Kafka } = require('kafkajs');



const processRawData = (rawdata) =>{

  candleEngine(rawdata);



}


const candleEngine = (rawdata) =>{

  const candle = {};

  
}













// 1. Create Kafka client
const kafka = new Kafka({
  clientId: 'processor',
  brokers: ['localhost:9092'],
});

// 2. Create consumer
const consumer = kafka.consumer({
  groupId: 'test-group',
});



const run = async () => {
  // 3. Connect
  await consumer.connect();
  console.log('Consumer connected');

  // 4. Subscribe
  await consumer.subscribe({
    topic: 'raw-trades',
    fromBeginning: false, //msgs from the point it starts.
  });

  // 5. Start consuming
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const key = message.key?.toString();
      const value = message.value?.toString();

      console.log('--- New Message ---');
      console.log({
        topic,
        partition,
        key,
        value,
      });
    },
  });
};




// 6. Run safely
run().catch(console.error);
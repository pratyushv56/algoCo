const { Kafka } = require('kafkajs');
const { createClient } = require('redis');



const REDIS_URL = 'redis://localhost:6379';
const kafkaBrokers = ['localhost:9092']; // Update with your Kafka broker addresses if different

const redis = createClient({
  url: REDIS_URL,
});

const kafka = new Kafka({
  clientId: 'kafka-to-redis',
  brokers: kafkaBrokers,
});

const consumer = kafka.consumer({
  groupId: 'kafka-to-redis',
});

const run = async () => {

    await redis.connect();
    console.log('Connected to Redis');

 await consumer.connect();
  console.log('Consumer connected');    


  await consumer.subscribe({
    topic: 'signals',   //kafka topic to which algos publish signals
    fromBeginning: false, 
  });

  await consumer.run({ 
    eachMessage: async ({ topic, partition, message }) => {


      
        const key = message.key?.toString(); // 
        const value = message.value?.toString();

        const valueParsed = JSON.parse(value);
        const signal = valueParsed.signal

        console.log(`Received message: key=${key}, value=${value}`);

        const channel = `signals-${key}`; // Redis channel for this ticker...all signals for this ticker will be published to this channel..algo filtering at frontend.

        // Publish the signal to Redis Pub/Sub
        await redis.publish(channel, value);
        console.log(`Published signal for ${key} to Redis channel ${channel}`);


        
    }
  
});




}

run();

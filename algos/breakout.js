const { Kafka } = require('kafkajs');
const { createClient } = require('redis');



const kafka = new Kafka({
  clientId: 'algorithm',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({
  groupId: 'algorithm',
});
const producer = kafka.producer();

const run = async () => {
   await producer.connect();
   console.log('Producer connected');
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

        breakout(candle,key);
        

        const latency = Math.abs(Date.now() - timestamp);
        console.log('Latency = ', latency, 'ms');
    }
  
});




}




const produce = async (message) => {
 


  const ticker = message.ticker;

  await producer.send({
    topic: 'signals',
    messages: [
      { key: ticker, value: JSON.stringify(message) },
    ],
  });

}



let previousHigh = null;
let previousLow = null;
let previousClose = null;


const breakout = (candle,key) => {
  const { open, high, low, close } = candle;

  if(previousHigh==null || previousLow==null || previousClose==null){
    previousHigh = high;
    previousLow = low;
    previousClose = close;
    return;
  }

  else{
    if(close > previousHigh){
      console.log('Breakout to the upside detected!');
      produce({
        ticker: key,
        signal: "BREAKOUT_UP",
        price: candle.close
  });

    previousHiigh = high;
    previousLow = low;
    previousClose = close;
      
    }
    else if(close < previousLow){
      console.log('Breakout to the downside detected!');
      produce({
        ticker: key,
        signal: "BREAKOUT_DOWN",
         price: candle.close
    });

    previousHiigh = high;
    previousLow = low;
    previousClose = close;
    }
    else{
      console.log('No breakout detected.');
        produce({
        ticker: key,
        signal: "No_BREAKOUT",
         price: candle.close
    });
    previousHiigh = high;
    previousLow = low;
    previousClose = close;
    }
  }
}
 

run();

const { Kafka } = require('kafkajs');



 // 1. Create Kafka client
const kafka = new Kafka({
  clientId: 'processor',
  brokers: ['localhost:9092'],
});

// 2. Create consumer
const consumer = kafka.consumer({
  groupId: 'raw-data-consumers',
});

const producer = kafka.producer();


 
 const pushCandle = (symbol,candle) =>{
  producer.send({
    topic:'candles',
    messages:[{ 
      
    key: symbol,
  
    value: JSON.stringify({  //all  this just to include the symbol here again. otherwise JSON.stringify(candle) works
      symbol,
      window: candle.window,
      windowSize: candle.windowSize,
      open: candle.open,
      close: candle.close,
      high: candle.high,
      low: candle.low,
      volume: candle.volume,
      lastTradeTime: candle.lastTradeTime,
      initialTime: candle.initialTime,
    }),

    timestamp: Date.now(),
  
  }]
    }).catch(error => {
      console.error('Error sending candle to Kafka:', error);
      // Optionally, implement retry logic here
    });

}

const run = async () => {
  // 3. Connect

   await producer.connect();
  console.log('Producer connected');


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

      processRawData(JSON.parse(value));  //processing the raw data to generate candles...this is where the magic happens :)

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







const processRawData = (rawdata) =>{

  candleEngine(rawdata);
  //more engines go here

}




const candles = {};



const candleSize = 2000;


const candleEngine = (rawdata) =>{

  const currTime = Number(rawdata.T);

  const currWindowIndex = Math.floor(currTime / candleSize);

  const windowStartTime = currWindowIndex * candleSize;

  const symbol = rawdata.s;

  const currPrice = Number(rawdata.p);

  const currQuantity = Number(rawdata.q);



 if(!candles[symbol]){  //handles if first trade for a symbol..
   candles[symbol] = {

    window: windowStartTime,
   
    windowSize: candleSize,
    open:  currPrice,
    close: currPrice,
    high: currPrice,
    low: currPrice,
    volume: currQuantity,

    lastTradeTime: currTime,

   }
    
    return;
  }


  const currentCandle = candles[symbol];

  if(currentCandle.window===windowStartTime){ //if the current trade falls into the same candle window..update the existing candle.
  
    currentCandle.close = currPrice;
    currentCandle.volume += currQuantity; //add current trade quantity to this candle's volume

    currentCandle.high = Math.max(currentCandle.high, currPrice);
    currentCandle.low = Math.min(currentCandle.low, currPrice);
    currentCandle.lastTradeTime = currTime;
  }

  else { //new candle
    

    pushCandle(symbol, currentCandle); //push the completed candle to kafka...we can also store it in a database if needed.
    
    console.log('candle pushed');

    candles[symbol] = {

      window: windowStartTime,
      
      windowSize: candleSize,
      open: currPrice,
      close: currPrice,
      high: currPrice,
      low: currPrice,
      volume: currQuantity,
      lastTradeTime: currTime,
     };
  }
    
    //push the completed candle to kafka...we can also store it in a database if needed.
  
  
  }

  process.on('SIGINT', async () => {
  console.log('Disconnecting consumer and producer...');
  await consumer.disconnect();
  await producer.disconnect();
  process.exit(0);
});
 

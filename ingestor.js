
const express = require('express');

const { Kafka } = require('kafkajs');


const kafka = new Kafka({
    clientId: 'ingestor',
    brokers: ['localhost:9092'],
});

const producer = kafka.producer();



const connectProducer = async()=>{  //will use this at the time of initialization and if needed to reconnect.
    await producer.connect();
}



const placeOnKafka = (data) =>{

  
    producer.send({  //not awaiting to avoid bottlenecking the stream...this is fire-and-forget
        topic:'raw-trades',
        messages:[{
            key:data.s, //symbol s as key...its already a string
            value: JSON.stringify(data)
        }]
        } );

    
    }


    






const server = express();
const port = 3000;

const webSocket = require('ws');

let currStream = 'btcusdt@trade';

let ws = null;




let url = `wss://stream.binance.com:9443/ws/${currStream}`;



function getStreamData(url) {

    if (ws) {
        console.log('Closing existing WebSocket connection');
        ws.close();
    }

    ws = new webSocket(url);

    ws.on('open', () => {
        console.log('Connected to Binance');
    });

    ws.on('message', (data) => {
        
        const parsed = JSON.parse(data.toString());
        placeOnKafka(parsed);
            



        console.log('Trade data:', parsed);
    });

    ws.on('error', (err) => {
        console.error('Error:', err);
    });

    // Handle close
    ws.on('close', () => {
        console.log('Connection closed');

    });

}




const initialize = async()=>{
    await connectProducer();
    console.log('Producer connected');

    getStreamData(url);
    console.log('WebSocket connection established');

    server.listen(port, () => {
    console.log(`Test server is running on http://localhost:${port}`);
});
}

initialize();


server.use(express.json());

server.put('/updateStream', (req, res) => {
    const { streamName } = req.body;
    if (!streamName) {
        return res.status(400).json({ error: 'streamName is required' });
    }
    currStream = streamName;
    url = `wss://stream.binance.com:9443/ws/${currStream}`;

    console.log(`Updating stream to ${currStream}`);

    getStreamData(url);
    res.json({ message: `Stream updated to ${currStream}` });
});

server.get('/test', (req, res) => {
    res.json({ message: 'Hello from the test server!' });
});




process.on('SIGINT', async () => {  //ctrl+c handling
    console.log('Shutting down...');
    await producer.disconnect();
    if (ws) ws.close();
    process.exit(0);
});


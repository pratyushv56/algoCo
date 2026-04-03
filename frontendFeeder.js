const {createClient} = require('redis');
const express = require('express');

const server = express();
const port = process.env.PORT || 3000;

const WebSocket = require('ws');

const ws = new WebSocket("ws://localhost:8080");

ws.


const currentTicker = "BTCUSDT"; // Example ticker, can be dynamic based on user selection


const redisURL = 'redis://localhost:6379';



const redis = createClient({
  url: redisURL,
});


redis.on('error', (err) => console.error('Redis Client Error', err));



const run = async ()=>{
    await redis.connect(); 
    console.log('Connected to Redis');

    await redis.subscribe(`signals-${currentTicker}`, (message, channel) => {
        console.log(`Received message from channel ${channel}: ${message}`);
        const signal = JSON.parse(message);
        // Here you can add code to update the frontend UI based on the received signal
    });

}

run();




server.get('/', (req, res) => {
    res.send('Frontend Feeder is running');
});



server.listen(port, () => {
    console.log(`Frontend feeder server is running on port ${port}`);
});


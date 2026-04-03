const {createClient} = require('redis');
const express = require('express');

const app = express();
const port = process.env.PORT || 7000;

const http = require('http');
const server = http.createServer(app);

const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });


const clients = new Set(); //set stores connected clients in form of their websockets


wss.on('connection', (ws) => {
    console.log('Client connected');

    clients.add(ws); // Add the new client to the set

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });
});



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

        console.log('number of clients:', clients.size);

          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {   //ws.readyState is a number that represents state of connection. open, close, connecting etc each have a number...we check if readyState has the number representing open
                client.send(JSON.stringify(signal));
                console.log('Sent signal to client:', signal);
            }
        // Here you can add code to update the frontend UI based on the received signal
    });

});
}

run();










server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
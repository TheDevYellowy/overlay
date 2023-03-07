const Client = require('./classes/Client');
const Author = require('./classes/Author');
const Message = require('./classes/Message');

const { WebSocket, WebSocketServer } = require('ws');

const clients = {
    /** @type {WebSocket | null} */
    'message': null,
    /** @type {WebSocket | null} */
    'alerts': null
};

const wss = new WebSocketServer({ port: 2020 });

wss.on('listening', () => require('./backend/backend'));

wss.on('connection', (socket, _) => {
    socket.once('message', (data, _) => {
        switch(data.toString().toLowerCase()) {
            case 'chatbox':
                clients.message = socket;
                break;
            case 'alerts':
                clients.alerts = socket;
                break;
            case 'chatbox_closed':
                clients.message = null;
                console.log('chatbox close');
                break;
            default: break;
        }
    });
});

const client = new Client();

client.on('message', async (channel, userstate, content) => {
    const message = new Message(userstate, content);
    const author = new Author(userstate, client, channel);
    const username = author.displayName;
    const color = userstate.color;
    const urls = await client.getBadges(channel, author.badges);
    if(clients.message !== null) clients.message.send(JSON.stringify({ event: 'message', badges: urls, username, color, message }));
});

client.connect();
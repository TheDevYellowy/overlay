const Client = require('./classes/Client');
const Author = require('./classes/Author');
const Message = require('./classes/Message');
const Follower = require('./classes/Follower');

const client = new Client();

client.wss.on('listening', () => require('./backend/backend'));

client.wss.on('connection', (socket, _) => {
    socket.once('message', (data, _) => {
        switch(data.toString().toLowerCase()) {
            case 'chatbox':
                client.ws.message = socket;
                break;
            case 'alerts':
                client.ws.alerts = socket;
                break;
            case 'chatbox_closed':
                client.ws.message = null;
                console.log('chatbox close');
                break;
            default: break;
        }
    });
});

client.on('message', async (channel, userstate, content) => {
    const message = new Message(userstate, content);
    const author = new Author(userstate, client, channel);

    const username = author.displayName;
    const color = userstate.color;
    const urls = await client.getBadges(channel, author.badges);
    if(client.ws.message !== null) client.ws.message.send(JSON.stringify({ event: 'message', badges: urls, username, color, message }));
});

client.events.on('follow', (userstate) => {
    const user = new Follower(userstate);

    console.log(user);
});

client.connect();
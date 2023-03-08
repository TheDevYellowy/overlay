startup();

const Client = require('./classes/Client');
const Author = require('./classes/Author');
const Message = require('./classes/Message');
const Follower = require('./classes/Follower');
const Subscription = require('./classes/Subscription');

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

client.on('subscription', (channel, username, methods, message, userstate) => {
    const plan = new Subscription(methods).plan;
    const data = JSON.stringify({
        event: 'subscription',
        data: {
            plan,
            username
        }
    });

    if(client.ws.alerts !== null) client.ws.alerts.send(data);
});

client.events.on('follow', (userstate) => {
    const user = new Follower(userstate);

    const data = JSON.stringify({
        event: 'follow',
        data: user
    })
    if(client.ws.alerts !== null) client.ws.alerts.send(data);
});

client.connect();

function startup() {
    let fs = require('node:fs');
    let baseConfig = {
        channel: "",
        client_id: "",
        client_secret: "",
        token: {
            access_token: "",
            expires_in: 0,
            token_type: ""
        }
    }
    try {
        require('./config.json');
    } catch (_) {
        fs.writeFileSync('./config.json', JSON.stringify(baseConfig, null, 4));
        process.exit();
    }

    delete require.cache[require('./config.json')]
}
const { WebSocket } = require('ws');
const { EventEmitter } = require('node:events');
const Client = require('../classes/Client');

const { post } = require('./api');
const channel = require('../config.json').channel;

const td = new TextDecoder();

class EventSub extends EventEmitter {
    /** @param {Client} client */
    constructor(client) {
        super();

        this.client = client;

        /** @type {?WebSocket} */
        this.connection = null;
        this.connectedAt = null;
        this.id = null;
    }

    connect() {
        if(this.connection?.readyState === WebSocket.OPEN) return Promise.resolve();

        const connURL = 'wss://eventsub-beta.wss.twitch.tv/ws';
        return new Promise((resolve, reject) => {
            this.connectedAt = Date.now();

            const ws = (this.connection = new WebSocket(connURL));

            ws.onopen = this.onOpen.bind(this);
            ws.onmessage = this.onMessage.bind(this);
        })
    }

    onOpen() {
        this.debug(`[CONNECTED] took ${Date.now() - this.connectedAt}ms`);
    }

    onMessage({ data }) {
        let raw;
        if(data instanceof ArrayBuffer) data = new Uint8Array(data);
        raw = data;
        if(typeof raw !== 'string') raw = td.decode(raw);
        let packet = JSON.parse(raw);
        this.emit('raw', packet);

        this.onPacket(packet);
    }

    async onPacket(packet) {
        if(!packet) {
            this.debug(`Recieved broken packet: ${packet}`);
            return;
        }

        if(packet.metadata.message_type == 'session_welcome') {
            this.id = packet.payload.session.id;
            await this.subscribe();
        }
        if(packet.metadata.message_type == 'session_reconnect') {
            this.connection = new WebSocket(packet.payload.session.reconnect_url)
        }

        switch(packet.metadata?.subscription_type) {
            case 'channel.follow':
                this.emit('follow', packet.payload.subscription.event);
                break;
        }
    }

    async subscribe() {
        let id = await this.client.usernameToId(channel);
        let res = await post('eventsub/subscriptions', {
            'Content-Type': 'application/json'
        }, JSON.stringify({
            type: 'channel.follow',
            version: 1,
            condition: {
                'broadcaster_user_id': id
            },
            transport: {
                method: 'websocket',
                session_id: this.id
            }
        }));

        if(res == 200) return true;
        else return false;
    }

    debug(message) {
        this.emit('debug', message);
    }
}

module.exports = EventSub;
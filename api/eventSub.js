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

        this.connect();
    }

    /** @private */
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

    /** @private */
    onOpen() {
        this.debug(`[CONNECTED] took ${Date.now() - this.connectedAt}ms`);
    }

    /** @private */
    onMessage({ data }) {
        let raw;
        if(data instanceof ArrayBuffer) data = new Uint8Array(data);
        raw = data;
        if(typeof raw !== 'string') raw = td.decode(raw);
        let packet = JSON.parse(raw);
        this.emit('raw', packet);

        this.onPacket(packet);
    }

    /** @private */
    async onPacket(packet) {
        if(!packet) {
            this.debug(`Recieved broken packet: ${packet}`);
            return;
        }

        if(packet.metadata.message_type == 'session_welcome') {
            this.id = packet.payload.session.id;
            [
                {name: 'channel.follow', v: 2 }
            ].forEach(async event => await this.subscribe(event.name, event.v));
        }
        if(packet.metadata.message_type == 'session_reconnect') {
            this.connection = new WebSocket(packet.payload.session.reconnect_url);
        }

        switch(packet.metadata?.subscription_type) {
            case 'channel.follow':
                this.emit('follow', packet.payload.event);
                this.debug('[EVENTS] Recieved channel.follow event');
                break;
        }
    }

    /**
     * Subscribe to an event
     * @param {string} event The event name you want to connect to
     * @param {number} v The version the event is on
     * @returns {boolean}
     * 
     * @private
     */
    async subscribe(event, v) {
        let id = await this.client.usernameToId(channel);

        const headers = {
            "Content-Type": "application/json"
        }
        const body = {
            "type": event,
            "version": `${v}`,
            "condition": {
                "broadcaster_user_id": id,
                "moderator_user_id": id
            },
            "transport": {
                "method": "websocket",
                "session_id": this.id
            }
        };

        this.debug(`[SUBSCRIBE] creating a event subscription for the following event ${body.type}`);

        let res = await post('eventsub/subscriptions', headers, body);

        this.debug(`[SUBSCRIBE] request returned with a status of ${res.status}`);

        if(res.status == 202) return true;
        else if(res.status == 400) return console.log(await res.json());
        else return false;
    }

    debug(message) {
        this.emit('debug', message);
    }
}

module.exports = EventSub;
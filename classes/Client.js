const { Client } = require('tmi.js');
const api = require('../api/api');
const eventSub = require('../api/eventSub');
const channel = require('../config.json').channel;
const { WebSocket, WebSocketServer } = require('ws')

const bits = {
    1: 0,
    100: 1,
    1000: 2,
    10000: 3,
    100000: 4,
    1000000: 5,
    1250000: 6,
    1500000: 7,
    1750000: 8,
    200000: 9,
    2000000: 10,
    25000: 11,
    2500000: 12,
    300000: 13,
    3000000: 14,
    3500000: 15,
    400000: 16,
    4000000: 17,
    4500000: 18,
    5000: 19,
    50000: 20,
    500000: 21,
    5000000: 22,
    600000: 23,
    700000: 24,
    75000: 25,
    800000: 26,
    900000: 27
}

module.exports = class extends Client {
    constructor() {
        super({ channels: [channel] });
        this.api = api;
        this.events = new eventSub(this);

        this.ids = {};
        this.globalBadges = {};
        this.channelBadges = {};

        this.wss = new WebSocketServer({ port: 2020 });
        this.ws = {
            /** @type {WebSocket | null} */
            message: null,
            /** @type {WebSocket | null} */
            alerts: null
        }
    }

    /**
     * Get the id of a user from the username
     * @param {string} name The name of the user in lowercase
     * @returns {Promise<string>}
     */
    async usernameToId(name) {
        if(typeof this.ids[name] == 'string') return this.ids[name];

        let res = await this.api.get(`users?login=${name}`);
        let data = res.data[0];
        this.ids[name] = data.id;
        return data.id;
    }

    /**
     * @param {string} channel The channel to get badges from
     * @param {{name: number}} badges The badges the user has
     * @returns {Promise<string[]>}
     */
    async getBadges(channel, badges) {
        if(this.globalBadges['broadcaster'] == null) {
            const res = await this.api.get('chat/badges/global');
            res.data.forEach(badge => {
                let id = badge.set_id;
                let versions = badge.versions;
                this.globalBadges[id] = versions;
            });
        }

        if(this.channelBadges[channel] == null) {
            let name;
            if(channel.startsWith('#')) name = channel.split('#')[1];
            else name = channel;
            const id = await this.usernameToId(name);
            const res = await this.api.get(`chat/badges?broadcaster_id=${id}`);
            if(res.error) return console.error(res.error);
            if(res.data == []) this.channelBadges[channel] = null;
            else {
                res.data.forEach(badge => {
                    let id = badge.set_id;
                    let versions = badgs.versions;
                    this.channelBadges[channel][id] = versions;
                });
            }
        }

        var urls = [];
        if(this.channelBadges[channel] == null) {
            for (const key in badges) {
                let i = Number(badges[key]);

                if(key === 'bits') i = bits[i];
                else if(i != 0) i--;

                let versions = this.globalBadges[key];
                urls.push(versions[i].image_url_1x);
            }
        } else {
            for (const key in badges) {
                let i = Number(badges[key]);
                if(this.channelBadges[channel][key] == null) {
                    if(key === 'bits') i = bits[i];
                    else if(i != 0) i--;

                    let versions = this.globalBadges[key];
                    urls.push(versions[i].image_url_1x);
                } else {
                   if(key === 'bits') i = bits[i];
                    else if(i != 0) i--;
                    
                    let versions = this.channelBadges[channel][key];
                    urls.push(versions[i].image_url_1x);
                }
            }
        }

        return urls;
    }
}
const { Client } = require('tmi.js');
const api = require('../api');

module.exports = class extends Client {
    constructor() {
        super({ channels: ['yellowy___', 'julia5e'] });
        this.api = api;
        this.ids = {};
        this.globalBadges = {};
        this.channelBadges = {};
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
                let versions = this.globalBadges[key];
                if(i != 0) i--;
                urls.push(versions[i].image_url_1x);
            }
        } else {
            for (const key in badges) {
                let i = Number(badges[key]);
                if(this.channelBadges[channel][key] == null) {
                    let versions = this.globalBadges[key];
                    if(i != 0) i--;
                    urls.push(versions[i].image_url_1x);
                } else {
                    let versions = this.channelBadges[channel][key];
                    if(i != 0) i--;
                    urls.push(versions[i].image_url_1x);
                }
            }
        }

        return urls;
    }
}
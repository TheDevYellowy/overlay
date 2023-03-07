class Author {
    constructor(context, client, channel) {
        this.client = client;
        this.channel = channel;
        this.badges = context.badges;
        this.broadcaster = (this.badges?.broadcaster == '1');
        this.badgesRaw = context['badges-raw'];
        this.badgeInfo = context['badge-info'];
        this.badgeInfoRaw = context['badge-info-raw'];
        this.displayName = context['display-name'];
        this.id = context['user-id'];
        this.mod = context.mod;
        this.subscriber = context.subscriber;
        this.userType = context['user-type'];
        this.username = context.username || this.displayName.toLowerCase();

        if (!this.id && this.username === 'xiix') {
            this.id = this.username;
        }
        if (this.broadcaster) {
            this.mod = true;
            this.subscriber = true;
        };
    }
}

module.exports = Author;
module.exports = class Follower {
    constructor(userstate) {
        this.id = userstate['user_id'];
        this.login = userstate['user_login'];
        this.name = userstate['user_name'];

        this.followedAt = userstate['followed_at'];
    }
}
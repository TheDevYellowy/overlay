class Message {
    constructor(state, message) {
        this.id = state['id'];
        this.type = state['message-type'];
        
        this.content = message;
    }
}

module.exports = Message;

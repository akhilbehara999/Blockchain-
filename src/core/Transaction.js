export class Transaction {
    constructor(sender, receiver, amount) {
        this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        this.sender = sender;
        this.receiver = receiver;
        this.amount = parseFloat(amount);
        this.timestamp = new Date().toISOString();
    }
}

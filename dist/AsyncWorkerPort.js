export default class AsyncWorkerPort {
    constructor(messagePort) {
        this.messagePort = messagePort;
        this.cache = [];
        this.currentId = 0;
        this.messagePort.onmessage = (message) => this.handleMessage(message);
    }
    get nextId() {
        this.currentId++;
        return this.currentId;
    }
    savePromise(resolve, reject, messageId) {
        this.cache.push({ resolve, reject, messageId: messageId });
    }
    handleMessage(message) {
        const savedMessage = this.cache.find((promiseData) => promiseData.messageId === message.data.messageId);
        if (!savedMessage) {
            return;
        }
        savedMessage.resolve(message.data.body);
    }
    postMessage(data) {
        const messageId = this.nextId;
        return new Promise((resolve, reject) => {
            this.savePromise(resolve, reject, messageId);
            this.messagePort.postMessage({ body: data, messageId });
        });
    }
}

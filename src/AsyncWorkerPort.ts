interface PromiseData {
  resolve: Function;
  reject: Function,
  messageId: number;
}

export default class AsyncWorkerPort {
  private cache: PromiseData[] = [];
  private currentId: number = 0;
  constructor(private messagePort: MessagePort) {
    this.messagePort.onmessage = (message: any) => this.handleMessage(message);
  }

  private get nextId() {
    this.currentId++;
    return this.currentId;
  }

  private savePromise(resolve: Function, reject: Function, messageId: number): void {
    this.cache.push({resolve, reject, messageId: messageId});
  }

  private handleMessage(message: { data: { body: any, messageId: number }}) {
    const savedMessage = this.cache.find((promiseData) => promiseData.messageId === message.data.messageId);
    if (!savedMessage) {
      return;
    }
    savedMessage.resolve(message.data.body);
  }

  public postMessage<T>(data: any): Promise<T> {
    const messageId = this.nextId;
    return new Promise((resolve, reject) => {
      this.savePromise(resolve, reject, messageId);
      this.messagePort.postMessage({body: data, messageId});
    });
  }
}
export default class Plug {
    constructor({ rackModule, param, position, name = null, type = 'in', radius = 10, channel = undefined, }) {
        this.module = rackModule;
        this.param = param;
        this.position = position;
        this.name = name;
        this.radius = radius;
        this.type = type;
        this.channel = channel;
    }
    disconnect(plug) {
        // @ts-ignore
        this.param.disconnect(plug.param);
    }
    connect(plug) {
        if (this.type === plug.type) {
            alert('You cannot connect two plugs of the same type');
            throw 'You cannot connect two plugs of the same type';
            return;
        }
        if (this.type === 'in' && plug.type === 'out') {
            plug.connect(this);
            return;
        }
        if (this.param instanceof AudioNode) {
            // @ts-ignore
            this.param.connect(plug.param, this.channel);
            return;
        }
        // @ts-ignore
        this.param.connect(plug.param);
    }
}

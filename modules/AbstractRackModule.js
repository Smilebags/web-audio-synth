import Plug from "../Plug.js";
import { distance } from "../util.js";
;
export default class AbstractRackModule {
    constructor() {
        this.width = 100;
        this.plugs = [];
        this.labels = [];
        this.name = null;
        this.eventListeners = {};
    }
    getPlugAtPosition(pos) {
        return this.plugs.find(plug => {
            return distance(pos, plug.position) <= plug.radius;
        }) || null;
    }
    onMousedown(position) {
        this.emit('mousedown', position);
    }
    onMousemove(position) {
        this.emit('mousemove', position);
    }
    onMouseup(position) {
        this.emit('mouseup', position);
    }
    addPlug(param, name, type, order = null) {
        const slot = order !== null ? order : this.plugs.length;
        const position = {
            x: this.width / 2,
            y: (slot * 50) + 50,
        };
        this.plugs.push(new Plug(this, param, position, name, type));
    }
    addLabel(label) {
        const defaultLabel = {
            getText: () => '',
            position: { x: 0, y: 0 },
            align: 'left',
        };
        this.labels.push({
            ...defaultLabel,
            ...label,
        });
    }
    renderButton(renderContext, position, size, text, enabled) {
        renderContext.save();
        renderContext.fillStyle = enabled ? '#d08030' : '#504030';
        renderContext.fillRect(position.x, position.y, size.x, size.y);
        renderContext.textAlign = 'center';
        renderContext.fillStyle = '#ffffffc0';
        renderContext.font = "14px Arial";
        renderContext.fillText(text, position.x + (0.5 * size.x), position.y + (0.5 * size.y) + 7);
        renderContext.restore();
    }
    renderDial(renderContext, pos, radius, angle, text) {
        renderContext.save();
        renderContext.fillStyle = '#303030';
        renderContext.beginPath();
        renderContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        renderContext.fill();
        renderContext.strokeStyle = '#404040';
        renderContext.lineWidth = radius / 10;
        renderContext.beginPath();
        renderContext.moveTo(pos.x, 350);
        const offset = {
            x: Math.sin(angle) * 40,
            y: Math.cos(angle) * 40,
        };
        renderContext.lineTo((pos.x) + offset.x, 350 - offset.y);
        renderContext.stroke();
        this.renderLabel(renderContext, {
            getText: () => text,
            position: { x: pos.x, y: pos.y + 5 },
            align: 'center',
        });
        renderContext.restore();
    }
    renderLabel(renderContext, label) {
        const text = label.getText();
        renderContext.save();
        renderContext.textAlign = label.align;
        renderContext.fillStyle = '#ffffff';
        renderContext.font = "16px Arial";
        renderContext.fillText(text, label.position.x, label.position.y);
        renderContext.restore();
    }
    render(renderContext) {
        renderContext.textAlign = "center";
        renderContext.fillStyle = '#ffffff';
        renderContext.font = "16px Arial";
        renderContext.fillText(this.name || this.type, this.width / 2, 20);
        renderContext.font = "12px Arial";
        this.plugs.forEach((plug, index) => {
            renderContext.fillStyle = '#ffffff';
            renderContext.fillText(plug.name || '', this.width / 2, plug.position.y - plug.radius - 4);
            renderContext.beginPath();
            renderContext.fillStyle = plug.type === 'in' ? '#101010' : '#181818';
            renderContext.arc(plug.position.x, plug.position.y, plug.radius, 0, 2 * Math.PI);
            renderContext.fill();
        });
        this.labels.forEach((label) => {
            this.renderLabel(renderContext, label);
        });
    }
    emit(eventName, eventValue) {
        if (!this.eventListeners[eventName]) {
            return;
        }
        this.eventListeners[eventName].forEach(callback => callback(eventValue));
    }
    removeEventListener(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            return;
        }
        const callbackIndex = this.eventListeners[eventName].indexOf(callback);
        if (callbackIndex === -1) {
            return;
        }
        this.eventListeners[eventName].splice(callbackIndex, 1);
    }
    addEventListener(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
}

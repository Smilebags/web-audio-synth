import Plug from "../Plug.js";
import { distance, clamp } from "../util.js";
;
export default class AbstractRackModule {
    constructor() {
        this.width = 100;
        this.plugs = [];
        this.labels = [];
        this.dials = [];
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
    getYPositionFromOrder(order = null) {
        const slot = order !== null ? order : this.firstAvailablePlugSlot;
        return (slot * 45) + 55;
    }
    getDialParamFromPosition(pos) {
        const foundDial = this.dials.find((dial) => {
            return distance(dial.pos, pos) <= dial.radius;
        });
        if (!foundDial) {
            return null;
        }
        return foundDial.param;
    }
    addDialPlugAndLabel(plugParam, dialParam, name, type, label, order = null) {
        const dialPos = {
            x: 20,
            y: this.getYPositionFromOrder(order),
        };
        this.addDial(dialPos, 12, dialParam);
        const labelPos = {
            x: 90,
            y: this.getYPositionFromOrder(order) + 5,
        };
        this.addLabel({
            getText: label,
            position: labelPos,
            align: 'right',
        });
        this.addPlug(plugParam, name, type, order);
    }
    addDial(pos, radius, param) {
        this.dials.push({ pos, radius, param });
    }
    addPlug(param, name, type, order = null, positioning = 'center') {
        let positioningOffset = 0;
        if (positioning !== 'center') {
            const offsetAmount = this.width / 6;
            positioningOffset += positioning === 'left' ? -offsetAmount : offsetAmount;
        }
        const xPosition = (this.width / 2) + positioningOffset;
        const yPosition = this.getYPositionFromOrder(order);
        const position = {
            x: xPosition,
            y: yPosition,
        };
        this.plugs.push(new Plug(this, param, position, name, type));
    }
    get firstAvailablePlugSlot() {
        return this.plugs.length;
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
        renderContext.moveTo(pos.x, pos.y);
        const offset = {
            x: Math.sin(angle) * radius,
            y: Math.cos(angle) * radius,
        };
        renderContext.lineTo((pos.x) + offset.x, pos.y - offset.y);
        renderContext.stroke();
        this.renderLabel(renderContext, {
            getText: () => text,
            position: { x: pos.x, y: pos.y + 5 },
            align: 'center',
        });
        renderContext.restore();
    }
    renderLed(renderContext, pos, radius, level) {
        renderContext.save();
        renderContext.fillStyle = '#301210';
        renderContext.beginPath();
        renderContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        renderContext.fill();
        renderContext.fillStyle = '#b01510';
        renderContext.globalAlpha = clamp(level);
        renderContext.beginPath();
        renderContext.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        renderContext.fill();
        renderContext.restore();
    }
    renderLabel(renderContext, label) {
        const text = label.getText();
        renderContext.save();
        renderContext.textAlign = label.align;
        renderContext.fillStyle = '#ffffff';
        renderContext.font = "10px Arial";
        renderContext.fillText(text, label.position.x, label.position.y);
        renderContext.restore();
    }
    renderPlug(renderContext, plug) {
        renderContext.fillStyle = '#ffffff';
        renderContext.fillText(plug.name || '', plug.position.x, plug.position.y - plug.radius - 4);
        renderContext.beginPath();
        renderContext.fillStyle = plug.type === 'in' ? '#404040' : '#b8b8b8';
        renderContext.arc(plug.position.x, plug.position.y, plug.radius, 0, 2 * Math.PI);
        renderContext.fill();
        renderContext.closePath();
        renderContext.beginPath();
        renderContext.fillStyle = '#000000';
        renderContext.arc(plug.position.x, plug.position.y, plug.radius - 1.5, 0, 2 * Math.PI);
        renderContext.fill();
        renderContext.closePath();
    }
    render(renderContext) {
        renderContext.textAlign = "center";
        renderContext.fillStyle = '#ffffff';
        renderContext.font = "16px Arial";
        renderContext.fillText(this.name || this.type, this.width / 2, 20);
        renderContext.font = "12px Arial";
        this.plugs.forEach((plug) => {
            this.renderPlug(renderContext, plug);
        });
        this.labels.forEach((label) => {
            this.renderLabel(renderContext, label);
        });
        this.dials.forEach((dial) => this.renderDial(renderContext, dial.pos, dial.radius, dial.param.value, ''));
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

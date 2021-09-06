import Plug from "../Plug.js";
import { clamp } from "../util/util.js";
import { distance } from "../util/Vec2Math.js";
;
export default class AbstractRackModule {
    constructor(params) {
        this.width = 100;
        this.plugs = [];
        this.labels = [];
        this.dials = [];
        this.buttons = [];
        this.name = null;
        this.eventListeners = {};
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
        this.paramValueOffset = null;
        this.isInRenameMode = false;
        this.handleRenameModeKeyboardKeystroke = (e) => {
            if (this.label === null) {
                return; //this shouldn't happen if label is set prior to adding the event listener
            }
            switch (e.keyCode) {
                case 8:
                    if (this.label === '') {
                        break;
                    }
                    this.label = this.label.substring(0, this.label.length - 1);
                    break;
                case 13:
                    this.isInRenameMode = false;
                    document.removeEventListener('keydown', this.handleRenameModeKeyboardKeystroke);
                    break;
                default:
                    if ((e.keyCode >= 48 && e.keyCode <= 57)
                        || (e.keyCode >= 65 && e.keyCode <= 90)
                        || e.keyCode === 32) {
                        this.label += e.key;
                    }
                    break;
            }
        };
        this.label = params.label || null;
    }
    getPlugAtPosition(pos) {
        return this.plugs.find(plug => {
            return distance(pos, plug.position) <= plug.radius;
        }) || null;
    }
    getPlugIndex(plug) {
        return this.plugs.findIndex(modulePlug => modulePlug === plug);
    }
    getPlugByIndex(index) {
        return this.plugs[index] || null;
    }
    getAllPlugs() {
        return this.plugs;
    }
    addDefaultEventListeners() {
        this.addEventListener('mousedown', (e) => { this.handleMousedown(e); });
        this.addEventListener('mousemove', (e) => { this.handleMousemove(e); });
        this.addEventListener('mouseup', () => { this.handleMouseup(); });
    }
    handleMousedown(mousedownEvent) {
        if (mousedownEvent.y <= 16) {
            this.enterRenameMode();
        }
        const param = this.getDialParamFromPosition(mousedownEvent);
        if (param) {
            this.mousedownParam = param;
            this.mousedownPos = mousedownEvent;
            this.paramInitialValue = param.value;
            return;
        }
        const selectedButton = this.buttons
            .find(button => this.testButtonIntersection(button, mousedownEvent));
        if (selectedButton) {
            selectedButton.callback();
            return;
        }
    }
    handleMousemove(mousemoveEvent) {
        if (this.mousedownPos === null
            || this.mousedownParam === null
            || this.paramInitialValue === null) {
            return;
        }
        const relativeYPos = this.mousedownPos.y - mousemoveEvent.y;
        this.paramValueOffset = this.paramInitialValue + (relativeYPos / 2 ** 7);
        if (this.mousedownParam) {
            this.mousedownParam.value = this.paramValueOffset;
        }
    }
    handleMouseup() {
        this.mousedownParam = null;
        this.paramInitialValue = null;
        this.mousedownPos = null;
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
    enterRenameMode() {
        this.isInRenameMode = true;
        if (this.label === null) {
            this.label = this.displayName;
        }
        document.addEventListener('keydown', this.handleRenameModeKeyboardKeystroke);
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
        this.addPlug({ param: plugParam, name, type, order });
    }
    addButton(button) {
        this.buttons.push(button);
    }
    testButtonIntersection(button, pos) {
        return (button.position.x <= pos.x)
            && (button.position.y <= pos.y)
            && (button.position.x + button.size.x >= pos.x)
            && (button.position.y + button.size.y >= pos.y);
    }
    addDial(pos, radius, param) {
        this.dials.push({ pos, radius, param });
    }
    addPlug({ param, name, type, order = null, position = 'center', channel }) {
        if (typeof position !== 'string') {
            this.plugs.push(new Plug({ rackModule: this, param, position, name, type, channel }));
            return;
        }
        const calculatedPosition = this.getPlugPosition(position, order);
        this.plugs.push(new Plug({ rackModule: this, param, position: calculatedPosition, name, type, channel }));
    }
    getPlugPosition(positioning, order) {
        let positioningOffset = 0;
        if (positioning !== 'center') {
            const offsetAmount = this.width / 6;
            positioningOffset += positioning === 'left' ? -offsetAmount : offsetAmount;
        }
        const xPosition = (this.width / 2) + positioningOffset;
        const yPosition = this.getYPositionFromOrder(order);
        return {
            x: xPosition,
            y: yPosition,
        };
    }
    get firstAvailablePlugSlot() {
        return this.plugs.length;
    }
    get displayName() {
        if (this.label !== null) {
            return this.label;
        }
        if (this.name !== null) {
            return this.name;
        }
        return this.type;
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
        renderContext.fillText(this.displayName, this.width / 2, 20);
        if (this.isInRenameMode) {
            renderContext.save();
            renderContext.fillStyle = '#ffffff';
            renderContext.fillRect(5, 20, 90, 2);
            renderContext.restore();
        }
        renderContext.font = "12px Arial";
        this.plugs.forEach((plug) => {
            this.renderPlug(renderContext, plug);
        });
        this.labels.forEach((label) => {
            this.renderLabel(renderContext, label);
        });
        this.buttons.forEach((button) => {
            this.renderButton(renderContext, button.position, button.size, button.text(), button.enabled());
        });
        this.dials.forEach((dial) => this.renderDial(renderContext, dial.pos, dial.radius, dial.param.value * 2 * Math.PI, ''));
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
    toParams() {
        return {
            type: this.type,
            label: this.label,
        };
    }
}

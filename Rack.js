import { subtract, isSet, add } from "./util.js";
import Cable from "./Cable.js";
import SaveToClipboardButton from "./headerButtons/SaveToClipboardButton.js";
import HeaderButtonFactory from "./headerButtons/HeaderButtonFactory.js";
;
export default class Rack {
    constructor(audioContext, renderContext, rackModuleFactory) {
        this.audioContext = audioContext;
        this.renderContext = renderContext;
        this.rackModuleFactory = rackModuleFactory;
        this.cables = [];
        this.moduleSlots = [];
        this.rackMousedownPosition = null;
        this.rackMousemovePosition = null;
        this.rackMouseupPosition = null;
        this.mousedownPlug = null;
        this.mouseupPlug = null;
        this.delegateModule = null;
        this.xScrollPosition = 0;
        this.headerHeight = 32;
        this.headerButtons = [];
        this.dpr = window.devicePixelRatio || 1;
        this.resetWindowSize();
        this.headerButtons.push(new SaveToClipboardButton(this));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Oscillator', '#0099FF'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Gain', '#00FF99'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Envelope', '#9900FF'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'VoltageSequencer', '#99FF00'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Filter', '#FF0099'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Delay', '#FF9900'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Reverb', '#0099FF'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'StepSequencer', '#00FF99'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'VoltageQuantizer', '#9900FF'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'MidiInput', '#99FF00'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'MidiCCInput', '#FF0099'));
        this.onMousedown = (e) => this.handleMousedown(e);
        this.onMousemove = (e) => this.handleMousemove(e);
        this.onMouseup = (e) => this.handleMouseup(e);
        addEventListener('mousedown', this.onMousedown);
        addEventListener('resize', () => this.resetWindowSize());
        addEventListener('wheel', (e) => this.handleWheel(e), { passive: false, capture: true });
        this.render();
    }
    static fromPatchString(audioContext, context, rackModuleFactory, patchString) {
        const rack = new Rack(audioContext, context, rackModuleFactory);
        try {
            const patch = JSON.parse(patchString);
            if (!isSet(patch.moduleSlots)) {
                throw 'Invalid patch string';
            }
            rack.loadModulesFromPatchObject(patch);
        }
        catch (error) {
            console.error(error);
        }
        return rack;
    }
    resetWindowSize() {
        this.renderContext.canvas.width = window.innerWidth * this.dpr;
        this.renderContext.canvas.height = window.innerHeight * this.dpr;
    }
    handleWheel(e) {
        e.preventDefault();
        e.stopPropagation();
        this.setScrollPosition(this.xScrollPosition + e.deltaX);
        return false;
    }
    setScrollPosition(pos) {
        this.xScrollPosition = Math.max(pos, 0);
    }
    loadModulesFromPatchObject(patchObject) {
        patchObject.moduleSlots.forEach((moduleSlot) => {
            const moduleInstance = this.rackModuleFactory.createModule(moduleSlot.module.type, moduleSlot.module);
            this.addModule(moduleInstance, moduleSlot.position);
        });
    }
    handleMousedown(mousedownEvent) {
        const mousedownPosition = {
            x: mousedownEvent.clientX,
            y: mousedownEvent.clientY,
        };
        if (mousedownPosition.y < this.headerHeight) {
            this.handleHeaderClick(mousedownPosition);
            return;
        }
        this.rackMousedownPosition = this.toRackFromWorldPosition(mousedownPosition);
        addEventListener("mousemove", this.onMousemove);
        addEventListener("mouseup", this.onMouseup);
        this.mousedownPlug = this.getPlugAtRackPosition(this.rackMousedownPosition);
        if (!this.mousedownPlug) {
            this.delegateMousedown(this.rackMousedownPosition);
        }
    }
    handleMousemove(mousemoveEvent) {
        this.rackMousemovePosition = this.toRackFromWorldPosition({
            x: mousemoveEvent.clientX,
            y: mousemoveEvent.clientY,
        });
        if (!this.mousedownPlug) {
            this.delegateMousemove(this.rackMousemovePosition);
        }
    }
    handleMouseup(mouseupEvent) {
        this.rackMouseupPosition = this.toRackFromWorldPosition({
            x: mouseupEvent.clientX,
            y: mouseupEvent.clientY,
        });
        if (!this.mousedownPlug) {
            this.delegateMouseup(this.rackMouseupPosition);
            this.cleanUpMouseState();
            return;
        }
        this.mouseupPlug = this.getPlugAtRackPosition(this.rackMouseupPosition);
        if (this.mousedownPlug === this.mouseupPlug) {
            const cable = this.getCableByPlug(this.mousedownPlug);
            if (cable) {
                this.removeCable(cable);
            }
        }
        if (this.mouseupPlug && this.mousedownPlug !== this.mouseupPlug) {
            this.patch(this.mousedownPlug, this.mouseupPlug);
        }
        this.cleanUpMouseState();
    }
    cleanUpMouseState() {
        this.rackMousedownPosition = null;
        this.rackMousemovePosition = null;
        this.rackMouseupPosition = null;
        this.mousedownPlug = null;
        this.mouseupPlug = null;
        removeEventListener('mousemove', this.onMousemove);
        removeEventListener('mouseup', this.onMouseup);
    }
    handleHeaderClick(pos) {
        let currentButtonStart = 0;
        for (let i = 0; i < this.headerButtons.length; i++) {
            const headerButton = this.headerButtons[i];
            if (pos.x < headerButton.width + currentButtonStart) {
                headerButton.handlePress();
                return;
            }
            currentButtonStart += headerButton.width;
        }
    }
    getPatchString() {
        const output = {};
        output.moduleSlots = this.moduleSlots.map((moduleSlot) => {
            return {
                module: moduleSlot.module.toParams(),
                position: moduleSlot.position,
            };
        });
        return JSON.stringify(output);
    }
    get nextAvailableSpace() {
        return this.moduleSlots.reduce((currentMax, slot) => {
            if (slot.position.x + slot.module.width >= currentMax) {
                return slot.position.x + slot.module.width;
            }
            return currentMax;
        }, 0);
    }
    toRackFromWorldPosition(worldPos) {
        return subtract(worldPos, { x: -this.xScrollPosition, y: this.headerHeight });
    }
    fromRackToWorldPosition(rackPos) {
        return add(rackPos, { x: -this.xScrollPosition, y: this.headerHeight });
    }
    addModule(rackModule, modulePosition) {
        const defaultPosition = {
            x: this.nextAvailableSpace,
            y: 0,
        };
        this.moduleSlots.push({ module: rackModule, position: modulePosition || defaultPosition });
    }
    getModuleIndex(rackModule) {
        return this.moduleSlots.findIndex(item => item.module === rackModule);
    }
    getModuleRackPosition(rackModule) {
        const moduleSlot = this.getModuleSlotByModule(rackModule);
        if (!moduleSlot) {
            throw 'No module slot found';
        }
        return moduleSlot.position;
    }
    getModuleSlotByModule(rackModule) {
        const slot = this.moduleSlots.find(slot => slot.module === rackModule);
        return slot || null;
    }
    getModuleByRackPosition(pos) {
        const moduleSlot = this.moduleSlots.find((moduleSlot) => {
            const modulePosition = moduleSlot.position;
            return modulePosition.x <= pos.x
                && modulePosition.x + moduleSlot.module.width >= pos.x;
        });
        if (moduleSlot) {
            return moduleSlot.module;
        }
        return null;
    }
    toModuleFromRackPosition(rackModule, position) {
        const modulePosition = this.getModuleRackPosition(rackModule);
        return subtract(position, modulePosition);
    }
    getPlugAtRackPosition(pos) {
        const selectedModule = this.getModuleByRackPosition(pos);
        if (!selectedModule) {
            return null;
        }
        const moduleRelativePosition = this.toModuleFromRackPosition(selectedModule, pos);
        const selectedPlug = selectedModule.getPlugAtPosition(moduleRelativePosition);
        return selectedPlug;
    }
    patch(outPlug, inPlug) {
        try {
            const newCable = new Cable(this, outPlug, inPlug);
            this.cables.unshift(newCable);
        }
        catch (error) {
            this.cleanUpMouseState();
        }
    }
    getCableByPlug(plug) {
        return this.cables.find((cable) => {
            return cable.plug1 === plug || cable.plug2 === plug;
        }) || null;
    }
    getCableByPlugs(plug1, plug2) {
        return this.cables.find((cable) => {
            return (cable.plug1 === plug1 && cable.plug2 === plug2)
                || (cable.plug1 === plug2 && cable.plug2 === plug1);
        }) || null;
    }
    removeCable(cable) {
        cable.remove();
        const index = this.cables.indexOf(cable);
        if (index === -1) {
            return;
        }
        this.cables.splice(index, 1);
    }
    delegateMousedown(rackPosition) {
        const rackModule = this.getModuleByRackPosition(rackPosition);
        this.delegateModule = rackModule;
        if (!rackModule) {
            return;
        }
        const localPosition = this.toModuleFromRackPosition(rackModule, rackPosition);
        rackModule.onMousedown(localPosition);
    }
    delegateMousemove(rackPosition) {
        if (!this.delegateModule) {
            return;
        }
        const localPosition = this.toModuleFromRackPosition(this.delegateModule, rackPosition);
        this.delegateModule.onMousemove(localPosition);
    }
    delegateMouseup(rackPosition) {
        if (!this.delegateModule) {
            return;
        }
        const localPosition = this.toModuleFromRackPosition(this.delegateModule, rackPosition);
        this.delegateModule.onMouseup(localPosition);
    }
    render() {
        this.renderContext.save();
        this.renderContext.scale(this.dpr, this.dpr);
        this.renderBackground();
        this.renderHeader();
        this.renderContext.save();
        this.renderContext.translate(-this.xScrollPosition, this.headerHeight);
        this.renderModules();
        this.renderCables();
        this.renderDraggingCable();
        this.renderContext.restore();
        this.renderContext.restore();
        requestAnimationFrame(() => {
            this.render();
        });
    }
    renderBackground() {
        this.renderContext.fillStyle = "#333333";
        this.renderContext.fillRect(0, 0, this.renderContext.canvas.width, this.renderContext.canvas.height);
    }
    renderHeader() {
        let currentOffset = 0;
        this.headerButtons.forEach((button) => {
            this.renderContext.save();
            this.renderContext.translate(currentOffset, 0);
            button.render(this.renderContext);
            this.renderContext.restore();
            currentOffset += button.width;
        });
    }
    renderModules() {
        this.moduleSlots.forEach((moduleSlot) => {
            this.renderContext.save();
            const modulePosition = moduleSlot.position;
            this.renderContext.translate(modulePosition.x, modulePosition.y);
            this.renderContext.fillStyle = "#222222";
            this.renderContext.fillRect(0, 0, moduleSlot.module.width, 400);
            moduleSlot.module.render(this.renderContext);
            this.renderContext.restore();
        });
    }
    renderCables() {
        this.cables.forEach(cable => cable.render(this.renderContext));
    }
    renderDraggingCable() {
        if (!this.mousedownPlug
            || !this.rackMousedownPosition
            || !this.rackMousemovePosition) {
            return;
        }
        this.renderContext.strokeStyle = "#ff0000";
        this.renderContext.lineWidth = 4;
        this.renderContext.beginPath();
        this.renderContext.moveTo(this.rackMousedownPosition.x, this.rackMousedownPosition.y);
        this.renderContext.lineTo(this.rackMousemovePosition.x, this.rackMousemovePosition.y);
        this.renderContext.stroke();
    }
}

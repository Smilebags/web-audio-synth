import { subtract, isSet } from "./util.js";
import Cable from "./Cable.js";
import OscillatorButton from "./headerButtons/OscillatorButton.js";
import SaveToClipboardButton from "./headerButtons/SaveToClipboardButton.js";
import GainButton from "./headerButtons/GainButton.js";
;
export default class Rack {
    constructor(audioContext, renderContext, rackModuleFactory) {
        this.audioContext = audioContext;
        this.renderContext = renderContext;
        this.rackModuleFactory = rackModuleFactory;
        this.cables = [];
        this.moduleSlots = [];
        this.mousedownPosition = null;
        this.mousedragPosition = null;
        this.mouseupPosition = null;
        this.mousedownPlug = null;
        this.mouseupPlug = null;
        this.delegateModule = null;
        this.headerHeight = 32;
        this.headerButtons = [];
        this.renderContext.canvas.width = window.innerWidth;
        this.renderContext.canvas.height = window.innerHeight;
        this.render();
        this.headerButtons.push(new SaveToClipboardButton(this));
        this.headerButtons.push(new OscillatorButton(this));
        this.headerButtons.push(new GainButton(this));
        this.onMousedown = (e) => this.handleMousedown(e);
        this.onMousemove = (e) => this.handleMousemove(e);
        this.onMouseup = (e) => this.handleMouseup(e);
        addEventListener("mousedown", this.onMousedown);
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
        this.mousedownPosition = mousedownPosition;
        addEventListener("mousemove", this.onMousemove);
        addEventListener("mouseup", this.onMouseup);
        this.mousedownPlug = this.getPlugAtRackPosition(mousedownPosition);
        if (!this.mousedownPlug) {
            this.delegateMousedown(mousedownPosition);
        }
    }
    handleMousemove(mousemoveEvent) {
        this.mousedragPosition = {
            x: mousemoveEvent.clientX,
            y: mousemoveEvent.clientY,
        };
        if (!this.mousedownPlug) {
            this.delegateMousemove(this.mousedragPosition);
        }
    }
    handleMouseup(mouseupEvent) {
        this.mouseupPosition = {
            x: mouseupEvent.clientX,
            y: mouseupEvent.clientY,
        };
        if (!this.mousedownPlug) {
            this.delegateMouseup(this.mouseupPosition);
            this.cleanUpMouseState();
            return;
        }
        this.mouseupPlug = this.getPlugAtRackPosition(this.mouseupPosition);
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
        this.mousedownPosition = null;
        this.mousedragPosition = null;
        this.mouseupPosition = null;
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
    addModule(rackModule, modulePosition) {
        const defaultPosition = {
            x: this.nextAvailableSpace,
            y: this.headerHeight,
        };
        this.moduleSlots.push({ module: rackModule, position: modulePosition || defaultPosition });
    }
    getModuleIndex(rackModule) {
        return this.moduleSlots.findIndex(item => item.module === rackModule);
    }
    getModulePosition(rackModule) {
        const moduleIndex = this.getModuleIndex(rackModule);
        return { x: moduleIndex * 100, y: this.headerHeight };
    }
    getModuleByPosition(pos) {
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
    getModuleLocalPosition(rackModule, position) {
        const modulePosition = this.getModulePosition(rackModule);
        return subtract(position, modulePosition);
    }
    getPlugAtRackPosition(pos) {
        const selectedModule = this.getModuleByPosition(pos);
        if (!selectedModule) {
            return null;
        }
        const moduleRelativePosition = subtract(pos, this.getModulePosition(selectedModule));
        const selectedPlug = selectedModule.getPlugAtPosition(moduleRelativePosition);
        return selectedPlug;
    }
    patch(outPlug, inPlug) {
        this.cables.unshift(new Cable(this, outPlug, inPlug));
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
        const rackModule = this.getModuleByPosition(rackPosition);
        this.delegateModule = rackModule;
        if (!rackModule) {
            return;
        }
        const localPosition = this.getModuleLocalPosition(rackModule, rackPosition);
        rackModule.onMousedown(localPosition);
    }
    delegateMousemove(rackPosition) {
        if (!this.delegateModule) {
            return;
        }
        const localPosition = this.getModuleLocalPosition(this.delegateModule, rackPosition);
        this.delegateModule.onMousemove(localPosition);
    }
    delegateMouseup(rackPosition) {
        if (!this.delegateModule) {
            return;
        }
        const localPosition = this.getModuleLocalPosition(this.delegateModule, rackPosition);
        this.delegateModule.onMouseup(localPosition);
    }
    render() {
        this.renderBackground();
        this.renderHeader();
        this.renderModules();
        this.renderCables();
        this.renderDraggingCable();
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
            || !this.mousedownPosition
            || !this.mousedragPosition) {
            return;
        }
        this.renderContext.strokeStyle = "#ff0000";
        this.renderContext.lineWidth = 4;
        this.renderContext.beginPath();
        this.renderContext.moveTo(this.mousedownPosition.x, this.mousedownPosition.y);
        this.renderContext.lineTo(this.mousedragPosition.x, this.mousedragPosition.y);
        this.renderContext.stroke();
    }
}

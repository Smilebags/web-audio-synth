import { isSet, isPromise } from "./util/util.js";
import { subtract, add, distance } from "./util/Vec2Math.js";
import Cable from "./Cable.js";
import SaveButton from "./headerButtons/SaveButton.js";
import HeaderButtonFactory from "./headerButtons/HeaderButtonFactory.js";
import ModifierKeyStatus from "./ModifierKeyStatus.js";
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
        this.scrollPosition = { x: 0, y: 0 };
        this.headerHeight = 32;
        this.headerButtons = [];
        this.moduleHeight = 400;
        this.selectedModule = null;
        this.isDraggingModule = false;
        this.draggedModuleOffset = null;
        this.modifierKeyStatus = new ModifierKeyStatus();
        this.moduleXPositionStepSize = 100;
        this.dpr = window.devicePixelRatio || 1;
        this.resetWindowSize();
        this.headerButtons.push(new SaveButton(this, localStorage, navigator.clipboard));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Output', '#00AA55'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'KeyboardInput', '#5500AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'MidiInput', '#55AA00'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'MidiCCInput', '#AA0055'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Oscillator', '#0055AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Gain', '#00AA55'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Envelope', '#5500AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'VoltageSequencer', '#55AA00'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Filter', '#AA0055'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Delay', '#AA5500'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Reverb', '#0055AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'StepSequencer', '#00AA55'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'VoltageQuantizer', '#5500AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Noise', '#AA5500'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'ClockDivider', '#0055AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Sampler', '#00AA55'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'AudioInput', '#5500AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Glide', '#55AA00'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Values', '#AA0055'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Chords', '#AA5500'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Distortion', '#0055AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Amplitude', '#00AA55'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Viewer', '#5500AA'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'Math', '#55AA00'));
        this.headerButtons.push(HeaderButtonFactory.createButton(this, 'SampleLoader', '#AA0055'));
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
            rack.connectCablesFromPatchObject(patch);
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
        if (this.modifierKeyStatus.shift) {
            // swap scroll directions to allow for horizontal scroll
            this.setScrollPosition({
                x: this.scrollPosition.x + e.deltaY,
                y: this.scrollPosition.y + e.deltaX,
            });
        }
        else {
            this.setScrollPosition({
                x: this.scrollPosition.x + e.deltaX,
                y: this.scrollPosition.y + e.deltaY,
            });
        }
        return false;
    }
    setScrollPosition(pos) {
        this.scrollPosition.x = Math.max(pos.x, 0);
        this.scrollPosition.y = Math.max(pos.y, 0);
    }
    loadModulesFromPatchObject(patchObject) {
        patchObject.moduleSlots.forEach((moduleSlot) => {
            const moduleInstance = this.rackModuleFactory.createModule(moduleSlot.module.type, moduleSlot.module);
            this.addModule(moduleInstance, moduleSlot.position);
        });
    }
    connectCablesFromPatchObject(patchObject) {
        patchObject.cables.forEach((cableOptions) => {
            const outModule = this.moduleSlots[cableOptions.outModule].module;
            const inModule = this.moduleSlots[cableOptions.inModule].module;
            const outPlug = outModule.getPlugByIndex(cableOptions.outPlug);
            const inPlug = inModule.getPlugByIndex(cableOptions.inPlug);
            if (!outPlug || !inPlug) {
                return;
            }
            this.patch(outPlug, inPlug);
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
        if (this.modifierKeyStatus.alt) {
            this.handleDeleteModuleClick(this.rackMousedownPosition);
            return;
        }
        if (this.modifierKeyStatus.ctrl || this.modifierKeyStatus.meta) {
            this.handleMoveModuleMouseDown(this.rackMousedownPosition);
            return;
        }
        addEventListener("mousemove", this.onMousemove);
        addEventListener("mouseup", this.onMouseup);
        this.mousedownPlug = this.getPlugAtRackPosition(this.rackMousedownPosition);
        if (this.mousedownPlug) {
            return;
        }
        this.delegateMousedown(this.rackMousedownPosition);
    }
    handleMousemove(mousemoveEvent) {
        this.rackMousemovePosition = this.toRackFromWorldPosition({
            x: mousemoveEvent.clientX,
            y: mousemoveEvent.clientY,
        });
        if (this.isDraggingModule) {
            this.handleMoveModuleMouseMove(this.rackMousemovePosition);
            return;
        }
        if (!this.mousedownPlug) {
            this.delegateMousemove(this.rackMousemovePosition);
        }
    }
    handleMouseup(mouseupEvent) {
        this.rackMouseupPosition = this.toRackFromWorldPosition({
            x: mouseupEvent.clientX,
            y: mouseupEvent.clientY,
        });
        if (this.isDraggingModule) {
            this.handleMoveModuleMouseUp(this.rackMouseupPosition);
            this.cleanUpMouseState();
            return;
        }
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
    handleDeleteModuleClick(rackPos) {
        const selectedModule = this.getModuleByRackPosition(rackPos);
        if (!selectedModule) {
            return;
        }
        this.removeModule(selectedModule);
    }
    handleMoveModuleMouseDown(rackPos) {
        const selectedModule = this.getModuleByRackPosition(rackPos);
        if (!selectedModule) {
            return;
        }
        this.selectedModule = selectedModule;
        this.isDraggingModule = true;
        this.draggedModuleOffset = { x: 0, y: 0 };
        addEventListener("mousemove", this.onMousemove);
        addEventListener("mouseup", this.onMouseup);
    }
    handleMoveModuleMouseMove(rackPos) {
        if (!this.rackMousedownPosition) {
            return;
        }
        this.draggedModuleOffset = {
            x: rackPos.x - this.rackMousedownPosition.x,
            y: rackPos.y - this.rackMousedownPosition.y,
        };
    }
    handleMoveModuleMouseUp(mouseUpRackPos) {
        if (!this.rackMousedownPosition ||
            !this.selectedModule) {
            return;
        }
        this.draggedModuleOffset = {
            x: mouseUpRackPos.x - this.rackMousedownPosition.x,
            y: mouseUpRackPos.y - this.rackMousedownPosition.y,
        };
        const rowOffset = Math.floor((this.draggedModuleOffset.y / this.moduleHeight) + 0.5);
        const moduleSlot = this.moduleSlots.find(slot => slot.module === this.selectedModule);
        if (moduleSlot
            && moduleSlot.position.y + rowOffset >= 0) {
            const newModuleRow = moduleSlot.position.y + rowOffset;
            const newModuleXPosition = moduleSlot.position.x + this.draggedModuleOffset.x;
            const newModuleColumn = Math.round(newModuleXPosition / this.moduleXPositionStepSize) * this.moduleXPositionStepSize;
            const newModulePosition = { x: newModuleColumn, y: newModuleRow };
            if (this.isSpaceAvailable(newModulePosition, moduleSlot.module.width)) {
                moduleSlot.position = newModulePosition;
            }
            else {
                moduleSlot.position = this.getNextAvailableSpace(moduleSlot.module.width, newModuleRow);
            }
        }
        this.isDraggingModule = false;
        this.selectedModule = null;
        this.draggedModuleOffset = null;
    }
    isSpaceAvailable(position, width) {
        return true;
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
    async getPatchString() {
        const output = {};
        output.moduleSlots = await Promise.all(this.moduleSlots.map(async (moduleSlot) => {
            let toParamsResponse = moduleSlot.module.toParams();
            if (isPromise(toParamsResponse)) {
                toParamsResponse = await toParamsResponse;
            }
            return {
                module: toParamsResponse,
                position: moduleSlot.position,
            };
        }));
        output.cables = this.cables.map((cable) => {
            return {
                outModule: this.getModuleIndex(cable.plug1.module),
                outPlug: cable.plug1.module.getPlugIndex(cable.plug1),
                inModule: this.getModuleIndex(cable.plug2.module),
                inPlug: cable.plug2.module.getPlugIndex(cable.plug2),
            };
        });
        return JSON.stringify(output);
    }
    get activeRow() {
        return Math.round(this.scrollPosition.y / this.moduleHeight);
    }
    getNextAvailableSpace(width, preferredRow) {
        const yOffset = preferredRow !== undefined ? preferredRow : this.activeRow;
        const relevantModuleSlots = this.moduleSlots.filter(slot => slot.position.y === yOffset);
        if (relevantModuleSlots.length === 0) {
            return {
                x: 0,
                y: yOffset,
            };
        }
        if (relevantModuleSlots.length === 1) {
            return {
                x: relevantModuleSlots[0].position.x >= width ? 0 : relevantModuleSlots[0].module.width,
                y: yOffset,
            };
        }
        const sortedModuleSlots = relevantModuleSlots.sort((a, b) => a.position.x - b.position.x);
        if (sortedModuleSlots[0].position.x >= width) {
            return {
                x: 0,
                y: yOffset,
            };
        }
        for (let i = 1; i < sortedModuleSlots.length; i++) {
            const previousModule = sortedModuleSlots[i - 1];
            const previousModuleEnd = previousModule.position.x + previousModule.module.width;
            const spaceBefore = sortedModuleSlots[i].position.x - previousModuleEnd;
            if (spaceBefore >= width) {
                return {
                    x: previousModuleEnd,
                    y: yOffset,
                };
            }
        }
        const lastModuleSlot = sortedModuleSlots[sortedModuleSlots.length - 1];
        const endPosition = lastModuleSlot.position.x + lastModuleSlot.module.width;
        return {
            x: endPosition,
            y: yOffset,
        };
    }
    toRackFromWorldPosition(worldPos) {
        return subtract(worldPos, { x: -this.scrollPosition.x, y: this.headerHeight - this.scrollPosition.y });
    }
    fromRackToWorldPosition(rackPos) {
        return add(rackPos, { x: -this.scrollPosition.x, y: this.headerHeight });
    }
    addModule(rackModule, modulePosition) {
        const defaultPosition = this.getNextAvailableSpace(rackModule.width);
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
        if (moduleSlot.module === this.selectedModule
            && this.draggedModuleOffset) {
            return {
                x: moduleSlot.position.x + this.draggedModuleOffset.x,
                y: (moduleSlot.position.y * this.moduleHeight) + this.draggedModuleOffset.y,
            };
        }
        return {
            x: moduleSlot.position.x,
            y: moduleSlot.position.y * this.moduleHeight
        };
    }
    getModuleSlotByModule(rackModule) {
        const slot = this.moduleSlots.find(slot => slot.module === rackModule);
        return slot || null;
    }
    getModuleByRackPosition(pos) {
        const moduleSlot = this.moduleSlots.find((moduleSlot) => {
            const modulePos = moduleSlot.position;
            const xIsContained = modulePos.x <= pos.x
                && modulePos.x + moduleSlot.module.width > pos.x;
            const yIsContained = modulePos.y * this.moduleHeight <= pos.y
                && (modulePos.y * this.moduleHeight) + this.moduleHeight > pos.y;
            return xIsContained && yIsContained;
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
    removeModule(rackModule) {
        const cables = this.getCablesByModule(rackModule);
        cables.map(cable => this.removeCable(cable));
        const slotIndex = this.moduleSlots.findIndex(moduleSlot => moduleSlot.module === rackModule);
        if (slotIndex === -1) {
            return;
        }
        this.moduleSlots.splice(slotIndex, 1);
    }
    getCablesByModule(rackModule) {
        const plugs = rackModule.getAllPlugs();
        return this.cables.filter(cable => (plugs.indexOf(cable.plug1) !== -1
            || plugs.indexOf(cable.plug2) !== -1));
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
        this.renderContext.save();
        this.renderContext.translate(-this.scrollPosition.x, this.headerHeight - this.scrollPosition.y);
        this.renderModules();
        this.renderCables();
        this.renderDraggingCable();
        this.renderContext.restore();
        this.renderHeader();
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
        this.renderContext.fillStyle = "#a0a0a0";
        this.renderContext.fillRect(0, 0, this.renderContext.canvas.width, 32);
        this.headerButtons.forEach((button) => {
            this.renderContext.save();
            this.renderContext.translate(currentOffset, 0);
            button.render(this.renderContext);
            this.renderContext.restore();
            currentOffset += button.width;
        });
    }
    renderBorder(moduleSlot, offset, opacity) {
        this.renderContext.strokeStyle = "#000000";
        this.renderContext.globalAlpha = opacity;
        this.renderContext.strokeRect(offset, offset, moduleSlot.module.width - (offset * 2), this.moduleHeight - (offset * 2));
    }
    renderModules() {
        this.moduleSlots.forEach((moduleSlot) => {
            this.renderContext.save();
            const modulePosition = this.getModuleRackPosition(moduleSlot.module);
            this.renderContext.translate(modulePosition.x, modulePosition.y);
            this.renderContext.fillStyle = "#202020";
            this.renderContext.fillRect(0, 0, moduleSlot.module.width, this.moduleHeight);
            this.renderBorder(moduleSlot, 0, 0.5);
            this.renderBorder(moduleSlot, 1, 0.25);
            this.renderBorder(moduleSlot, 2, 0.125);
            this.renderBorder(moduleSlot, 3, 0.06);
            this.renderBorder(moduleSlot, 4, 0.03);
            this.renderContext.globalAlpha = 1;
            moduleSlot.module.render(this.renderContext);
            this.renderContext.restore();
        });
    }
    renderCables() {
        this.cables.forEach(cable => cable.render(this.renderContext));
    }
    renderCord(renderContext, pos1, pos2, cableSlack, color) {
        renderContext.beginPath();
        renderContext.strokeStyle = color;
        renderContext.lineCap = 'round';
        renderContext.lineWidth = 4;
        renderContext.moveTo(pos1.x, pos1.y);
        renderContext.bezierCurveTo(pos1.x, pos1.y + cableSlack, pos2.x, pos2.y + cableSlack, pos2.x, pos2.y);
        renderContext.stroke();
    }
    renderDraggingCable() {
        if (!this.mousedownPlug
            || !this.rackMousedownPosition
            || !this.rackMousemovePosition) {
            return;
        }
        const cableLength = distance(this.rackMousedownPosition, this.rackMousemovePosition);
        const cableSlack = cableLength * 0.3;
        this.renderCord(this.renderContext, this.rackMousedownPosition, this.rackMousemovePosition, cableSlack, "#ff0000");
    }
}

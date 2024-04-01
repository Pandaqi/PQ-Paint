import Point from "./point"
import Color from "./color"
import Config from "./config"
import PandaqiPaint from "./pandaqiPaint";
import { ToolParams } from "./tools/main";

export default class PaintCanvas
{
    pqPaint: PandaqiPaint;
    drawing: boolean;
    lastDrawPos: Point;
    canvasResolution: { width: number; height: number; };
    canvasOutput: HTMLCanvasElement;
    contextOutput: CanvasRenderingContext2D;
    contextActive: CanvasRenderingContext2D;
    canvasCurrent: HTMLCanvasElement;
    contextCurrent: CanvasRenderingContext2D;
    canvasActive: HTMLCanvasElement;

    constructor(pqPaint:PandaqiPaint) 
    {
        this.pqPaint = pqPaint;
        this.drawing = false;
        this.lastDrawPos = null;
        this.canvasResolution = { width: 1280, height: 720 };

        this.createCanvasElements();
        this.attachMouseEvents();
        this.listenForSignals();

        this.pqPaint.pushState(this.cloneState());
    }

    download()
    {
        const link = document.createElement('a');
        link.download = '[Pandaqi Paint] Canvas.png';
        link.href = this.canvasOutput.toDataURL()
        link.click();
    }

    getSize() { return this.canvasResolution; }
    getCanvasOutput() { return this.canvasOutput; }
    getContextOutput() { return this.contextOutput; }
    getContextActive() { return this.contextActive; }
    createCanvasElement()
    {
        const canv = document.createElement("canvas");
        canv.width = this.canvasResolution.width;
        canv.height = this.canvasResolution.height;
        return canv;
    }

    createCanvasElements()
    {
        const canv = this.createCanvasElement();
        this.pqPaint.getContainerNode().appendChild(canv);
        canv.style.width = "100%";
        canv.classList.add("paint-canvas");

        const params = { willReadFrequently: true, imageSmoothingEnabled: true };

        this.canvasOutput = canv;
        this.contextOutput = canv.getContext("2d", params) as CanvasRenderingContext2D;
        this.clearCanvas(this.canvasOutput, true);

        this.canvasCurrent = this.createCanvasElement();
        this.contextCurrent = this.canvasCurrent.getContext("2d", params) as CanvasRenderingContext2D; // shouldn't ever be used, ideally

        this.canvasActive = this.createCanvasElement();
        this.contextActive = this.canvasActive.getContext("2d", params) as CanvasRenderingContext2D;

    }

    listenForSignals()
    {
        Config.addEventListener("toolChanged", (ev) => {
            this.canvasOutput.style.cursor = ev.detail.tool.cursor;
        })
    }

    attachMouseEvents()
    {
        const canv = this.canvasOutput;
        canv.addEventListener('mousedown', this.onDrawStart.bind(this), true);
        canv.addEventListener('touchstart', this.onDrawStart.bind(this), true);

        canv.addEventListener('mousemove', this.onDrawProgress.bind(this), true);
        canv.addEventListener('touchmove', this.onDrawProgress.bind(this), true);

        canv.addEventListener('mouseup', this.onDrawEnd.bind(this), true);
        canv.addEventListener('touchend', this.onDrawEnd.bind(this), true);

        canv.addEventListener('mouseleave', this.onDrawCancel.bind(this), true);
        canv.addEventListener('touchcancel', this.onDrawCancel.bind(this), true);
    }

    getPosFromEvent(ev)
    {
        if(!ev) { return this.lastDrawPos; }

        const p = new Point();
        const offset = this.canvasOutput.getBoundingClientRect();
        p.move(new Point({ x: -offset.left, y: -offset.top }));

        if(ev.type == 'touchstart' || ev.type == 'touchmove' || ev.type == 'touchend' || ev.type == 'touchcancel')
        {
            var evt = (typeof ev.originalEvent === 'undefined') ? ev : ev.originalEvent;
            var touch = evt.touches[0] || evt.changedTouches[0];
            p.move(new Point({ x: touch.clientX, y: touch.clientY }));
        } else if (ev.type == 'mousedown' || ev.type == 'mouseup' || ev.type == 'mousemove' || ev.type == 'mouseover'|| ev.type == 'mouseout' || ev.type == 'mouseenter' || ev.type=='mouseleave' ) {
            p.move(new Point({ x: ev.clientX, y: ev.clientY }));
        } 
        
        const finalPos = this.convertRealPosToCanvasPos(p);
        return finalPos;
    }

    collectToolParams(ev) : ToolParams
    {
        return {
            pos: this.getPosFromEvent(ev),
            lastDrawPos: this.lastDrawPos,
            pqPaint: this.pqPaint,
        }
    }

    cancelEvents(ev)
    {
        if(!ev) { return false; }
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }

    onDrawStart(ev)
    {
        if(this.drawing) { return; }
        this.drawing = true;
        
        const pos = this.getPosFromEvent(ev);
        this.lastDrawPos = pos.clone();
        Config.dispatchEvent("drawStart", { params: this.collectToolParams(ev) });
        return this.cancelEvents(ev);
    }

    onDrawProgress(ev)
    {
        if(!this.drawing) { return; }

        const params = this.collectToolParams(ev);
        Config.dispatchEvent("drawProgress", { params: params });
        this.lastDrawPos = params.pos.clone();
        return this.cancelEvents(ev);
    }

    onDrawEnd(ev)
    {
        if(!this.drawing) { return; }
        Config.dispatchEvent("drawEnd", { params: this.collectToolParams(ev) });
        this.drawing = false;
        this.lastDrawPos = null;
        return this.cancelEvents(ev);
    }

    onDrawCancel()
    {
        if(!this.drawing) { return; }
        this.onDrawEnd(null);
    }

    clearCanvas(canv, fillBackground = false) 
    {
        const ctx = canv.getContext("2d");
        ctx.clearRect(0, 0, this.canvasResolution.width, this.canvasResolution.height);

        if(fillBackground)
        {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canv.width, canv.height);
        }
    }

    setStateTo(state:HTMLCanvasElement)
    {
        this.clearCanvas(this.canvasCurrent);
        this.contextCurrent.drawImage(state, 0, 0);
        this.refreshOutput(false);
    }

    cloneState()
    {
        const canv = document.createElement("canvas");
        canv.width = this.canvasOutput.width;
        canv.height = this.canvasOutput.height;
        canv.getContext("2d").drawImage(this.canvasOutput, 0, 0);
        return canv;
    }

    clearOutput()
    {
        this.clearCanvas(this.canvasCurrent);
        this.clearCanvas(this.canvasActive);
        this.refreshOutput();
    }

    refreshOutput(saveState = true)
    {
        this.clearCanvas(this.canvasOutput, true);
        this.contextOutput.drawImage(this.canvasCurrent, 0, 0);
        this.drawActiveCanvasOnto(this.canvasOutput);

        if(saveState) { this.pqPaint.pushState(this.cloneState()); }
    }

    drawActiveCanvasOnto(targetCanvas)
    {
        const ctx = targetCanvas.getContext("2d");
        ctx.save();
        ctx.globalCompositeOperation = this.pqPaint.getTools().getCompositeOperation();
        ctx.drawImage(this.canvasActive, 0, 0);
        ctx.restore();
    }

    commitCanvasActive()
    {
        /*const img = document.createElement("img");
        img.src = this.canvasActive.toDataURL();
        this.pqPaint.getContainerNode().appendChild(img);*/

        this.drawActiveCanvasOnto(this.canvasCurrent);
        this.clearCanvas(this.canvasActive);
        this.clearCanvas(this.canvasOutput, true);
        this.refreshOutput();
    }

    drawOnActiveCanvas(canvasOperation)
    {
        if(canvasOperation.clearBefore) { this.clearCanvas(this.canvasActive); }

        const canvasToStamp = canvasOperation.canvas;
        const ctx = this.contextActive;
        ctx.globalAlpha = canvasOperation.alpha;
        ctx.globalCompositeOperation = canvasOperation.composite;

        if(canvasOperation.usesImage())
        {
            for(const point of canvasOperation.getPoints())
            {
                ctx.drawImage(canvasToStamp, point.x, point.y);
            }
        }

        if(canvasOperation.usesVector())
        {
            const settings = canvasOperation.getLineSettings();
            const path = new Path2D();
            for(const point of canvasOperation.getPoints())
            {
                path.lineTo(point.x, point.y);
            }
            ctx.strokeStyle = settings.color;
            ctx.lineWidth = settings.lineWidth;
            ctx.stroke(path);
        }
  
        this.refreshOutput(canvasOperation.saveStateAfterwards);
    }

    convertRealPosToCanvasPos(realPos)
    {
        const displaySize = this.canvasOutput.getBoundingClientRect();
        const underlyingSize = this.canvasResolution;

        const scaleVector = new Point().setXY(
            underlyingSize.width / displaySize.width,
            underlyingSize.height / displaySize.height
        );

        return realPos.clone().scale(scaleVector);
    }

    convertCanvasPosToRealPos(canvasPos)
    {
        const displaySize = this.canvasOutput.getBoundingClientRect();
        const underlyingSize = this.canvasResolution;

        const scaleVector = new Point().setXY(
            displaySize.width / underlyingSize.width,
            displaySize.height / underlyingSize.height
        );

        return canvasPos.clone().scale(scaleVector);
    }

    readColorAt(canvasPos)
    {
        const rawColor = this.contextOutput.getImageData(canvasPos.x, canvasPos.y, 1, 1).data;
        const color = new Color(rawColor[0] / 255.0, rawColor[1] / 255.0, rawColor[2] / 255.0, rawColor[3] / 255.0)
        return color;
    }

}
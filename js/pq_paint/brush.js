import Point from "./point"
import Config from "./config"

export default class Brush
{
    constructor()
    {
        const defParams = Config.DEFAULT_BRUSH_PARAMS;
        this.radius = defParams.radius;
        this.hardness = defParams.hardness;
        this.channelOrder = ["r", "g", "b", "a"];
        this.opacity = defParams.opacity;
        this.color = defParams.color.clone();

        this.canvasDirty = true;
        this.canvasCached = null;
        this.canvasSmudgeCached = null;
        this.gradientCached = null;
    }

    onChange()
    {
        this.canvasDirty = true;
        this.regenerateCanvas();
        this.dispatchChangeEvent();
    }

    dispatchChangeEvent()
    {
        Config.dispatchEvent("brushChanged", { brush: this });
    }

    createCanvas()
    {
        const canv = document.createElement("canvas");
        canv.width = this.radius * 2;
        canv.height = this.radius * 2;
        return canv;
    }

    regenerateCanvas()
    {
        if(!this.canvasDirty) { return; }

        this.canvasCached = this.createCanvas();
        this.generateCanvas();

        this.canvasSmudgeCached = this.createCanvas();
        const gradient = this.createFeatherGradient(this.canvasSmudgeCached);
        this.gradientCached = gradient;

        this.canvasDirty = false;
    }

    getAlphaFalloff(centerPoint)
    {
        const distToCenter = Math.sqrt(Math.pow(centerPoint.x - this.radius, 2) + Math.pow(centerPoint.y - this.radius, 2));
        const distToCenterUnit = distToCenter / this.radius;
        if(distToCenterUnit < 0.0 || distToCenterUnit > 1.0) { return -1; }

        const alphaAtCenter = this.opacity;
        const alphaAtEdge = this.hardness * this.opacity;
        let dist = distToCenterUnit;
        const alpha = alphaAtCenter + dist * (alphaAtEdge - alphaAtCenter);
        return alpha;
    }

    generateCanvas()
    {
        const ctx = this.canvasCached.getContext("2d");
        for(let x = 0; x < this.radius*2; x++)
        {
            for(let y = 0; y < this.radius*2; y++)
            {
                const p = new Point().setXY(x,y);
                const alpha = this.getAlphaFalloff(p);
                const dontDraw = alpha < 0;
                if(dontDraw) { continue; }

                const c = this.color.clone();
                c.setAlpha(alpha);
                this.setCanvasPixel(ctx, p, c);
            }
        }
    }

    getPreviewCanvas() { 
        const canv = this.createCanvas();
        const maxSize = 2*Config.RADIUS_BOUNDS.max;
        canv.width = maxSize;
        canv.height = maxSize;
        canv.classList.add("brush-preview-canvas");

        let canvasToShow = this.getImage();
        const ctx = canv.getContext("2d");
        ctx.drawImage(canvasToShow,
            0.5*maxSize - 0.5*canvasToShow.width, 
            0.5*maxSize - 0.5*canvasToShow.height
        );
        return canv; 
    }

    getSmudgeImage() { return this.canvasSmudgeCached; }
    getImage() { return this.canvasCached; }

    getOpacity() { return this.opacity; }
    setOpacity(o)
    {
        this.opacity = o;
        this.onChange();
    }

    getHardness() { return this.hardness; }
    setHardness(h)
    {
        this.hardness = h;
        this.onChange();
    }

    getSize() { return this.radius; }
    setSize(s)
    {
        this.radius = Config.clamp(s, Config.RADIUS_BOUNDS);
        this.onChange();
    }

    getColor() { return this.color; }
    getColorWithOpacity() { const c = this.color.clone(); c.setAlpha(this.opacity); return c; }
    setColor(c) { this.color = c; this.onChange(); }

    getColorChannel(channelName) { return this.color.getChannel(channelName); }
    setColorChannel(channelName, value)
    {
        this.color.setChannel(channelName, value);
        this.onChange();
    }

    fillPixelListRaw(imageData, pixelList)
    {
        const color = this.getColorWithOpacity();
        for(const pixel of pixelList)
        {
            const id = this.getPixelID(imageData, pixel);
            this.setRawPixel(imageData, id, color);
        }
    }

    setCanvasPixel(context, point, color)
    {
        context.fillStyle = color.toString();
        context.fillRect(point.x, point.y, 1, 1);
    }

    setRawPixel(imageData, id, color)
    {
        this.setPixelChannel(imageData, id, "r", color.r);
        this.setPixelChannel(imageData, id, "g", color.g);
        this.setPixelChannel(imageData, id, "b", color.b);
        this.setPixelChannel(imageData, id, "a", color.a);

        /*imageData.data[offset + 0] = color.r;
        imageData.data[offset + 1] = color.g;
        imageData.data[offset + 2] = color.b;
        imageData.data[offset + 3] = color.a;*/
    }

    setPixelChannel(imageData, id, channelName, value)
    {
        const tempID = id + this.channelOrder.indexOf(channelName);
        imageData.data[tempID] = Math.round(value * 255);
    }
    
    getNumChannels()
    {
        return this.channelOrder.length;
    }

    getPixelID(imageData, point)
    {
        return (point.y * imageData.width + point.x) * this.getNumChannels();
    }

    offsetPointForDrawing(p)
    {
        return p.clone().move(new Point().setXY(-this.radius, -this.radius));
    }

    getIdealDrawInterpolationSize()
    {
        return Math.max(Math.round(this.radius * 0.1), 1);
    }

    interpolateBetweenPoints(start, end, stepSize = 1, includeStart = true, snapEnd = true)
    {
        if(!start) { return [end.clone()]; }
        if(!end) { return [start.clone()]; }

        const vec = start.clone().vecTo(end);
        const vecNorm = vec.clone().normalize().scaleFactor(stepSize);
        const vecLength = vec.length();
        const numSteps = Math.ceil(vec.length() / stepSize);

        if(vecLength <= 1) { return [end.clone()]; }

        let pos = start.clone();
        const list = [];
        if(includeStart) { list.push(pos.clone()); }

        for(let i = 0; i < numSteps; i++)
        {
            pos.move(vecNorm);
            
            const lastPoint = i == (numSteps - 1);
            if(lastPoint && snapEnd) { pos = end.clone(); }

            list.push(pos.clone());
        } 
        return list;
    }

    updateSmudgeCanvas(pos, canvasToCopy)
    {
        // first copy what's underneath us in the actual canvas
        const canv = this.canvasSmudgeCached;
        const ctx = canv.getContext("2d");
        ctx.clearRect(0, 0, canv.width, canv.height);
        ctx.drawImage(canvasToCopy, 
            pos.x - 0.5*canv.width, pos.y - 0.5*canv.height, // sourceX, sourceY
            canv.width, canv.height, // sourceW, sourceH
            0, 0, // destX, destY
            canv.width, canv.height // destW, destH
        );
            
        // then feather it by putting the gradient on top
        ctx.save();
        ctx.fillStyle = this.gradientCached;
        ctx.globalCompositeOperation = "destination-out";
        ctx.translate(0.5 * canv.width, 0.5 * canv.height);
        ctx.fillRect(-0.5*canv.width, -0.5*canv.height, canv.width, canv.height);
        ctx.restore();
    }

    createFeatherGradient(canvas) 
    {
        const ctx = canvas.getContext("2d");
        const innerRadius = Math.min(this.radius * this.hardness, this.radius - 1);
        const gradient = ctx.createRadialGradient(
          0, 0, innerRadius,
          0, 0, this.radius);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        return gradient;
    }
}
import Point from "../point"
import Config from "../config"
import Color from "../color";
import { ToolParams } from "./main";
import Tool from "./tool";

const NEIGHBOR_OFFSETS = [
    new Point().setXY(1,0),
    new Point().setXY(0,1),
    new Point().setXY(-1,0),
    new Point().setXY(0,-1)
]

export default class FillTool extends Tool
{
    constructor()
    {
        super();
        this.cursor = "cell";
    }

    onDrawEnd(params:ToolParams)
    {
        this.floodFill(params);
    }

    floodFill(params:ToolParams)
    {
        const pos = params.pos.clone().round();
        const canvas = params.pqPaint.getCanvas();
        const ctxRead = canvas.getContextOutput();
        const ctxWrite = canvas.getContextActive();
        const canvasSize = canvas.getSize();
        const startingColor = canvas.readColorAt(pos);

        const pixelsToCheck = [pos];
        const pixelsFlooded = [];

        // save which pixels were already checked as a 2D array; 
        // WAY faster lookup (on large resolution canvases)
        const pixelsChecked = [];
        for(let x = 0; x < canvasSize.width; x++)
        {
            pixelsChecked[x] = [];
            for(let y = 0; y < canvasSize.height; y++)
            {
                pixelsChecked[x][y] = null;
            }
        }

        const imageData = ctxRead.getImageData(0, 0, canvasSize.width, canvasSize.height);
        
        // first, find all connected pixels with the same or similar colors
        while(pixelsToCheck.length > 0)
        {
            const pixel = pixelsToCheck.pop();
            const cachedVal = pixelsChecked[pixel.x][pixel.y];
            const color = cachedVal ?? this.getPixelRaw(imageData, pixel);
            pixelsChecked[pixel.x][pixel.y] = color;

            // @TODO: pixelsChecked contains all read pixel values, use that to check dissimilarity with (known) NEIGHBORS
            // If very close, allow flood fill to continue?

            const tooDissimilar = this.colorsTooFarApart(startingColor, color, Config.MAX_DIFFERENCE_FOR_FLOOD_FILL);
            if(tooDissimilar) { continue; }

            pixelsFlooded.push(pixel);

            const nbs = this.getNeighbors(pixel, canvasSize);
            for(const nb of nbs)
            {
                const alreadyHandled = pixelsChecked[nb.x][nb.y];
                if(alreadyHandled) { continue; }
                pixelsToCheck.push(nb);
                pixelsChecked[nb.x][nb.y] = this.getPixelRaw(imageData, nb);
            }
        }

        // second, actually fill all those pixels with the brush color
        const brush = params.pqPaint.getBrush();
        brush.fillPixelListRaw(imageData, pixelsFlooded);
        ctxWrite.putImageData(imageData, 0, 0);

        canvas.commitCanvasActive();
    }

    colorsTooFarApart(color:Color, raw, t)
    {
        return Math.abs(color.r - raw[0]/255.0) > t || Math.abs(color.g - raw[1]/255.0) > t ||  Math.abs(color.b - raw[2]/255.0) > t;
    }

    getPixelRaw(imageData, point:Point) 
    {
        const offset = (point.y * imageData.width + point.x) * 4;
        return imageData.data.slice(offset, offset + 4);
    }

    outOfBounds(pos:Point, canvasSize)
    {
        return (pos.x < 0 || pos.y < 0) || (pos.x >= canvasSize.width || pos.y >= canvasSize.height);
    }

    getNeighbors(pixel, canvasSize)
    {
        const list = [];
        for(let i = 0; i < 4; i++)
        {
            const nbPos = pixel.clone();
            nbPos.move(NEIGHBOR_OFFSETS[i]);
            if(this.outOfBounds(nbPos, canvasSize)) { continue; }
            list.push(nbPos.round());
        }
        return list;
    }
}
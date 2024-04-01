import Point from "../point"
import CanvasOperation from "../canvasOperation";
import Tool from "./tool";
import { ToolParams } from "./main";

export default class SmudgeTool extends Tool
{
    brushCanvas: HTMLCanvasElement;

    constructor()
    {
        super();
        this.cursor = "pointer";
        this.brushCanvas = null;
    }
    
    getBrushCanvas() { return this.brushCanvas; }
    updateBrushCanvas(params:ToolParams)
    {
        const brush = params.pqPaint.getBrush()
        const canvasToCopy = params.pqPaint.getCanvas().getCanvasOutput();
        const pos = params.pos.clone();
        brush.updateSmudgeCanvas(pos, canvasToCopy);
    }

    onDrawStart(params:ToolParams)
    {
        this.updateBrushCanvas(params);
        this.brushCanvas = params.pqPaint.getBrush().getSmudgeImage();
    }

    onDrawProgress(params:ToolParams)
    {
        const canvas = params.pqPaint.getCanvas();
        const brush = params.pqPaint.getBrush();
        const points = brush.interpolateBetweenPoints(params.lastDrawPos.clone(), params.pos.clone(), 1, false);

        console.log(points);

        const numPoints = points.length;
        let counter = 0;
        for(const point of points)
        {
            const operation = new CanvasOperation();
            const alphaDecay = 1.0; // tried this, didn't really work => 1.0 - counter / numPoints;
            operation.alpha = brush.getOpacity() * alphaDecay;
            operation.canvas = this.getBrushCanvas();
            
            const pointCentered = brush.offsetPointForDrawing(point);
            operation.addPoint(pointCentered);
            canvas.drawOnActiveCanvas(operation);

            this.updateBrushCanvas(params);
            counter++;
        }        
    }

    onDrawEnd(params:ToolParams)
    {
        params.pqPaint.getCanvas().commitCanvasActive();
        this.brushCanvas = null;
    }


}
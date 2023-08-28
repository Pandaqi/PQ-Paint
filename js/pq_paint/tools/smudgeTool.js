import Point from "../point"
import CanvasOperation from "../canvasOperation";

export default class SmudgeTool
{
    constructor()
    {
        this.cursor = "pointer";
        this.brushCanvas = null;
    }
    
    getBrushCanvas() { return this.brushCanvas; }
    updateBrushCanvas(params)
    {
        const brush = params.pqPaint.getBrush()
        const canvasToCopy = params.pqPaint.getCanvas().getCanvasOutput();
        const pos = params.pos.clone();
        brush.updateSmudgeCanvas(pos, canvasToCopy);
    }

    onDrawStart(params)
    {
        this.updateBrushCanvas(params);
        this.brushCanvas = params.pqPaint.getBrush().getSmudgeImage();
    }

    onDrawProgress(params)
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

    onDrawEnd(params)
    {
        params.pqPaint.getCanvas().commitCanvasActive();
        this.brushCanvas = null;
    }


}
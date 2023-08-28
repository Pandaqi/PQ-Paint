import CanvasOperation from "../canvasOperation"
import Config from "../config"

export default class BrushTool
{
    constructor()
    {
        this.drawCanvas = null;
        this.cursor = "pointer";
        this.compositeOperation = "source-over"; // multiply? darken?
    }

    onDrawStart(params)
    {
        this.points = [];
        this.drawCanvas = params.pqPaint.getBrush().getImage();
        this.drawAt(params);
    }

    onDrawProgress(params)
    {
        this.drawAt(params);
    }

    onDrawEnd(params)
    {
        params.pqPaint.getCanvas().commitCanvasActive();
        this.drawCanvas = null;
        this.points = [];
    }

    drawAt(params)
    {
        this.points.push(params);
        const brush = params.pqPaint.getBrush();
        const pointList = this.getSmoothPointList(brush);
        const canvasOperation = this.createCanvasOperation(brush, pointList);
        params.pqPaint.getCanvas().drawOnActiveCanvas(canvasOperation);
    }

    getSmoothPointList(brush)
    {
        const list = [];
        let lastPoint = null;
        for(const rawData of this.points)
        {
            //const dist = !lastPoint ? Infinity : rawData.pos.distTo(lastPoint);
            //if(dist <= brush.getIdealDrawInterpolationSize()) { continue; }
            list.push(rawData.pos);
            lastPoint = rawData.pos;
        }
        return list;
    }

    createCanvasOperation(brush, points)
    {
        const canvasOperation = new CanvasOperation();
        canvasOperation.alpha = brush.getOpacity();
        canvasOperation.composite = this.compositeOperation;
        canvasOperation.canvas = this.drawCanvas;
        canvasOperation.clearBefore = true;

        let lastPoint = null;
        const stepSize = Config.BRUSH_TOOL_STEP_SIZE
        for(const point of points)
        {
            const pointsInterpolated = brush.interpolateBetweenPoints(lastPoint, point, stepSize);
            for(const pointInter of pointsInterpolated)
            {
                const pointCentered = brush.offsetPointForDrawing(pointInter);
                canvasOperation.addPoint(pointCentered);
            }
            lastPoint = point;
        }

        return canvasOperation;
    }
}
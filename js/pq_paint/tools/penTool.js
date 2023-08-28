import CanvasOperation from "../canvasOperation"
import Config from "../config"

export default class PenTool
{
    constructor()
    {
        this.cursor = "pointer";
        this.compositeOperation = "source-over";
    }

    onDrawStart(params)
    {
        this.points = [];
        this.drawAt(params);
    }

    onDrawProgress(params)
    {
        this.points.push(params);
        this.drawAt(params);
    }

    onDrawEnd(params)
    {
        params.pqPaint.getCanvas().commitCanvasActive();
        this.points = [];
    }

    drawAt(params)
    {
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
            const dist = !lastPoint ? Infinity : rawData.pos.distTo(lastPoint);
            if(dist <= brush.getIdealDrawInterpolationSize()) { continue; }
            list.push(rawData.pos);
            lastPoint = rawData.pos;
        }
        return list;
    }

    createCanvasOperation(brush, pointList)
    {
        const canvasOperation = new CanvasOperation();
        canvasOperation.alpha = brush.getOpacity();
        canvasOperation.composite = this.compositeOperation;
        canvasOperation.clearBefore = true;
        canvasOperation.setLineSettings(brush.getColor(), 2*brush.getSize());

        let lastPoint = null;
        const stepSize = Config.PEN_TOOL_STEP_SIZE
        for(const point of pointList)
        {
            const pointsInterpolated = brush.interpolateBetweenPoints(lastPoint, point, stepSize);
            for(const pointInter of pointsInterpolated)
            {
                canvasOperation.addPoint(pointInter);
            }
            lastPoint = point;
        }

        return canvasOperation;
    }
}
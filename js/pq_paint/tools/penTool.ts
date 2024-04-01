import Brush from "../brush";
import CanvasOperation from "../canvasOperation"
import Config from "../config"
import Point from "../point";
import { ToolParams } from "./main";
import Tool from "./tool";

export default class PenTool extends Tool
{
    compositeOperation: GlobalCompositeOperation;
    points: ToolParams[];

    constructor()
    {
        super();
        this.cursor = "pointer";
        this.compositeOperation = "source-over";
    }

    onDrawStart(params:ToolParams)
    {
        this.points = [];
        this.drawAt(params);
    }

    onDrawProgress(params:ToolParams)
    {
        this.points.push(params);
        this.drawAt(params);
    }

    onDrawEnd(params:ToolParams)
    {
        params.pqPaint.getCanvas().commitCanvasActive();
        this.points = [];
    }

    drawAt(params:ToolParams)
    {
        const brush = params.pqPaint.getBrush();
        const pointList = this.getSmoothPointList(brush);
        const canvasOperation = this.createCanvasOperation(brush, pointList);
        params.pqPaint.getCanvas().drawOnActiveCanvas(canvasOperation);
    }

    getSmoothPointList(brush:Brush)
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

    createCanvasOperation(brush:Brush, pointList:Point[])
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
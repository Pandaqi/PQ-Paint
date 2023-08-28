import BrushTool from "./brushTool"

export default class EraserTool
{
    constructor()
    {
        this.cursor = "pointer";
        this.eraser = true;
    }

    onDrawStart(params)
    {
        this.brushTool = new BrushTool();
        this.brushTool.onDrawStart(params);
    }

    onDrawProgress(params)
    {
        this.brushTool.onDrawProgress(params);
    }

    onDrawEnd(params)
    {
        this.brushTool.onDrawEnd(params);
    }
}
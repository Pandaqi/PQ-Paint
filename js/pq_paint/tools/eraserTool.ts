import BrushTool from "./brushTool"
import { ToolParams } from "./main";
import Tool from "./tool";

export default class EraserTool extends Tool
{
    eraser: boolean;
    brushTool: BrushTool;

    constructor()
    {
        super();
        this.cursor = "pointer";
        this.eraser = true;
    }

    onDrawStart(params:ToolParams)
    {
        this.brushTool = new BrushTool();
        this.brushTool.onDrawStart(params);
    }

    onDrawProgress(params:ToolParams)
    {
        this.brushTool.onDrawProgress(params);
    }

    onDrawEnd(params:ToolParams)
    {
        this.brushTool.onDrawEnd(params);
    }
}
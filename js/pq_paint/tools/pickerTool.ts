import { ToolParams } from "./main";
import Tool from "./tool";

export default class PickerTool extends Tool
{
    constructor()
    {
        super();
        this.cursor = "crosshair";
    }

    onDrawStart(params:ToolParams)
    {
        this.readAndSetColor(params);
    }

    onDrawProgress(params:ToolParams)
    {
        this.readAndSetColor(params);
    }

    onDrawEnd(params:ToolParams)
    {
        this.readAndSetColor(params);
    }

    readAndSetColor(params:ToolParams)
    {
        const color = params.pqPaint.getCanvas().readColorAt(params.pos);
        params.pqPaint.getBrush().setColor(color);
    }
}
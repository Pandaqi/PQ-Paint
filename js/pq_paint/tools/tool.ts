import { ToolParams } from "./main";

export default class Tool
{
    cursor: string

    onDrawStart(params:ToolParams) {}
    onDrawProgress(params:ToolParams) {}
    onDrawEnd(params:ToolParams) {}
}
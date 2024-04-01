import { BrushParams } from "./brush";
import Color from "./color"

class Config
{
    RADIUS_BOUNDS: { min: number; max: number; };
    MAX_UNDO: number;
    MAX_DIFFERENCE_FOR_FLOOD_FILL: number;
    PEN_TOOL_STEP_SIZE: number;
    BRUSH_TOOL_STEP_SIZE: number;
    DEFAULT_BRUSH_PARAMS: BrushParams;
    DEFAULT_TOOL: string;
    toolTooltips: Record<string, string>;
    eventNode: HTMLDivElement;

    constructor()
    {
        this.RADIUS_BOUNDS = { min: 1, max: 72 };
        this.MAX_UNDO = 15;
        this.MAX_DIFFERENCE_FOR_FLOOD_FILL = 0.15;
        this.PEN_TOOL_STEP_SIZE = 2;
        this.BRUSH_TOOL_STEP_SIZE = 1;

        this.DEFAULT_BRUSH_PARAMS = {
            radius: 15,
            hardness: 0.5,
            opacity: 1.0,
            color: new Color(1, 0.5, 0.5)
        }

        this.DEFAULT_TOOL = "pen";
        this.toolTooltips = {
            "pen": "Pen Tool | Paint new strokes with hard, precise brush",
            "brush": "Brush Tool | Paint new strokes with soft brush",
            "eraser": "Eraser Tool | Erase parts of the existing painting",
            "picker": "Picker Tool | Click in the image to select the color at that pixel",
            "fill": "Fill Tool | Click to fill an entire (enclosed) area with a single color",
            "smudge": "Smudge Tool | Click and drag to mix/blend two colors"
        }
        this.createEventNode();
    }

    clamp(val, boundDict)
    {
        return Math.min(Math.max(val, boundDict.min), boundDict.max);
    }

    createEventNode()
    {
        this.eventNode = document.createElement("div");
    }

    dispatchEvent(name, detailObject)
    {
        const ev = new CustomEvent(name, { detail: detailObject });
        this.eventNode.dispatchEvent(ev)
    }
    
    addEventListener(name, callback)
    {
        this.eventNode.addEventListener(name, (ev) => { callback(ev); });
    }
}

export default new Config();
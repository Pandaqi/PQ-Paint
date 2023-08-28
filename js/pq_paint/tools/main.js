import BrushTool from "./brushTool"
import EraserTool from "./eraserTool"
import PickerTool from "./pickerTool"
import FillTool from "./fillTool"
import SmudgeTool from "./smudgeTool"
import PenTool from "./penTool"

import Config from "../config"

export default class Tools
{
    constructor()
    {
        this.toolSelected = Config.DEFAULT_TOOL;
        this.tools = {
            "pen": new PenTool(),
            "brush": new BrushTool(),
            "eraser": new EraserTool(),
            "picker": new PickerTool(),
            "fill": new FillTool(),
            //"smudge": new SmudgeTool(),
        }

        this.listenForSignals();
    }

    listenForSignals()
    {
        Config.addEventListener("drawStart", (ev) => { this.getSelected().onDrawStart(ev.detail.params); })
        Config.addEventListener("drawProgress", (ev) => { this.getSelected().onDrawProgress(ev.detail.params); })
        Config.addEventListener("drawEnd", (ev) => { this.getSelected().onDrawEnd(ev.detail.params); })
    }
    
    toolExists(val) {
        return Object.keys(this.tools).includes(val);
    }
    setTo(val) { 
        val = val.toLowerCase();
        if(!this.toolExists(val)) { return console.error("No tool exists with name", val); }
        this.toolSelected = val;
        Config.dispatchEvent("toolChanged", { tool : this.getSelected() });
    }
    getDictionary() { return this.tools; }
    getSelectedName() { return this.toolSelected; }
    getSelected()
    {
        return this.tools[this.toolSelected];
    }

    getCompositeOperation()
    {
        return this.getSelected().eraser ? "destination-out" : "source-over";
    }
}
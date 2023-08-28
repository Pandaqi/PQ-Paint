import Brush from "./brush"
import PaintCanvas from "./paintCanvas"
import PaintInterface from "./paintInterface"
import Tools from "./tools/main"
import Config from "./config"

export default class PandaqiPaint
{
    constructor(node)
    {
        this.node = node;
        this.brush = new Brush();
        this.tools = new Tools();

        this.history = [];

        this.createCanvas();
        this.createInterface();
    }

    getContainerNode()
    {
        return this.node;
    }

    getBrush()
    {
        return this.brush;
    }

    getTools() { return this.tools; }

    getCanvas() { return this.canvas; }
    createCanvas()
    {
        this.canvas = new PaintCanvas(this);
    }

    getInterface() { return this.interface; }
    createInterface()
    {
        this.interface = new PaintInterface(this);
    }

    undo() { this.popState(); }
    pushState(state) 
    { 
        this.history.push(state);
        if(this.history.length >= Config.MAX_UNDO) { this.history.shift(); }
    }

    popState() { 
        if(this.history.length <= 1) { return; }
        this.history.pop();
        const state = this.history[this.history.length - 1];
        this.getCanvas().setStateTo(state);
    }
}
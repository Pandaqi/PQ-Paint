import { LineParams } from "./brush";
import Color from "./color";
import Point from "./point";

export default class CanvasOperation
{
    alpha: number;
    canvas: HTMLCanvasElement;
    composite: string;
    points: Point[];
    clearBefore: boolean;
    saveStateAfterwards: boolean;
    lineSettings: LineParams;
    
    constructor()
    {
        this.alpha = 1.0;
        this.canvas = null;
        this.composite = "source-over";
        this.points = [];
        this.clearBefore = false;
        this.saveStateAfterwards = false;
        this.lineSettings = {};
    }

    usesImage() { return this.canvas != null; }
    usesVector() { return this.canvas == null; }

    getLineSettings() { return this.lineSettings; }
    setLineSettings(c:Color, w:number)
    {
        this.lineSettings.color = c;
        this.lineSettings.lineWidth = w;
    }

    getPoints() { return this.points; }
    addPoint(p:Point)
    {
        this.points.push(p);
    }
}
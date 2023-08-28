export default class CanvasOperation
{
    constructor()
    {
        this.alpha = 1.0;
        this.canvas = null;
        this.composite = "source-over";
        this.points = [];
        this.clearBefore = false;
        this.saveStateAfterwards = false;
        this.lineSettings = { color: null, lineWidth: null };
    }

    usesImage() { return this.canvas != null; }
    usesVector() { return this.canvas == null; }

    getLineSettings() { return this.lineSettings; }
    setLineSettings(c, w)
    {
        this.lineSettings.color = c;
        this.lineSettings.lineWidth = w;
    }

    getPoints() { return this.points; }
    addPoint(p)
    {
        this.points.push(p);
    }
}
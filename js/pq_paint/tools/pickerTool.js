export default class PickerTool
{
    constructor()
    {
        this.cursor = "crosshair";
    }

    onDrawStart(params)
    {
        this.readAndSetColor(params);
    }

    onDrawProgress(params)
    {
        this.readAndSetColor(params);
    }

    onDrawEnd(params)
    {
        this.readAndSetColor(params);
    }

    readAndSetColor(params)
    {
        const color = params.pqPaint.getCanvas().readColorAt(params.pos);
        params.pqPaint.getBrush().setColor(color);
    }
}
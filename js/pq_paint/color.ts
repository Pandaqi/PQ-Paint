export default class Color
{
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r = 1.0, g = 1.0, b = 1.0, a = 1.0)
    {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    clone()
    {
        return new Color(this.r, this.g, this.b, this.a);
    }

    clamp(val:number)
    {
        return Math.min(Math.max(val, 0.0), 1.0);
    }

    componentToHex(c:number) {
        var hex = (Math.round(c*255)).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
      
    toHex() { return "#" + this.componentToHex(this.r) + this.componentToHex(this.g) + this.componentToHex(this.b); }
    fromHex(hex:string)
    {
        const data = this.convertHexToRgb(hex);
        this.setChannel("r", data.r/255.0);
        this.setChannel("g", data.b/255.0);
        this.setChannel("b", data.b/255.0);
        return this;
    }
    convertHexToRgb(hex:string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : null;
    }

    toString()
    {
        return "rgba(" + this.r*255 + ", " + this.g*255 + ", " + this.b*255 + ", " + this.a + ")";
    }

    getChannel(channelName:string) { return this[channelName]; }
    setChannel(channelName:string, value:number)
    {
        this[channelName] = value;
        return this;
    }

    setAlpha(a:number)
    {
        this.a = this.clamp(a);
        return this;
    }

    distanceTo(otherColor:Color)
    {
        const r = Math.abs(this.r - otherColor.r);
        const g = Math.abs(this.g - otherColor.g);
        const b = Math.abs(this.b - otherColor.b);
        const a = Math.abs(this.a - otherColor.a);
        return (r + g + b + a) / 4.0;
    }
}
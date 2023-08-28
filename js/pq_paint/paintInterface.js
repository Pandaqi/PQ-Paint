import Color from "./color"
import Config from "./config"

export default class PaintInterface
{
    constructor(pqPaint)
    {
        this.pqPaint = pqPaint;
        this.createHTML();
    }

    createHTML()
    {
        const cont = document.createElement("div");
        cont.classList.add("paint-interface");
        this.pqPaint.getContainerNode().appendChild(cont);
        this.node = cont;

        this.createToolSet();
        this.createButtons();
        this.createColorPicker();
        this.createBrushProperties();
    }

    createButton(params)
    {
        const btn = document.createElement("button");
        btn.innerHTML = params.text;
        btn.title = params.title;
        btn.dataset.label = params.text.toLowerCase();

        const parent = params.node || this.node;
        parent.appendChild(btn);

        const callback = params.callback;

        btn.addEventListener("click", (ev) => {
            callback();
        })
    }

    createButtons()
    {
        const cont = document.createElement("div");
        cont.classList.add("paint-buttons");
        this.node.appendChild(cont);

        const params = {
            text: "Clear",
            node: cont,
            title: "Clears the entire canvas",
            callback: () => { this.pqPaint.getCanvas().clearOutput(); }
        }
        const clearBtn = this.createButton(params);

        params.text = "Download";
        params.title = "Download the current painting as an image file";
        params.callback = () => { this.pqPaint.getCanvas().download(); }
        const downloadBtn = this.createButton(params);

        params.text = "Undo";
        params.callback = () => { this.pqPaint.undo(); }
        params.title = "Undo the last change";
        const undoBtn = this.createButton(params);

    }

    createToolSet()
    {
        const cont = document.createElement("div");
        cont.classList.add("tool-set");
        this.node.appendChild(cont);

        const toolsObject = this.pqPaint.getTools();
        const toolsList = Object.keys(toolsObject.getDictionary());

        const params = {
            node: cont,
            values: toolsList,
            titles: Config.toolTooltips,
            valueDefault: toolsObject.getSelectedName(),
            callback: (val) => { this.pqPaint.getTools().setTo(val); }
        }

        this.createRadioButtons(params);
    }

    createColorPicker()
    {
        const cont = document.createElement("div");
        cont.classList.add("color-picker");
        this.node.appendChild(cont);

        const inputColor = document.createElement("input");
        inputColor.type = "color";
        inputColor.title = "Click this to select a new color";
        cont.appendChild(inputColor);
        inputColor.addEventListener("input", (ev) => {
            const c = new Color().fromHex(inputColor.value);
            this.pqPaint.getBrush().setColor(c);
        })

        Config.addEventListener("brushChanged", (ev) => {
            inputColor.value = ev.detail.brush.getColor().toHex();
        })

        const subCont = document.createElement("div");
        subCont.classList.add("color-picker-sliders");
        cont.appendChild(subCont);

        const params = {
            node: subCont,
            label: "Red",
            title: "Change the color's amount of red",
            value: this.pqPaint.getBrush().getColorChannel("r"),
            callback: (val) => { this.pqPaint.getBrush().setColorChannel("r", val); }
        }
        this.createSlider(params);

        params.label = "Green";
        params.title = "Change the color's amount of green";
        params.value = this.pqPaint.getBrush().getColorChannel("g");
        params.callback = (val) => { this.pqPaint.getBrush().setColorChannel("g", val); }
        this.createSlider(params);

        params.label = "Blue";
        params.title = "Change the color's amount of blue";
        params.value = this.pqPaint.getBrush().getColorChannel("b");
        params.callback = (val) => { this.pqPaint.getBrush().setColorChannel("b", val); }
        this.createSlider(params);
    }

    createBrushProperties()
    {
        const cont = document.createElement("div");
        cont.classList.add("brush-properties");
        this.node.appendChild(cont);

        const preview = document.createElement("div");
        preview.classList.add("brush-preview");
        preview.title = "A preview of what the currently selected brush looks like"
        cont.appendChild(preview);
        this.brushPreview = preview;

        Config.addEventListener("brushChanged", (ev) => {
            preview.innerHTML = "";
            const brush = ev.detail.brush;
            preview.appendChild(brush.getPreviewCanvas());
        });

        const subCont = document.createElement("div");
        cont.appendChild(subCont);

        const params = {
            node: subCont,
            label: "Opacity",
            title: "Modify how transparent the brush is",
            value: this.pqPaint.getBrush().getOpacity(),
            callback: (val) => { this.pqPaint.getBrush().setOpacity(val); }
        }
        this.createSlider(params);

        params.label = "Hardness";
        params.title = "Modify how hard the edges of the brush are";
        params.value = this.pqPaint.getBrush().getHardness();
        params.callback = (val) => { this.pqPaint.getBrush().setHardness(val); }
        this.createSlider(params);

        params.label = "Size";
        params.callback = (val) => { this.pqPaint.getBrush().setSize(val); }
        params.title = "Modify the brush size";
        params.min = Config.RADIUS_BOUNDS.min;
        params.max = Config.RADIUS_BOUNDS.max;
        params.step = 1;
        params.value = this.pqPaint.getBrush().getSize();
        this.createSlider(params);
    }

    createSlider(params = {})
    {
        const parent = params.node || this.node;
        
        const cont = document.createElement("div");
        parent.appendChild(cont);
        cont.classList.add("slider-input");
        cont.dataset.label = params.label.toLowerCase();
        cont.title = params.title;

        const label = document.createElement("label");
        cont.appendChild(label);
        label.innerHTML = params.label || "Label";

        const inp = document.createElement("input");
        cont.appendChild(inp);
        inp.type = "range";
        inp.min = params.min ?? 0;
        inp.max = params.max ?? 1;
        inp.step = params.step || 0.05;

        const avgValue = 0.5*(parseFloat(inp.min) + parseFloat(inp.max));
        inp.value = params.value ?? avgValue;

        const emptyCallback = (val) => {};
        const callback = params.callback || emptyCallback;
        inp.addEventListener("input", (ev) => {
            callback(parseFloat(inp.value));
        });

        const fakeEvent = new Event("input");
        inp.dispatchEvent(fakeEvent);
    }

    humanize(txt)
    {
        return txt.slice(0,1).toUpperCase() + txt.slice(1);
    }

    createRadioButtons(params)
    {
        const values = params.values;
        const buttons = [];
        params.allNodes = buttons;

        const valueDefault = params.valueDefault ?? values[0]; 
        let indexDefault = -1;

        for(let i = 0; i < values.length; i++)
        {
            const v = values[i];
            params.value = this.humanize(v);
            params.title = params.titles[v];
            buttons.push( this.createRadioButton(params) );
            if(v == valueDefault) { indexDefault = i; }
        }

        const defaultOption = buttons[indexDefault];
        this.fakeClickButton(defaultOption); 
    }

    createRadioButton(params)
    {
        const parent = params.node || this.node;
        const value = params.value;

        const btn = document.createElement("button");
        btn.innerHTML = value;
        btn.dataset.label = value.toLowerCase();
        btn.title = params.title;
        parent.appendChild(btn);

        btn.addEventListener("click", (ev) => {

            this.changeRadioButton(btn, true);
            for(const otherNode of params.allNodes)
            {
                const itsUs = otherNode == btn;
                if(itsUs) { continue; }
                this.changeRadioButton(otherNode, false);
            }

            params.callback(value);
        })

        return btn;
    }

    changeRadioButton(node, toggled)
    {
        const val = toggled ? "toggled" : "";
        node.dataset.toggled = val;
    }

    fakeClickButton(node)
    {
        const fakeEvent = new Event("click");
        node.dispatchEvent(fakeEvent);
    }
}
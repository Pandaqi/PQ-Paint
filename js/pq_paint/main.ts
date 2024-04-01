import PandaqiPaint from "./pandaqiPaint"

window.addEventListener('load', () => {
    const pqPaints : PandaqiPaint[] = [];
    const pqPaintNodes = Array.from(document.getElementsByClassName("pandaqi-paint")) as HTMLElement[];
    for(const pqPaintNode of pqPaintNodes)
    {
        pqPaints.push(new PandaqiPaint(pqPaintNode));
    }

    // @ts-ignore
    window.PQ_PAINT = {
        nodes: pqPaints
    };
})


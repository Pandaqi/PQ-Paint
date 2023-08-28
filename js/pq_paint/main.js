import PandaqiPaint from "./pandaqiPaint"

window.addEventListener('load', function () {
    const pqPaints = [];
    const pqPaintNodes = document.getElementsByClassName("pandaqi-paint");
    for(const pqPaintNode of pqPaintNodes)
    {
        pqPaints.push(new PandaqiPaint(pqPaintNode));
    }

    window.PQ_PAINT = {
        nodes: pqPaints
    };
})


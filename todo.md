# Future To-Do

* Pen Tool => smoothing (bezier curves / splines / equidistant points)

* Swatches
  * Display a few default colors + brush settings
  * When clicked, it uses those
  * You can also save your current COLOR or BRUSH, and it will add it to the list. (Through localStorage, so it's persistent.)

* Layers?

* Figure out why my SMUDGE tool isn't working 80% of the time ...
  * When you go _really_ slowly, it works (with hardness low, opacity high)
  * Otherwise it just goes insane

* Brush/Eraser tool => custom cursor image?
  * Allow several images for soft brush (square, circle, etcetera) 
  * Currently, it takes a heavy performance hit if you draw a long stroke, for it redraws the whole thing while mouse is being held. Can we prevent this? (Without it, opacity isn't applied uniformly and thus ugly.)

* Try a true soft brush with path/geometry magic.
  * Collect all pixels near path.
  * For all of them, check closest distance to line, use that to fade alpha.
  * We do this _afterwards_, when we already know the whole line, to get an even alpha
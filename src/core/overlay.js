export function addOverlayImage(imageContext, x, y, width, height, opacity = 0.5) {
  var elem = document.createElement('div');
  var shown = false;
  var ismag = false;
  elem.style.position = 'fixed';
  elem.style.transformOrigin = 'left top 0px';
  elem.style.overflow = 'hidden';
  elem.style.width = width * 16 + 'px';
  elem.style.height = height * 16 + 'px';
  elem.style.backgroundImage = `url(${imageContext.canvas.toDataURL()})`;
  elem.style.opacity = opacity.toString();
  elem.style.backgroundSize = 'contain';

  var move = function() {
    var sc = OWOP.camera.zoom / 16;
    var tx = ((-OWOP.camera.x + x) * OWOP.camera.zoom);
    var ty = ((-OWOP.camera.y + y) * OWOP.camera.zoom);

    if (tx > -width * sc && ty > -height * sc && tx < window.innerWidth && ty < window.innerHeight) {
      if (sc > 1.0 && !ismag) {
        ismag = true;
        elem.style.imageRendering = 'pixelated';
      } else if (sc <= 1.0 && ismag) {
        ismag = false;
        elem.style.imageRendering = 'auto';
      }

      elem.style.transform = `matrix(${sc},0,0,${sc},${Math.round(tx)},${Math.round(ty)})`;
      if (!shown) {
        OWOP.elements.viewport.appendChild(elem);
        shown = true;
      }
    } else {
      if (shown) {
        elem.remove();
        shown = false;
      }
    }
  };

  var getColorFromImage = function(event) {
    var rect = elem.getBoundingClientRect();
    var x = (event.clientX - rect.left) / OWOP.camera.zoom;
    var y = (event.clientY - rect.top) / OWOP.camera.zoom;
    var pixel;
    try {
      pixel = imageContext.getImageData(x, y, 1, 1).data;
      OWOP.player.selectedColor = [pixel[0], pixel[1], pixel[2]];
    } catch (e) {
      console.error("Failed to get image data:", e);
    }
  };

  elem.addEventListener('click', function(event) {
    if (event.ctrlKey) {
      getColorFromImage(event);
    }
  });

  if (OWOP.events.camMoved) {
    OWOP.on(OWOP.events.camMoved, move);
    move();
  }
}
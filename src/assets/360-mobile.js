// Import everything from three
import * as THREE from '/src/threejs/three.module.min.js';

// Assign variables
let camera, scene, renderer;

// Assign variables to not rotate the image when user rotates the image manually
let isUserInteracting = false,
    onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    lon = 0, onPointerDownLon = 0,
    lat = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;

// Run functions in loop
init();
animate();

// Initialize function
function init() {

    // Get container from html
    const container = document.getElementById('container');

    // Add new camera with a POV of 100°
    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1100);

    // Create new scene
    scene = new THREE.Scene();

    // Add new geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(- 1, 1, 1);

    // Create new texture with the 360 image
    const texture = new THREE.TextureLoader().load('/src/assets/output.JPG');
    const material = new THREE.MeshBasicMaterial({ map: texture });

    // Create the mesh from geometry and material
    const mesh = new THREE.Mesh(geometry, material);

    // Add mesh to scene
    scene.add(mesh);

    // Add WebGLRenderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    container.style.touchAction = 'none';
    container.addEventListener('pointerdown', onPointerDown);

    document.addEventListener('wheel', onDocumentMouseWheel);


    document.addEventListener('dragover', function (event) {

        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

    });

    document.addEventListener('dragenter', function () {

        document.body.style.opacity = 0.5;

    });

    document.addEventListener('dragleave', function () {

        document.body.style.opacity = 1;

    });

    document.addEventListener('drop', function (event) {

        event.preventDefault();

        const reader = new FileReader();
        reader.addEventListener('load', function (event) {

            material.map.image.src = event.target.result;
            material.map.needsUpdate = true;

        });
        reader.readAsDataURL(event.dataTransfer.files[0]);

        document.body.style.opacity = 1;

    });

    //

    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function onPointerDown(event) {

    if (event.isPrimary === false) return;

    isUserInteracting = true;

    onPointerDownMouseX = event.clientX;
    onPointerDownMouseY = event.clientY;

    onPointerDownLon = lon;
    onPointerDownLat = lat;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);

}

function onPointerMove(event) {

    if (event.isPrimary === false) return;

    lon = (onPointerDownMouseX - event.clientX) * 0.1 + onPointerDownLon;
    lat = (event.clientY - onPointerDownMouseY) * 0.1 + onPointerDownLat;

}

function onPointerUp() {

    if (event.isPrimary === false) return;

    isUserInteracting = false;

    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);

}

function onDocumentMouseWheel(event) {

    const fov = camera.fov + event.deltaY * 0.05;

    camera.fov = THREE.MathUtils.clamp(fov, 30, 100);

    camera.updateProjectionMatrix();

}












var MIN_SCALE = 1; // 1=scaling when first loaded
      var MAX_SCALE = 64;

      // HammerJS fires "pinch" and "pan" events that are cumulative in nature and not
      // deltas. Therefore, we need to store the "last" values of scale, x and y so that we can
      // adjust the UI accordingly. It isn't until the "pinchend" and "panend" events are received
      // that we can set the "last" values.

      // Our "raw" coordinates are not scaled. This allows us to only have to modify our stored
      // coordinates when the UI is updated. It also simplifies our calculations as these
      // coordinates are without respect to the current scale.

      var imgWidth = null;
      var imgHeight = null;
      var viewportWidth = null;
      var viewportHeight = null;
      var scale = null;
      var lastScale = null;
      var container = null;
      var img = null;
      var x = 0;
      var lastX = 0;
      var y = 0;
      var lastY = 0;
      var pinchCenter = null;

      // We need to disable the following event handlers so that the browser doesn't try to
      // automatically handle our image drag gestures.
      var disableImgEventHandlers = function () {
        var events = ['onclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover',
                      'onmouseup', 'ondblclick', 'onfocus', 'onblur'];

        events.forEach(function (event) {
          img[event] = function () {
            return false;
          };
        });
      };

      // Traverse the DOM to calculate the absolute position of an element
      var absolutePosition = function (el) {
        var x = 0,
          y = 0;

        while (el !== null) {
          x += el.offsetLeft;
          y += el.offsetTop;
          el = el.offsetParent;
        }

        return { x: x, y: y };
      };

      var restrictScale = function (scale) {
        if (scale < MIN_SCALE) {
          scale = MIN_SCALE;
        } else if (scale > MAX_SCALE) {
          scale = MAX_SCALE;
        }
        return scale;
      };

      var restrictRawPos = function (pos, viewportDim, imgDim) {
        if (pos < viewportDim/scale - imgDim) { // too far left/up?
          pos = viewportDim/scale - imgDim;
        } else if (pos > 0) { // too far right/down?
          pos = 0;
        }
        return pos;
      };

      var updateLastPos = function (deltaX, deltaY) {
        lastX = x;
        lastY = y;
      };

      var translate = function (deltaX, deltaY) {
        // We restrict to the min of the viewport width/height or current width/height as the
        // current width/height may be smaller than the viewport width/height

        var newX = restrictRawPos(lastX + deltaX/scale,
                                  Math.min(viewportWidth, curWidth), imgWidth);
        x = newX;
        img.style.marginLeft = Math.ceil(newX*scale) + 'px';

        var newY = restrictRawPos(lastY + deltaY/scale,
                                  Math.min(viewportHeight, curHeight), imgHeight);
        y = newY;
        img.style.marginTop = Math.ceil(newY*scale) + 'px';
      };

      var zoom = function (scaleBy) {
        scale = restrictScale(lastScale*scaleBy);

        curWidth = imgWidth*scale;
        curHeight = imgHeight*scale;

        img.style.width = Math.ceil(curWidth) + 'px';
        img.style.height = Math.ceil(curHeight) + 'px';

        // Adjust margins to make sure that we aren't out of bounds
        translate(0, 0);
      };

      var rawCenter = function (e) {
        var pos = absolutePosition(container);

        // We need to account for the scroll position
        var scrollLeft = window.pageXOffset ? window.pageXOffset : document.body.scrollLeft;
        var scrollTop = window.pageYOffset ? window.pageYOffset : document.body.scrollTop;

        var zoomX = -x + (e.center.x - pos.x + scrollLeft)/scale;
        var zoomY = -y + (e.center.y - pos.y + scrollTop)/scale;

        return { x: zoomX, y: zoomY };
      };

      var updateLastScale = function () {
        lastScale = scale;
      };

      var zoomAround = function (scaleBy, rawZoomX, rawZoomY, doNotUpdateLast) {
        // Zoom
        zoom(scaleBy);

        // New raw center of viewport
        var rawCenterX = -x + Math.min(viewportWidth, curWidth)/2/scale;
        var rawCenterY = -y + Math.min(viewportHeight, curHeight)/2/scale;

        // Delta
        var deltaX = (rawCenterX - rawZoomX)*scale;
        var deltaY = (rawCenterY - rawZoomY)*scale;

        // Translate back to zoom center
        translate(deltaX, deltaY);

        if (!doNotUpdateLast) {
          updateLastScale();
          updateLastPos();
        }
      };

      var zoomCenter = function (scaleBy) {
        // Center of viewport
        var zoomX = -x + Math.min(viewportWidth, curWidth)/2/scale;
        var zoomY = -y + Math.min(viewportHeight, curHeight)/2/scale;

        zoomAround(scaleBy, zoomX, zoomY);
      };

      var zoomIn = function () {
        zoomCenter(2);
      };

      var zoomOut = function () {
        zoomCenter(1/2);
      };

      var onLoad = function () {

        img = document.getElementById('pinch-zoom-image-id');
        container = img.parentElement;

        disableImgEventHandlers();

        imgWidth = img.width;
        imgHeight = img.height;
        viewportWidth = img.offsetWidth;
        scale = viewportWidth/imgWidth;
        lastScale = scale;
        viewportHeight = img.parentElement.offsetHeight;
        curWidth = imgWidth*scale;
        curHeight = imgHeight*scale;

        var hammer = new Hammer(container, {
          domEvents: true
        });

        hammer.get('pinch').set({
          enable: true
        });

        hammer.on('pan', function (e) {
          translate(e.deltaX, e.deltaY);
        });

        hammer.on('panend', function (e) {
          updateLastPos();
        });

        hammer.on('pinch', function (e) {

          // We only calculate the pinch center on the first pinch event as we want the center to
          // stay consistent during the entire pinch
          if (pinchCenter === null) {
            pinchCenter = rawCenter(e);
            var offsetX = pinchCenter.x*scale - (-x*scale + Math.min(viewportWidth, curWidth)/2);
            var offsetY = pinchCenter.y*scale - (-y*scale + Math.min(viewportHeight, curHeight)/2);
            pinchCenterOffset = { x: offsetX, y: offsetY };
          }

          // When the user pinch zooms, she/he expects the pinch center to remain in the same
          // relative location of the screen. To achieve this, the raw zoom center is calculated by
          // first storing the pinch center and the scaled offset to the current center of the
          // image. The new scale is then used to calculate the zoom center. This has the effect of
          // actually translating the zoom center on each pinch zoom event.
          var newScale = restrictScale(scale*e.scale);
          var zoomX = pinchCenter.x*newScale - pinchCenterOffset.x;
          var zoomY = pinchCenter.y*newScale - pinchCenterOffset.y;
          var zoomCenter = { x: zoomX/newScale, y: zoomY/newScale };

          zoomAround(e.scale, zoomCenter.x, zoomCenter.y, true);
        });

        hammer.on('pinchend', function (e) {
          updateLastScale();
          updateLastPos();
          pinchCenter = null;
        });

        hammer.on('doubletap', function (e) {
          var c = rawCenter(e);
          zoomAround(2, c.x, c.y);
        });

      };





















document.addEventListener('gestureend', function(e) {
    if (e.scale < 1.0) {
        // User moved fingers closer together
        console.log('Fingers closer')
        const fov = camera.fov + e.deltaY / 0.05;

        camera.fov = THREE.MathUtils.clamp(fov, 30, 100);

        camera.updateProjectionMatrix();
    } else if (e.scale > 1.0) {
        // User moved fingers further apart
        console.log('Fingers further')
        const fov = camera.fov + e.deltaY * 0.05;

        camera.fov = THREE.MathUtils.clamp(fov, 30, 100);

        camera.updateProjectionMatrix();
    }
}, false);

function animate() {

    requestAnimationFrame(animate);
    update();

}

function update() {
    /* Automaic move when user is not interacting
    if (isUserInteracting === false) {

        lon += 0.01;

    } */

    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const x = 500 * Math.sin(phi) * Math.cos(theta);
    const y = 500 * Math.cos(phi);
    const z = 500 * Math.sin(phi) * Math.sin(theta);

    camera.lookAt(x, y, z);

    renderer.render(scene, camera);

}
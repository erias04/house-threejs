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

    const loadManager = new THREE.LoadingManager();
    const loader = new THREE.TextureLoader(loadManager);

    // Define variables from html
    const loadingElem = document.querySelector('#loading');
    const progressBarElem = loadingElem.querySelector('.progressbar');

    // Add mesh to scene after loading
    loadManager.onLoad = () => {
        console.log('Finished loading mesh')
        loadingElem.style.display = 'none';

        // Create the mesh from geometry and material
        const mesh = new THREE.Mesh(geometry, material);

        // Add mesh to scene
        scene.add(mesh);
    }

    // While loading the scene
    loadManager.onProgress = (urlOfLastLoaded, itemsLoaded, itemsTotal) => {
        console.log('Loading mesh...')
        const progress = itemsLoaded / itemsTotal;
        progressBarElem.style.transform = `scaleX(${progress})`;
    }


    

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
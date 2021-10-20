import * as THREE from '/src/threejs/three.module.min.js';


let isUserInteracting = false,
    onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    lon = 0, onPointerDownLon = 0,
    lat = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;



// Camera configuration
const camera360 = new THREE.PerspectiveCamera(
    100, 
    window.innerWidth / window.innerHeight, 
    1, 
    1100
);



// Window resize Handling
function onWindowResize() {

    camera360.aspect = window.innerWidth / window.innerHeight;
    camera360.updateProjectionMatrix();


}
window.addEventListener('resize', onWindowResize);

//Scene
const scene360 = new THREE.Scene();
scene360.background = new THREE.Color(0xbfd1e5);

// MapControls
// const controls = new OrbitControls(camera, renderer.domElement);


function createSphere() {
const geometry = new THREE.SphereGeometry(500, 60, 40);
// invert the geometry on the x-axis so that all of the faces point inward
geometry.scale(- 1, 1, 1);

const texture = new THREE.TextureLoader().load('/src/assets/output-min-1.JPG');
const material = new THREE.MeshBasicMaterial({ map: texture });

const mesh = new THREE.Mesh(geometry, material);

scene360.add(mesh);
}


document.body.style.touchAction = 'none';
document.addEventListener('pointerdown', onPointerDown);

document.addEventListener('wheel', onDocumentMouseWheel);

//

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

    const fov = camera360.fov + event.deltaY * 0.05;

    camera360.fov = THREE.MathUtils.clamp(fov, 30, 100);

    camera360.updateProjectionMatrix();

}


function update() {

    // if (isUserInteracting === false) {

    //     lon += 0.01;

    // }

    lat = Math.max(- 85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);

    const x = 500 * Math.sin(phi) * Math.cos(theta);
    const y = 500 * Math.cos(phi);
    const z = 500 * Math.sin(phi) * Math.sin(theta);

    camera360.lookAt(x, y, z);

    // renderer.render(scene360, camera360);

}

createSphere();


export { scene360, camera360, update };
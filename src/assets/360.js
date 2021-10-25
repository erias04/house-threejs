import * as THREE from '/src/threejs/three.module.min.js';
import { DATA } from './DATA.js'


document.getElementById('close').style.display = 'auto';

let isUserInteracting = false,
    onPointerDownMouseX = 0, onPointerDownMouseY = 0,
    lon = 0, onPointerDownLon = 0,
    lat = 0, onPointerDownLat = 0,
    phi = 0, theta = 0;


function updateParameters() {
    lon = DATA.streetView[sessionStorage.getItem('streetViewRedirect')].model2image[0].firstEntryPoint;
}

// Camera configuration
const camera360 = new THREE.PerspectiveCamera(
    100, 
    window.innerWidth / window.innerHeight, 
    1, 
    1100
);
camera360.position.set(10, 10, 10);


// Window resize Handling
function onWindowResize() {

    camera360.aspect = window.innerWidth / window.innerHeight;
    camera360.updateProjectionMatrix();


}
window.addEventListener('resize', onWindowResize);

//Scene
const scene360 = new THREE.Scene({alpha: true});
scene360.background = new THREE.Color(0xbfd1e5);

// MapControls
// const controls = new OrbitControls(camera, renderer.domElement);


function createSphere() {
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry.scale(- 1, 1, 1);

    let texture = null;

    if (Number.isInteger(sessionStorage.getItem('image2image'))) {
        texture = new THREE.TextureLoader().load(DATA.streetView[sessionStorage.getItem('streetViewRedirect')].image2image[0].image);
    } else {
        texture = new THREE.TextureLoader().load(DATA.streetView[sessionStorage.getItem('streetViewRedirect')].model2image[0].image); 
    }
    
    const material = new THREE.MeshBasicMaterial({ map: texture });

    const mesh = new THREE.Mesh(geometry, material);

    scene360.add(mesh);
    console.log('Sphere successfully created')
}


function createArrow() {
    // var planeDocument = document.getElementById('plane');

    var map = new THREE.TextureLoader().load( '/src/assets/x-angle.png' );


    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {map: map, opacity: 0.5} );
    const plane = new THREE.Mesh( geometry, material );
    scene360.add( plane );
    // scene360.add( new THREE.AxisHelper( 100 ) );

    

    plane.position.set(30, 0, 8);
    plane.scale.set(3, 3, 3);
    plane.background = (0x000000, .1);
    
    plane.rotateX(Math.PI / -2);
    
    plane.userData.redirect = true;
    plane.userData.name = 1;


    // domEvents.addEventListener(plane, 'mouseover', function(event) {
    //     new_material.color = mesh.material.color;
    //     mesh.material = new_material;
    //     return renderer.render(scene, camera);
    //   });
    //   return domEvents.addEventListener(plane, 'mouseout', function(event) {
    //     mesh.material = materials[mesh.uuid];
    //     return renderer.render(scene, camera);
    //   });

}


const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
var redirect = new THREE.Object3D();

var arrowRedirect = function (event) {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(clickMouse, camera360);

    // calculate objects intersecting the picking ray
    const found = raycaster.intersectObjects(scene360.children);

    if (found.length > 0 && found[0].object.userData.redirect) {
        redirect = found[0].object
        console.log(`found clickable ${redirect.userData.name}`);

        let progress = {};
        progress.fov = camera360.fov;


        gsap.to(progress, {
            duration: .5,
            fov: 45,
            onUpdate: function () {
                //   camera360.lookAt(0,0,0);
                camera360.updateProjectionMatrix();
                camera360.fov = progress.fov;

                // renderer.render(scene, camera);
            },
            onComplete: function () {
                sessionStorage.setItem('image2image', DATA.streetView[sessionStorage.getItem('streetViewRedirect')].image2image[0].image)
              }
        });
    }

};

// window.addEventListener('mousemove', arrowRedirect, false);

var i = 1;
function streetViewRedirect() {
    while (i < 2) {
        console.log('streetViewRedirect established');
        window.addEventListener('click', arrowRedirect, false);
        i++;
      }
    
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

    // Sets the eventlistener for image to image redirect
    streetViewRedirect();

    // renderer.render(scene360, camera360);

}

createSphere();
createArrow();



export { scene360, camera360, update, createSphere, updateParameters };
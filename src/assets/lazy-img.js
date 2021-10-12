import { OrbitControls } from '/src/threejs//OrbitControls.min.js'

// Camera configuration
const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    1500,
);
// Camera poosition
camera.position.set(-35, 70, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Window Resize Handling
export function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

// MapControls
const controls = new OrbitControls(camera, renderer.domElement);

export function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}


// Create floor
function createFloor() {
    
    // image manipulator
    var image = document.createElement( 'img' );
    image.src = '/src/assets/output.jpg';
    image.addEventListener( 'load', function ( event ) {

    var headTextures = new Array();

    // texture 1

    var canvas = document.createElement( 'canvas' );    
    canvas.width = 8;
    canvas.height = 8;

    var context = canvas.getContext( '2d' );
    context.drawImage( image, 0, 0, 8, 8, 0, 0, 8, 8);

    var texture = new THREE.Texture( canvas );
    texture.needsUpdate = true; 

    headTextures[0] = new THREE.MeshBasicMaterial({map: texture});

    // texture 2


    let pos = { x: 0, y: -1, z: 3 };
    let scale = { x: 100, y: 2, z: 100 };

    const blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry());

    const plane = new THREE.Mesh( blockPlane,  );

    plane.position.set(pos.x, pos.y, pos.z);
    plane.scale.set(scale.x, scale.y, scale.z);
    scene.add(plane);

}, false );


}

createFloor()

animate()
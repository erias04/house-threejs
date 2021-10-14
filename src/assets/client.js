import { GLTFLoader } from '../threejs/GLTFLoader.min.js';
import { OrbitControls } from '../threejs/OrbitControls.min.js'

var DATA = {
  "streetViewDots": [
    {
        "positionx": -15,
        "positiony": 29.3,
        "positionz": 57,
        "camerapositionx": -35,
        "camerapositiony": 70,
        "camerapositionz": 120
    },
    {
        "positionx": -15,
        "positiony": 29.3,
        "positionz": 57,
        "camerapositionx": -35,
        "camerapositiony": 70,
        "camerapositionz": 120
    }
  ]
}


// Camera configuration
const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    1500,
);
// Camera poosition
camera.position.set(-35, 100, 200);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio / 2);
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

// ambient light
let hemiLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(hemiLight);

// directional light
let dirLight1 = new THREE.DirectionalLight(0xffffff, .8);
dirLight1.position.set(0, 50, 0);
scene.add(dirLight1);
// dirLight.castShadow = false;
// dirLight.shadow.mapSize.width = 2048;
// dirLight.shadow.mapSize.height = 2048;
// dirLight.shadow.camera.left = -70;
// dirLight.shadow.camera.right = 70;
// dirLight.shadow.camera.top = 70;
// dirLight.shadow.camera.bottom = -70;

let dirLight2 = new THREE.DirectionalLight(0xffffff, .8);
dirLight2.position.set(0, 50, 100);
scene.add(dirLight2);


// Add house
function createHouse() {
    const loader = new GLTFLoader();

    loader.load('/src/assets/3d-house/house.gltf', function(house){

        const model = house.scene;
    model.position.set(0, 0, 0);

    model.scale.set(1, 1, 1);

    //model.castShadow = true
    //model.receiveShadow = true

    scene.add(house.scene);
    
    model.userData.draggable = true;
    model.userData.name = 'house';
    },
	// called while loading is progressing
	function ( xhr ) {

    const status = xhr.loaded / xhr.total * 100;

		console.log( status + '% loaded' );

    if (status === 100) {
      console.log('Caching images')
      function preloadImages(array) {
        if (!preloadImages.list) {
            preloadImages.list = [];
        }
        var list = preloadImages.list;
        for (var i = 0; i < array.length; i++) {
            var img = new Image();
            img.onload = function() {
                var index = list.indexOf(this);
                if (index !== -1) {
                    // remove image from the array once it's loaded
                    // for memory consumption reasons
                    list.splice(index, 1);
                }
            }
            list.push(img);
            img.src = array[i];
        }
    }
    
    preloadImages(["/src/assets/output.JPG"]);
    }

	},
    function ( onLoad ) {

		console.log('Object is loading...' + onLoad);

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened: ' + error );

	});
}

function createLabel() {

    var map = new THREE.TextureLoader().load( '/src/assets/blue-dot.png' );

    const geometry = new THREE.PlaneGeometry( 1, 1 );
    const material = new THREE.MeshBasicMaterial( {map: map} );
    const plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
    scene.add( new THREE.AxisHelper( 100 ) );

    plane.position.set(DATA.streetViewDots[1].positionx, DATA.streetViewDots[1].positiony, DATA.streetViewDots[1].positionz)
    plane.scale.set(3, 3, 3);
    
    plane.rotateX(Math.PI / -2);
    
    plane.userData.clickable = true;
    plane.userData.name = 1;

}

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();
var draggable = new THREE.Object3D();

window.addEventListener('click', event => {
  // calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( clickMouse, camera );

  // calculate objects intersecting the picking ray
	const found = raycaster.intersectObjects( scene.children );

  if(found.length > 0 && found[0].object.userData.clickable) {
    draggable = found[0].object

    // Moving camera to object
    console.log(DATA.streetViewDots[draggable.userData.name].camerapositionx);


    gsap.to( camera.position, {
      duration: 1,
      x: -35,
      y: 70,
      z: 120,
      onUpdate: function () {
        camera.lookAt(new THREE.Vector3(0, 0, 0))
        camera.updateProjectionMatrix();
      }
    } );
  

    

    console.log(`found draggable ${draggable.userData.name}`);
  }

})

		
  



createHouse()
createLabel()

animate()
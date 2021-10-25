import { GLTFLoader } from '../threejs/GLTFLoader.min.js';
import { OrbitControls } from '../threejs/OrbitControls.min.js'
import { DATA } from './DATA.js';
import { scene360, updateParameters } from './360.js'
import { camera360 } from './360.js'
import { update } from './360.js'
import { createSphere } from './360.js'

var streetViewRedirect = false;

const closeIcon = document.getElementById('close');
document.getElementById('close').style.display = 'none';

console.log(DATA.streetView[1].model2image[0].positionx)


// Camera configuration
const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    1500,
);
// Camera poosition
camera.position.set(-35, 100, 200);
//camera.lookAt(new THREE.Vector3(0, 0, 0));

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setClearColor( 0x000000, 0 );
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

// export function animate() {
//   if (streetViewRedirect) {
//     renderer.render(scene360, camera360);
//     requestAnimationFrame(animate);
//     update();
//   }
//   else if (!streetViewRedirect) {
//     renderer.render(scene, camera);
//     requestAnimationFrame(animate);
//   }
    
// }

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
    scene.add( new THREE.AxisHelper( 100 ) );
    
    model.userData.draggable = false;
    model.userData.name = 'house';
    },
	// called while loading is progressing
	function ( xhr ) {

    const status = xhr.loaded / xhr.total * 100;

		console.log( status + ' % loaded' );


    if (status != null) {
      console.log('Caching images...');
      function preloadImages(array) {

        setTimeout(function(){ 
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
        console.log("Images cached successfully");
      }, 3000);
      
        
    }
    
    preloadImages(["/src/assets/images/output-min-1.JPG"]);
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

    for (var i = 0; i < 2; i ++) {
      var plane = new THREE.Mesh( geometry, material );
      plane.position.set(DATA.streetView[i].model2image[0].positionx, DATA.streetView[i].model2image[0].positiony, DATA.streetView[i].model2image[0].positionz);
      plane.scale.set(3, 3, 3);
      plane.rotateX(Math.PI / -2);

      scene.add(plane);
      plane.userData.clickable = true;
      plane.userData.name = i;
    }
}

const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();
var clickable = new THREE.Object3D();

var streetView = function (event) {
  // calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components

	clickMouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	clickMouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

  // update the picking ray with the camera and mouse position
	raycaster.setFromCamera( clickMouse, camera );

  // calculate objects intersecting the picking ray
	const found = raycaster.intersectObjects( scene.children );

  if(found.length > 0 && found[0].object.userData.clickable) {
    clickable = found[0].object

    // Moving camera to object
    console.log(DATA.streetView[clickable.userData.name].model2image[0].camerapositionx);


    gsap.to( camera.position, {
      duration: 2,
      x: DATA.streetView[clickable.userData.name].model2image[0].camerapositionx,
      y: DATA.streetView[clickable.userData.name].model2image[0].camerapositiony,
      z: DATA.streetView[clickable.userData.name].model2image[0].camerapositionz,
      onUpdate: function () {
        camera.lookAt(new THREE.Vector3(-20, 30, 0))
        camera.updateProjectionMatrix();
      },
      onComplete: function () {
        DATA.streetViewRedirect = true;
        document.getElementById('close').style.display = 'block';
        createSphere();
        updateParameters();
      }
    } );
    
    console.log(`found draggable ${clickable.userData.name}`);

    sessionStorage.setItem('streetViewRedirect', `${clickable.userData.name}`);
  }

};

window.addEventListener('touchstart', streetView, false);
window.addEventListener('click', streetView, false);



var ModelView = function(event) {
  console.log('Close Button pressed')
  DATA.streetViewRedirect = false;
  document.getElementById('close').style.display = 'none';
  camera.position.set(-12, 40, 90);

  gsap.to( camera.position, {
    duration: 2,
    x: -35,
    y: 100,
    z: 200,
    onUpdate: function () {
      camera.lookAt(new THREE.Vector3(-20, 30, 0))
      camera.updateProjectionMatrix();
    },
    onComplete: function () {
      sessionStorage.removeItem('image2image');
      console.log('3d-Model successfully restored');
    }
  } );
}

closeIcon.addEventListener('click', ModelView, false);





// .addEventListener('change', function() {
//   console.log('sessionStorage changed ' + sessionStorage.getItem(streetViewRedirect));
// });

export function animate() {
  if (DATA.streetViewRedirect) {
    renderer.render(scene360, camera360);
    requestAnimationFrame(animate);
    update();
  }
  else if (!DATA.streetViewRedirect) {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
    
}


createHouse();
createLabel();
animate();



/* DEBUGGING */

// Get current camera position (working but the camera does not changes, just the user)
// var vector = new THREE.Vector3();
// camera.getWorldDirection( vector );
// console.log(vector);

// var vectorOrbitControls = controls.getAzimuthalAngle()

// var i = 1;

// function currentCameraPosition() {
//   setTimeout(function() {
//     //console.log('hello');
//     i++;
//     if (i < 10) {
//       currentCameraPosition();
//       console.log('Current Camera position: ')
//       console.log(vectorOrbitControls)
//     }
// }, 3000)
// }

// currentCameraPosition();
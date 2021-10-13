import * as THREE from "/src/assets/threejs/three.module.min.js"

/*  
	Ever experienced the bad feeling of sending a customer an app where you have to wait several seconds 
    for the assets to load, one by one, in front of the user? One texture, a second one, then a first 
    mesh, then another... Bad experience. Coded a progress bar in few hours to handle it with a basic 
    style? The next app will have other settings, format, loaders etc., and this small code will have 
    to be tweaked again and again. Finally customers can ask to change colors, lights etc, and the code
    is so full of nested callbacks related to assets loading that it is not very comfortable to try 
    multiple sets of other values. All that leads to LoadScreen.js.
	3 steps :
*/

var renderer, scene, camera, controls;


/*  
	1. Assets declaration
	The declarative style avoids the usual callback hell when multiple assets have to be loaded.
	It separates the app logic from the assets loading.
	This style allows easy assigning of textures to materials, of materials to objects and of 
    geometries to objects.
	It is also easier to modify mesh, geometry and material parameters since they all are declared 
    at the same place.
*/

var assets = {
	objects:{ //Easy assigning.
		mesh:{
			type:'mesh',
			material:'main',
			geometry:'model',
			color:0xffffff,
			envMap:'envMap',
			map:'diffuse',
			metalnessMap:'metal',
			roughnessMap:'rough',
			normalMap:'normal',
			aoMap:'ao',
			aoMapIntensity:2,
			roughness:1,
			metalness:1,
			castShadow:true,
			receiveShadow:true
		}
	},
	materials:{
		main:new THREE.MeshStandardMaterial()
	},
	geometries:{
		model:{
			path:'https://rawgit.com/Astrak/astrak.github.io/master/resources/geos/geometry.json',
			fileSize:44.5,
			toBufferGeometry:true,
			onComplete:function(g){g.addAttribute( 'uv2', g.attributes.uv );}
		}
	},
	textures:{
		envMap:{
			path:(function(a,b){
				return [
					a+'1'+b,a+'3'+b,
					a+'5'+b,a+'6'+b,
					a+'2'+b,a+'4'+b
				];
			})('https://rawgit.com/Astrak/astrak.github.io/master/resources/hdr/','.hdr'),
			fileSize:4898,
			toPMREM:true
		},
		ao:{
			crossOrigin:'',
			path:'https://rawgit.com/Astrak/astrak.github.io/master/resources/tex/DefaultMaterial_Mixed_AO.png',
			fileSize:1470
		},
		diffuse:{
			crossOrigin:'',
			path:'https://rawgit.com/Astrak/astrak.github.io/master/resources/tex/DefaultMaterial_Base_Color.png',
			fileSize:2360
		},
		rough:{
			crossOrigin:'',
			path:'https://rawgit.com/Astrak/astrak.github.io/master/resources/tex/DefaultMaterial_Roughness.png',
			fileSize:1020,
			minFilter:THREE.LinearFilter
		},
		metal:{
			crossOrigin:'',
			path:'https://rawgit.com/Astrak/astrak.github.io/master/resources/tex/DefaultMaterial_Metallic.png',
			fileSize:16,
			minFilter:THREE.LinearFilter
		},
		normal:{
			crossOrigin:'',
			path:'https://rawgit.com/Astrak/astrak.github.io/master/resources/tex/DefaultMaterial_Normal.png',
			fileSize:718
		}
	}
};

/*  
	2. A THREE.WebGLRenderer instance has to be created and appended first : internally the library 
    uses renderer.domElement for the overlay positionning, then also uses the renderer to compile materials.
*/

setRenderer();

/*  
	3. Then, magic ! Just one line to setup everything. Assets declaration is separated from the 
    logic, the regular loading code is handled by the library, and load screens can be easily 
    stylized. Various style types are displayed in the readme at github.com/Astrak/LoadScreen.js. 
    More importantly, after loading, it displays and follows the following steps : processing (where 
    geometry are processed, where PMREM can be created) > Compiling (where renderer.compile is called 
    for every objects) > Creating scene (where the onComplete callback is called). So when low devices 
    can stall for few seconds, users know what is happening.
*/

var ls = new LoadScreen(renderer,
    {type:'stepped-circular-fancy-offset',
    progressColor:'#f80',infoStyle:{padding:'0'}}).onComplete(setScene).start(assets);

function setRenderer(){
    renderer=new THREE.WebGLRenderer();
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(innerWidth,innerHeight);
    renderer.gammaInput=renderer.gammaOutput=true;
    renderer.toneMapping=THREE.ReinhardToneMapping;
    renderer.toneMappingExposure=1.5;
    document.body.appendChild(renderer.domElement);
}

function setScene(){
	scene=new THREE.Scene();
	mesh=assets.objects.mesh;
	scene.add(mesh);
	setLighting();
	setView();
	ls.remove(animate);
}

function setLighting(){
	var light=new THREE.DirectionalLight(0xffffff,.5,20);
	light.position.set(5,0,0);
	light.castShadow=true;
	light.shadow.mapSize.set(2048,2048);
	light.shadow.camera.top=light.shadow.camera.right=2;
	light.shadow.camera.bottom=light.shadow.camera.left=-2;
	renderer.shadowMap.enabled=true;
	renderer.shadowMap.autoUpdate=false;
	renderer.shadowMap.needsUpdate=true;
	scene.add(light);
}

function setView(){
	camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.2,200);
	camera.position.set(3,1,1);
	camera.update=true;
	controls=new THREE.OrbitControls(camera,renderer.domElement);
	controls.addEventListener('change',function(){camera.update=true;});
	controls.enableDamping=true;
	controls.dampingFactor=.1;
	controls.rotateSpeed=.07;
	window.addEventListener('resize',resize,false);
}

function resize(){
	camera.aspect=innerWidth/innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(innerWidth,innerHeight);
	camera.update=true;
}
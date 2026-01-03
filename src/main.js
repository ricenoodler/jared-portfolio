import './style.css'

import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/Addons.js'; // makes it more interactive and orbit
/*
Website needs:
1. Scene
2. Camera // useful to look inside the scenes
  most common is perspective camera, mimics human vision

3. Renderer
*/
const scene = new THREE.Scene(); // holds all the objects, cameras, and lights


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) // needs (fields of view, aspect ratio based on user's browser window size,

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
}) // renderer makes the magic happen

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight); // makes it full screen canvas

camera.position.setZ(30); // moves the camera in z axis

renderer.render(scene, camera); // to render it

// creating an object
/* STEPS:
1. Geometry
  the x y z points that makeup a shape

2. Material
  the wrapping paper of object, texturing...?

3. Mesh
  geometry + material
*/
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({color: 0xFF6347, wireframe: false}); // wireframe set to true to have better look at the geometry
const torus = new THREE.Mesh(geometry, material);

scene.add(torus); // adds the shape to the scene...?

// add light
const pointLight = new THREE.PointLight(0xffffff, 500); // like a lightbulb, emits light in all directions, 0xffffff is hexadecimal decimal
pointLight.position.set(10, 5, 10); // position light away from center

// adds ambient lighting. color, intensity
const ambientLight = new THREE.AmbientLight(0xffffff, 1);

// note to self, everytime you create an object, always do scene.add after initalizing it
scene.add(pointLight, ambientLight); // adds light to scene

// to see where light is at, LIKE DEBUGGING!
const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
// scene.add(lightHelper, gridHelper); // COMMENT / UNCOMMENT THIS

const controls = new OrbitControls(camera, renderer.domElement); // adjusts camera according to domElement or mouse control...?

// populate outterspace star stuff
function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({color: 0xffffff})
  const star = new THREE.Mesh(geometry, material);

  // randomly generate stars
  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100)); // rand float spread is a helper function that randomly generates number between -100, 100

  // add position of star
  star.position.set(x, y, z);

  scene.add(star)
}
// populate with 200 randomy positioned stars
Array(200).fill().forEach(addStar)

// create background
import spaceImage from './space.jpg';
const spaceTexture = new THREE.TextureLoader().load(spaceImage); // can use callback functino to add loading bar if scene requiers a lot of static elements
scene.background = spaceTexture;


// Avatar
import jaredImage from './APT JARED.png';
const jaredTexture = new THREE.TextureLoader().load(jaredImage);
const jared = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial( {map: jaredTexture})
);
scene.add(jared);


// moon
import moonImage from './moon.jpg';
const moonTexture = new THREE.TextureLoader().load(moonImage);

// add more depth
import moonDepth from './moonDepth.jpg';
const normalTexture = new THREE.TextureLoader().load(moonDepth)
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    normalMap: normalTexture
  })
);
scene.add(moon);

// move moon
moon.position.z = 30;
moon.position.setX(-10);

jared.position.z = -5;
jared.position.x = 2;

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  moon.rotation.x += 0.025;
  moon.rotation.y += 0.050;
  moon.rotation.z += 0.025;

  jared.rotation.y += 0.01;
  jared.rotation.z += 0.01;

  camera.position.z = t * -0.0055;
  camera.position.x = t * -0.00011;
  camera.rotation.y = t * -0.00011;
}
document.body.onscroll = moveCamera
moveCamera();




// basicallt do infinite loop of renderer.render(scene, camera), a game loop
function animate() {
  requestAnimationFrame(animate); // tells browser to perform an animation

  torus.rotation.x += 0.01; // rotates on x axis
  torus.rotation.y += 0.005; // rotates on y axis
  torus.rotation.z += 0.01; // rotates on z axis
  
  controls.update(); // make sure camera changes are reflected on browser

  renderer.render(scene, camera);
}

animate()
// Get the elements that will be transformed during scrolling
const textBehind = document.getElementById('text-behind');
const textFront = document.getElementById('text-front');
const textBehindBlur = document.getElementById('text-behind-blur');
const canvasRect = document.getElementById('canvas');

// Define the increment of scaling
// Text scaling
const parallaxScaling1 = 0.0005;
// Canvas scaling
const parallaxScaling2 = 0.00025;
// Three.js Camera Rotation Speed
const parallaxScaling3 = 0.0000001;

// Initialize scroll and ease values
let currentScroll = 0;
let targetScroll = 0;
let ease = 0.001;

// Define a global variable to connect scroll-based animations to 3D animations.
let theta1 = 0;

// This function updates the scale and position of the elements on scroll
function updateScale() {
  
  // Get the top and bottom position of the canvasRect element relative to the viewport.
  let rect = canvasRect.getBoundingClientRect();
  
  // Calculate the start and end scroll positions relative to the top of the document.
  // window.pageYOffset provides the amount of pixels that the document is currently scrolled vertically.
  // Adding rect.top/rect.bottom converts the relative viewport position to an absolute document position.
  let startScrollPosition = window.pageYOffset + rect.top; 
  let endScrollPosition = window.pageYOffset + rect.bottom;

  // The condition checks the following:
  // 1. If the bottom edge of the viewport is above the starting position of our target element or
  // 2. If the top edge of the viewport is below the ending position of our target element.
  // In other words, it checks if the target element is outside the current viewport.
  if (targetScroll + window.innerHeight < startScrollPosition || targetScroll > endScrollPosition) {
    // If either of the conditions is true, we are not viewing the element and thus we should exit (return) from the function early, without updating the parallax effects.
     return;
    }
  
  // The currentScroll value is being adjusted to gradually approach the targetScroll value.
  // This creates a smoother, easing effect rather than directly jumping to the target value.
  currentScroll += (targetScroll - currentScroll) * ease;
  
  let scaleValue1 = 1 + (currentScroll * parallaxScaling1);
  let scaleValue2 = 1 + (currentScroll * parallaxScaling2);
    
  // Use the scaleValue to adjust the transform property for scaling
  textBehind.style.transform = `scale(${scaleValue1})`;
  textFront.style.transform = `scale(${scaleValue1})`;
  textBehindBlur.style.transform = `scale(${scaleValue1})`;
  canvasRect.style.transform = `scale(${scaleValue2})`;
  
  // Modulate theta1 based on the current scrolling offset.
  // This provides a connection between the 2D scrolling experience and the 3D Three.js animations.
  theta1 += currentScroll * parallaxScaling3;
    
  // setTimeout is a way to delay the execution of the function.
  // By calling updateScale with a delay of approximately 1/60th of a second, we're mimicking the behavior of requestAnimationFrame, aiming to update the parallax effect about 60 times per second.
  // This makes the animation smoother by spreading the updates across small time intervals, making transitions less abrupt and more visually appealing.
  setTimeout(updateScale, 1000 / 60); // approximately 60 times per second
}

window.addEventListener('scroll', () => {
    targetScroll = window.pageYOffset;
    updateScale();
});

updateScale();

// Assuming the OrbitControls are instantiated as 'controls'
// and your elements have been correctly selected with getElementById

// Function to toggle the visibility and controls




import * as THREE from 'https://cdn.skypack.dev/three@0.124.0';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { getFresnelMat } from './getFresnelMat.js';
import getStarfield from './getStarfield.js';

// SCENE
const scene = new THREE.Scene();
// CAMERA
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5.5;
// RENDERER
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
renderer.setClearColor(0x000000, 0); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement); // Consider changing 'document.getElementById('canvas')' if you specifically need that element
// GEOMETRY
const geometry = new THREE.IcosahedronGeometry(2,64, 64);
//LOADER
const loader = new THREE.TextureLoader();
// GROUP
const earthGroup = new THREE.Group();
earthGroup.rotation.z = 10.4 * Math.PI / 180;
// MATERIAL
const earthMaterial = new THREE.MeshPhongMaterial({
    map: loader.load('/assets/8081_earthmap4k.jpg'),
    bumpMap: loader.load('/assets/8081_earthbump4k.jpg'),
    bumpScale: 0.03,
    flatShading: true,
    specularMap: loader.load('/assets/8081_earthspec4k.jpg'),
})
const lightMaterial = new THREE.MeshBasicMaterial({
    map: loader.load('/assets/8081_earthlights4k.jpg'),
    blending: THREE.AdditiveBlending,
});
const cloudsMaterial = new THREE.MeshStandardMaterial({
    map: loader.load('/assets/earth_clouds.jpg'),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    alphaMap: loader.load('/assets/earthcloudmaptrans.jpg'),
});
const earth = new THREE.Mesh(geometry, earthMaterial);
const lightsMesh = new THREE.Mesh(geometry, lightMaterial);
const cloudsMesh = new THREE.Mesh(geometry, cloudsMaterial);
cloudsMesh.scale.setScalar(1.003);

const fresnelMat = getFresnelMat({rimHex: 0x0088ff, facingHex: 0x000000});
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);

// LIGHT
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
directionalLight.position.set(0, 1, 1);
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.1);

// ADD TO GROUP
earthGroup.add(earth);
earthGroup.add(lightsMesh);
earthGroup.add(cloudsMesh);
earthGroup.add(glowMesh);
// ADD TO SCENE
scene.add(earthGroup);
scene.add(directionalLight);
scene.add(ambientLight);
// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.enableZoom = false;
controls.enablePan = false;
controls.update(); // Only required if controls.enableDamping or controls.autoRotate are set to true
// STARFIELD
const starfield = getStarfield({numStars: 1000});
scene.add(starfield);
function animate() {
    requestAnimationFrame(animate);

    // Update cube rotation
    earth.rotation.y += 0.0002;
    lightsMesh.rotation.y += 0.0002;
    cloudsMesh.rotation.y += 0.0004;
    starfield.rotation.y += 0.0006;
    

    // Optional: Update controls
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

    renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    // Update camera aspect ratio and projection matrix
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
}


animate();

controls.enabled = false;

function toggleElementsAndControls() {
    // Toggle visibility
    const isHidden = textBehind.style.display === 'none';
    
    // Set display based on current state
    textBehind.style.display = isHidden ? 'block' : 'none';
    textFront.style.display = isHidden ? 'block' : 'none';
    textBehindBlur.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        // If the text was hidden, we are showing it now and disabling controls
        controls.enabled = false;
        controls.enableZoom = false;
    } else {
        // If the text was shown, we are hiding it now and enabling controls
        controls.enabled = true;
        controls.enableZoom = true;
    }
}

// Add event listener to the button
document.getElementById('toggleButton').addEventListener('click', toggleElementsAndControls);


// scene.background = new THREE.Color('transparent');
// scene.background = new THREE.Color(0x11151c);
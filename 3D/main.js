import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.165.0/examples/jsm/loaders/GLTFLoader.js'; // Importeer de GLTFLoader
import { OrbitControls } from 'https://unpkg.com/three@0.165.0/examples/jsm/controls/OrbitControls.js'; // Optioneel: Voor makkelijk camera bewegen

// 1. Scène aanmaken
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xabcdef); // Een achtergrondkleur voor betere zichtbaarheid

// 2. Camera aanmaken
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.5, 3); // Plaats de camera iets hoger en verder

// 3. Renderer aanmaken
const renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias voor gladdere randen
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Optioneel: OrbitControls voor makkelijk camera besturen
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Zorgt voor een 'vloeiender' gevoel
controls.dampingFactor = 0.25;

// Voeg licht toe! Modellen hebben licht nodig om zichtbaar te zijn
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Zacht algemeen licht
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Gericht licht (zonlicht)
directionalLight.position.set(5, 5, 5).normalize();
scene.add(directionalLight);

// Variabele om het geladen model in op te slaan
let loadedModel;

// Initialiseer de GLTFLoader
const loader = new GLTFLoader();

// Laad het GLTF-model
loader.load(
    // pad naar je model
    './bleu.glb', // Zorg dat dit bestand in dezelfde map staat als je main.js en index.html

    // on successful load
    function (gltf) {
        loadedModel = gltf.scene;
        loadedModel.scale.set(0.5, 0.5, 0.5); // Pas de schaal aan indien nodig
        scene.add(loadedModel);
        console.log('Model succesvol geladen!', loadedModel);
    },
    // on progress
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% geladen');
    },
    // on error
    function (error) {
        console.error('Fout bij het laden van het model:', error);
    }
);


// Animatie loop
function animate() {
    requestAnimationFrame(animate);

    // Als het model geladen is, kun je het roteren of animeren
    if (loadedModel) {
        // Voorbeeld: roteer het geladen model
        // loadedModel.rotation.y += 0.005;
    }

    controls.update(); // Update de OrbitControls
    renderer.render(scene, camera);
}

// Start de animatie
animate();

// Pas de renderer en camera aan als het venster van grootte verandert
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
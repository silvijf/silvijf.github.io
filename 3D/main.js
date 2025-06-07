import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';

// 1. Scène aanmaken
const scene = new THREE.Scene();

// 2. Camera aanmaken (PerspectiveCamera)
// fov (field of view): Hoeveel van de scène zichtbaar is (in graden)
// aspect: Breedte / Hoogte van het render-oppervlak
// near: Objecten dichterbij dan deze waarde worden niet gerenderd
// far: Objecten verder weg dan deze waarde worden niet gerenderd
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Plaats de camera 5 eenheden naar achteren

// 3. Renderer aanmaken
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight); // Stel de grootte van de renderer in
document.body.appendChild(renderer.domElement); // Voeg de renderer toe aan de HTML body

// 4. Geometrie aanmaken (kubus)
const geometry = new THREE.BoxGeometry(1, 1, 1); // Breedte, hoogte, diepte van de kubus

// 5. Materiaal aanmaken (groen basis materiaal)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Hexadecimale kleurcode

// 6. Mesh aanmaken (combinatie van geometrie en materiaal)
const cube = new THREE.Mesh(geometry, material);
scene.add(cube); // Voeg de kubus toe aan de scène

// 7. Animatie loop
function animate() {
    requestAnimationFrame(animate); // Zorgt ervoor dat de functie opnieuw wordt aangeroepen voor de volgende frame

    // Roteer de kubus
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera); // Render de scène met de camera
}

// Start de animatie
animate();

// Pas de renderer en camera aan als het venster van grootte verandert
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
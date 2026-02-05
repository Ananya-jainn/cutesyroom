import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

// --------------------
// Canvas
// --------------------
const canvas = document.querySelector("#experience-canvas");

// --------------------
// Scene
// --------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2f2f2);

// --------------------
// Sizes
// --------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// --------------------
// Camera (YOUR PERFECT ONE)
// --------------------
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);

camera.position.set(
  -0.49148035239817256,
  21.99322698222242,
  44.76401929700731
);

scene.add(camera);

// --------------------
// Renderer
// --------------------
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// --------------------
// Controls
// --------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

controls.target.set(
  -0.9231324494052895,
  21.68455288510119,
  37.11729455717173
);
controls.update();

// --------------------
// LIGHTING (GOOD ROOM VIBE)
// --------------------

// base ambient
const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
scene.add(ambientLight);

// main sun light
const sunLight = new THREE.DirectionalLight(0xffffff, 2.8);
sunLight.position.set(6, 10, 6);
sunLight.castShadow = true;

sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -15;
sunLight.shadow.camera.right = 15;
sunLight.shadow.camera.top = 15;
sunLight.shadow.camera.bottom = -15;

// shadow acne fix
sunLight.shadow.bias = -0.0003;
sunLight.shadow.normalBias = 0.03;

scene.add(sunLight);
scene.add(sunLight.target);

// warm room fill
const warmLight = new THREE.AmbientLight(0xffd6e8, 0.25);
scene.add(warmLight);

// --------------------
// Floor (shadow catcher)
// --------------------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.ShadowMaterial({ opacity: 0.35 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.01;
floor.receiveShadow = true;
scene.add(floor);

// --------------------
// Loaders
// --------------------
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

// --------------------
// Model
// --------------------
let roomModel = null;

gltfLoader.load(
  "/models/roomshi.glb",
  (gltf) => {
    roomModel = gltf.scene;

    roomModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(roomModel);
    console.log("✅ MODEL LOADED");
  },
  undefined,
  (error) => {
    console.error("❌ MODEL LOAD ERROR", error);
  }
);

// --------------------
// Resize
// --------------------
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --------------------
// Animate
// --------------------
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();



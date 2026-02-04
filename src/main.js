import "./style.scss";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";

// --------------------
// Canvas
// --------------------
const canvas = document.querySelector("#experience-canvas");

// --------------------
// Scene
// --------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf7b6c8);

// --------------------
// Sizes
// --------------------
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// --------------------
// Camera
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
44.76401929700731);
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

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

// --------------------
// Controls (RESTRICTED)
// --------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// FORCE FREE MOVEMENT
controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;

// VERY IMPORTANT — CLEAR ANY PREVIOUS LIMITS
controls.minAzimuthAngle = -Infinity;
controls.maxAzimuthAngle = Infinity;
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI;

// apply reset
controls.update();
controls.target.set(
-0.9231324494052895, 
21.68455288510119,
37.11729455717173
)

// --------------------
// LIGHTING
// --------------------

// Ambient base
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Sun light (main shadows)
const sunLight = new THREE.DirectionalLight(0xffffff, 3);
sunLight.position.set(6, 10, 6);
sunLight.castShadow = true;

sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 40;
sunLight.shadow.camera.left = -10;
sunLight.shadow.camera.right = 10;
sunLight.shadow.camera.top = 10;
sunLight.shadow.camera.bottom = -10;

// 🔥 STRIPE FIX
sunLight.shadow.bias = -0.0003;
sunLight.shadow.normalBias = 0.03;

scene.add(sunLight);
scene.add(sunLight.target);

// Window sunlight (RectAreaLight)
RectAreaLightUniformsLib.init();

const windowLight = new THREE.RectAreaLight(
  0xfff2e5,
  4,
  3,
  2
);
windowLight.position.set(2.5, 2, 1.2);
windowLight.rotation.y = Math.PI;
scene.add(windowLight);

// Soft environment tint
const envLight = new THREE.AmbientLight(0xffd6e8, 0.15);
scene.add(envLight);

// --------------------
// Floor (Shadow catcher)
// --------------------
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
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

        if (child.material) {
          child.material.needsUpdate = true;
        }
      }
    });

    scene.add(roomModel);
    console.log("✅ MODEL LOADED");
  },
  undefined,
  (error) => {
    console.error("❌ LOAD ERROR", error);
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
  //console.log(camera.position);
  //console.log("0000000000");
  //console.log(controls.target);
  // subtle life
  if (roomModel) {
    roomModel.rotation.y += 0.0004;
  }

  // gentle sun motion
  sunLight.position.x = Math.sin(Date.now() * 0.0002) * 6;
  sunLight.position.z = Math.cos(Date.now() * 0.0002) * 6;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();

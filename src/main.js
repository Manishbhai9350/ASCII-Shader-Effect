import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import { PlaneGeometry, WebGPURenderer } from "three/webgpu";
import { GetSceneBounds } from "./utils";
import { getMaterial } from "./ascii";
import Person from "/person.jpg?url";
import Natlie from "/natlie.png?url";
import { OrbitControls } from "three/examples/jsm/Addons.js";

const { PI } = Math;

const canvas = document.querySelector("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene();

const renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true });

// ?? Scene 2
const renderTarget = new THREE.WebGLRenderTarget(innerWidth,innerHeight);
const scene2 = new THREE.Scene();

const Boxes = new THREE.Group()
scene2.add(Boxes)

const dl = new THREE.DirectionalLight(0xffffff, 3);
dl.position.set(20,20,20);
scene2.add(dl, new THREE.AmbientLight(0xffffff, .5));

for(let i = 0; i < 100; i++) {
  const x = (2 * Math.random() - 1) * 10;
  const y = (2 * Math.random() - 1) * 10;
  const z = -Math.random() * 20;

  const Box = new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshPhysicalMaterial({color:0xffffff})
  )

  Box.position.set(x,y,z)

  Boxes.add(Box)


}



const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000,
);
camera.position.z = 5;

const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager);
const Texture = new THREE.TextureLoader(Manager);
const GLB = new GLTFLoader(Manager);


Draco.setDecoderPath("/draco/");
Draco.setDecoderConfig({ type: "wasm" });
GLB.setDRACOLoader(Draco);

const { width, height } = GetSceneBounds(renderer, camera);

const GetASCIITexture = () => {
  let ascii =
    "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
  const length = ascii.length;

  // document.querySelector('canvas').style.display = 'none'
  const canvas = document.createElement("canvas");
  // document.body.querySelector('main').appendChild(canvas)
  canvas.width = length * 64;
  canvas.height = 64;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";

  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < length; i++) {
    if (i > length * 0.7) {
      ctx.filter = "blur(2px)";
    }
    ctx.fillText(ascii[i], 32 + i * 64, 32);
    ctx.filter = "none";
  }

  return { ascii: new THREE.CanvasTexture(canvas), length };
};

let size = 0.15;

const row = Math.ceil(height / size) + 1;
const column = Math.ceil(row);
const instances = row * column;

const Plane = new PlaneGeometry(size, size, 1, 1);
const position = new Float32Array(instances * 3);
const ScreenUVs = new Float32Array(instances * 2);

const material = getMaterial({
  invr: 1 / row,
  invc: 1 / column,
  person: Texture.load(Natlie),
  ...GetASCIITexture(),
  boxes: renderTarget.texture,
});

const Mesh = new THREE.InstancedMesh(Plane, material, instances);

for (let r = 0; r < row; r++) {
  for (let c = 0; c < column; c++) {
    const index = r * column + c;

    const matrix = new THREE.Matrix4();
    position[index + 0] = (c - (column - 1) / 2) * size;
    position[index + 1] = (r - (row - 1) / 2) * size;
    position[index + 2] = 0;

    const u = c / column;
    const v = r / row;

    ScreenUVs[index * 2 + 0] = u;
    ScreenUVs[index * 2 + 1] = v;

    matrix.setPosition((c - column / 2) * size, (r - row / 2) * size, 0);

    Mesh.setMatrixAt(index, matrix);
  }
}

// Attach as instance attribute
Plane.setAttribute(
  "screenUV",
  new THREE.InstancedBufferAttribute(ScreenUVs, 2),
);

Mesh.instanceMatrix.needsUpdate = true;

scene.add(Mesh);

const controls = new OrbitControls(camera, canvas);

const clock = new THREE.Clock();
let Time = clock.getElapsedTime();

function Animate(t) {
  const NewTime = clock.getElapsedTime();
  const DT = NewTime - Time;
  Time = NewTime;
  controls.update();


  Boxes.children.forEach(Box => {
    Box.rotation.x +=  DT * .2
    Box.rotation.y +=  DT * .2
    Box.rotation.z +=  DT * .2
  })

  renderer.setRenderTarget(renderTarget);
  renderer.renderAsync(scene2, camera);
  renderer.setRenderTarget(null);
  renderer.renderAsync(scene, camera);
  requestAnimationFrame(Animate);
}

requestAnimationFrame(Animate);

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("resize", resize);

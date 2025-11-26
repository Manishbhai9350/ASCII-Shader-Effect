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

const { PI } = Math;

const canvas = document.querySelector("canvas");

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene();

const renderer = new WebGPURenderer({ canvas, antialias: true, alpha: true });

const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  1,
  1000
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
  let ascii = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
  const length = ascii.length;

  // document.querySelector('canvas').style.display = 'none'
  const canvas = document.createElement('canvas')
  // document.body.querySelector('main').appendChild(canvas)
  canvas.width = length * 64
  canvas.height =  64

  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#000000'
  ctx.fillRect(0,0,canvas.width,canvas.height)
  ctx.fillStyle = '#ffffff'

  ctx.font = '40px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for(let i = 0; i < length; i++) {
    ctx.fillText(ascii[i],32 + i * 64,32)
  }

  return {ascii:new THREE.CanvasTexture(canvas),length}
};

let size = 0.1;

const row = Math.ceil(height / size) + 1;
const column = Math.ceil(width / size) + 1;
const instances = row * column;

const Plane = new PlaneGeometry(size, size, 1, 1);
const position = new Float32Array(instances * 3);
const ScreenUVs = new Float32Array(instances * 2);

const material = getMaterial({
  invr: 1 / row,
  invc: 1 / column,
  person: Texture.load(Person),
  ...GetASCIITexture()
});

const Mesh = new THREE.InstancedMesh(Plane, material, instances);

for (let r = 0; r < row; r++) {
  for (let c = 0; c < column; c++) {
    const index = r * column + c;

    const matrix = new THREE.Matrix4();
    position[index + 0] = (c - column / 2) * size;
    position[index + 1] = (r - row / 2) * size;
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
  new THREE.InstancedBufferAttribute(ScreenUVs, 2)
);

Mesh.instanceMatrix.needsUpdate = true;

scene.add(Mesh);

function Animate() {
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

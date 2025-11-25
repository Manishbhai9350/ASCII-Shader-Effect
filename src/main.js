import './style.css'
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import fragmentShader from './shaders/fragment.glsl'
import vertexShader from './shaders/vertex.glsl'
import { PlaneGeometry, WebGPURenderer } from 'three/webgpu';
import { GetSceneBounds } from './utils';
import { getMaterial } from './ascii'


const {PI} = Math

const canvas = document.querySelector('canvas')

canvas.width = innerWidth;
canvas.height = innerHeight;

const scene = new THREE.Scene()

const renderer = new WebGPURenderer({canvas,antialias:true,alpha:true})

const camera = new THREE.PerspectiveCamera(75,innerWidth/innerHeight,1,1000)
camera.position.z = 5



const Manager = new THREE.LoadingManager();
const Draco = new DRACOLoader(Manager)
const GLB = new GLTFLoader(Manager)

Draco.setDecoderPath('/draco/')
Draco.setDecoderConfig({type: 'wasm'})
GLB.setDRACOLoader(Draco)

const {width,height} = GetSceneBounds(renderer,camera)

let size = .2;

const row = Math.ceil(height / (size)) + 1
const column = Math.ceil(width / (size )) + 1
const instances = row * column

console.log(row,column)


const Plane = new PlaneGeometry(size,size,1,1)
const position = new Float32Array(instances * 3)
const material = getMaterial()

const Mesh = new THREE.InstancedMesh(
  Plane,
  material,
  instances
)

for(let r = 0; r < row; r++) {
  for(let c = 0; c < column; c++) {
    const index = (r * column) + c;

    const matrix = new THREE.Matrix4()
    position[index + 0] = (c - column / 2) * size
    position[index + 1] = (r - row / 2) * size 
    position[index + 2] = 0 

    matrix.setPosition((c - column / 2) * size,(r - row / 2) * size,0)

    Mesh.setMatrixAt(index,matrix)
    

  }
}

Mesh.instanceMatrix.needsUpdate = true;

scene.add(Mesh)




function Animate(){
  renderer.renderAsync(scene,camera)
  requestAnimationFrame(Animate)
}

requestAnimationFrame(Animate)


function resize(){
  camera.aspect = innerWidth/innerHeight
  camera.updateProjectionMatrix()
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  renderer.setSize(innerWidth,innerHeight)
}

window.addEventListener('resize',resize)

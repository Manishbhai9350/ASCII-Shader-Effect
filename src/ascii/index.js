import { vec4 } from "three/tsl"
import { MeshBasicNodeMaterial } from "three/webgpu"



export const getMaterial = () => {
    const material = new MeshBasicNodeMaterial()

    material.colorNode = vec4(1,.6,0,.5)

    return material
}
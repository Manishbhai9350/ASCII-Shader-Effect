import {
  float, vec2, vec3, vec4,
  color, texture, uniform,
  positionLocal, normalLocal,
  uv, time,
  attribute,
  Fn,
  pow,
  floor,
  lengthSq,
  mix,
  step
} from 'three/tsl';

import { MeshBasicNodeMaterial } from "three/webgpu"

const ColorPallete = [
    '#FAF3E1',
    '#D7C097',
    '#4E56C0',
    '#FF6D1F',
    '#961E1E',
]



export const getMaterial = ({
    invr=1,
    invc=1,
    person,
    ascii,
    length
}) => {
    const material = new MeshBasicNodeMaterial()

    const color1 = uniform(color(ColorPallete[0]))
    const color2 = uniform(color(ColorPallete[2]))
    const color3 = uniform(color(ColorPallete[2]))
    const color4 = uniform(color(ColorPallete[3]))
    const color5 = uniform(color(ColorPallete[4]))

    
    material.colorNode = Fn(() => {
    const RawScreenUV = attribute('screenUV', 'vec2');
        const rows = attribute('rows', 'float');
        const columns = attribute('column', 'float');
        
        const invRows = float(1).div(rows);
        const invColumns = float(1).div(columns);
    
        const ScreenUV = RawScreenUV.add(uv().mul(vec2(invc,invr)))

        const Person = texture(person,RawScreenUV)

        const Brightness = pow(Person.r,.45)
        let finalColor = color1;
        finalColor = mix(finalColor,color2,step(.2,Brightness))
        finalColor = mix(finalColor,color3,step(.4,Brightness))
        finalColor = mix(finalColor,color4,step(.6,Brightness))
        finalColor = mix(finalColor,color5,step(.8,Brightness))

        const asciiUV = vec2(
            uv().x.
            div(float(length))
            .add(floor(pow(Person.r,1.5).mul(length)).div(length)),
            uv().y)
        const asciiTexture = texture(ascii,asciiUV)

        

        // return vec4(Brightness)
        return asciiTexture.mul(finalColor)
        // return vec4(vec3(finalColor),1)
    })()

    return material
}
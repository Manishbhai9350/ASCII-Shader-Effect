import {
  float,
  vec2,
  vec3,
  vec4,
  color,
  texture,
  uniform,
  positionLocal,
  normalLocal,
  uv,
  time,
  attribute,
  Fn,
  pow,
  floor,
  lengthSq,
  mix,
  step,
  cos,
  sin
} from "three/tsl";

import { MeshBasicNodeMaterial } from "three/webgpu";

const ColorPallete = ["#b00ff5", "#ff33ebff", "#ff2976", "#ff901f", "#ffd318"];

export const getMaterial = ({
  invr = 1,
  invc = 1,
  person,
  ascii,
  length,
  boxes,
}) => {
  const material = new MeshBasicNodeMaterial();

  const color1 = uniform(color(ColorPallete[0]));
  const color2 = uniform(color(ColorPallete[2]));
  const color3 = uniform(color(ColorPallete[2]));
  const color4 = uniform(color(ColorPallete[3]));
  const color5 = uniform(color(ColorPallete[4]));

  material.positionNode = Fn(() => {
    const nuv = uv().mul(2).add(1)
  
    
    return positionLocal
  })()

  material.colorNode = Fn(() => {
    const RawScreenUV = attribute("screenUV", "vec2");
    const rows = attribute("rows", "float");
    const columns = attribute("column", "float");

    const invRows = float(1).div(rows);
    const invColumns = float(1).div(columns);

    const ScreenUV = RawScreenUV.add(uv().mul(vec2(invc, invr)));

    const Person = texture(person, RawScreenUV);
    const Boxes = texture(boxes, RawScreenUV);

    const Brightness = pow(Boxes.r, 1.2);
    let finalColor = color1;
    finalColor = mix(finalColor, color2, step(0.2, Brightness));
    finalColor = mix(finalColor, color3, step(0.4, Brightness));
    finalColor = mix(finalColor, color4, step(0.6, Brightness));
    finalColor = mix(finalColor, color5, step(0.8, Brightness));

    const asciiUV = vec2(
      uv()
        .x.div(float(length))
        .add(floor(Brightness.mul(length)).div(length)),
      uv().y,
    );
    const asciiTexture = texture(ascii, asciiUV);

    // return texture(boxes, ScreenUV);
    // return asciiTexture;
    return asciiTexture.mul(finalColor);
    // return vec4(vec3(finalColor), 1);
  })();

  return material;
};

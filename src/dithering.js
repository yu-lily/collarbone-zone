import {
  ShaderMount,
  ditheringFragmentShader,
  getShaderColorFromString,
} from "@paper-design/shaders";

const el = document.getElementById("dithering");
if (el) {
  new ShaderMount(
    el,
    ditheringFragmentShader,
    {
      u_colorBack: getShaderColorFromString("#00000000"),
      u_colorFront: getShaderColorFromString("#FFC8E9"),
      u_shape: 4,  // wave
      u_type: 4,   // 8x8 Bayer
      u_pxSize: 4.3,
      u_scale: 1,
      u_fit: 0,
      u_rotation: 0,
      u_offsetX: 0,
      u_offsetY: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    undefined,
    0.46
  );
}

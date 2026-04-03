import {
  ShaderMount,
  imageDitheringFragmentShader,
  ditheringFragmentShader,
  getShaderColorFromString,
} from "@paper-design/shaders";

// Layer 1: Image dithering — sky image through 8x8 Bayer
const bgEl = document.getElementById("bg-dither");
if (bgEl) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "../img/drowning-in-moonlight/sky.png";

  function mountImageShader() {
    try {
    new ShaderMount(
      bgEl,
      imageDitheringFragmentShader,
      {
        u_image: img,
        u_imageAspectRatio: img.naturalWidth / img.naturalHeight,
        u_colorFront: getShaderColorFromString("#00000000"),
        u_colorBack: getShaderColorFromString("#00000000"),
        u_colorHighlight: getShaderColorFromString("#00000000"),
        u_originalColors: true,
        u_inverted: false,
        u_type: 4, // 8x8 Bayer
        u_pxSize: 2,
        u_colorSteps: 3,
        u_scale: 1,
        u_fit: 2, // cover
        u_rotation: 0,
        u_offsetX: 0,
        u_offsetY: 0,
        u_originX: 0.5,
        u_originY: 0.5,
        u_worldWidth: 0,
        u_worldHeight: 0,
      },
      undefined,
      0
    );
    document.body.classList.add("shader-loaded");
    } catch (e) {
      // WebGL not available — fallback image stays visible
    }
  }

  if (img.complete && img.naturalWidth > 0) {
    mountImageShader();
  } else {
    img.onload = mountImageShader;
  }
}

// Layer 2: Animated pink warp dithering overlay (20% opacity set in CSS)
const overlayEl = document.getElementById("bg-overlay-dither");
if (overlayEl) {
  new ShaderMount(
    overlayEl,
    ditheringFragmentShader,
    {
      u_colorBack: getShaderColorFromString("#00000000"),
      u_colorFront: getShaderColorFromString("#FFC8E9"),
      u_shape: 2, // warp
      u_type: 4,  // 8x8 Bayer
      u_pxSize: 2,
      u_scale: 0.6,
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
    0.4
  );
}

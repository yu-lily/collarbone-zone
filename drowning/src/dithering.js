import {
  ShaderMount,
  imageDitheringFragmentShader,
  ditheringFragmentShader,
  getShaderColorFromString,
} from "@paper-design/shaders";

const bgEl = document.getElementById("bg-dither");
const overlayEl = document.getElementById("bg-overlay-dither");

function showFallback() {
  document.body.classList.add("fallback-visible");
}

function mountOverlay() {
  new ShaderMount(
    overlayEl,
    ditheringFragmentShader,
    {
      u_colorBack: getShaderColorFromString("#00000000"),
      u_colorFront: getShaderColorFromString("#FFC8E9"),
      u_shape: 2,
      u_type: 4,
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

if (bgEl && overlayEl) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "../img/drowning-in-moonlight/sky.png";

  function mountAll() {
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
          u_type: 4,
          u_pxSize: 2,
          u_colorSteps: 3,
          u_scale: 1,
          u_fit: 2,
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
      mountOverlay();
      // Wait one frame so both canvases have rendered before revealing
      requestAnimationFrame(() => {
        document.body.classList.add("shader-loaded");
      });
    } catch (e) {
      showFallback();
    }
  }

  img.onerror = showFallback;

  if (img.complete && img.naturalWidth > 0) {
    mountAll();
  } else {
    img.onload = mountAll;
  }
} else {
  showFallback();
}

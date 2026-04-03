var k=`#version 300 es
precision mediump float;

layout(location = 0) in vec4 a_position;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_imageAspectRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

out vec2 v_objectUV;
out vec2 v_objectBoxSize;
out vec2 v_responsiveUV;
out vec2 v_responsiveBoxGivenSize;
out vec2 v_patternUV;
out vec2 v_patternBoxSize;
out vec2 v_imageUV;

vec3 getBoxSize(float boxRatio, vec2 givenBoxSize) {
  vec2 box = vec2(0.);
  // fit = none
  box.x = boxRatio * min(givenBoxSize.x / boxRatio, givenBoxSize.y);
  float noFitBoxWidth = box.x;
  if (u_fit == 1.) { // fit = contain
    box.x = boxRatio * min(u_resolution.x / boxRatio, u_resolution.y);
  } else if (u_fit == 2.) { // fit = cover
    box.x = boxRatio * max(u_resolution.x / boxRatio, u_resolution.y);
  }
  box.y = box.x / boxRatio;
  return vec3(box, noFitBoxWidth);
}

void main() {
  gl_Position = a_position;

  vec2 uv = gl_Position.xy * .5;
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * 3.14159265358979323846 / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);


  // ===================================================

  float fixedRatio = 1.;
  vec2 fixedRatioBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );

  v_objectBoxSize = getBoxSize(fixedRatio, fixedRatioBoxGivenSize).xy;
  vec2 objectWorldScale = u_resolution.xy / v_objectBoxSize;

  v_objectUV = uv;
  v_objectUV *= objectWorldScale;
  v_objectUV += boxOrigin * (objectWorldScale - 1.);
  v_objectUV += graphicOffset;
  v_objectUV /= u_scale;
  v_objectUV = graphicRotation * v_objectUV;

  // ===================================================

  v_responsiveBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  float responsiveRatio = v_responsiveBoxGivenSize.x / v_responsiveBoxGivenSize.y;
  vec2 responsiveBoxSize = getBoxSize(responsiveRatio, v_responsiveBoxGivenSize).xy;
  vec2 responsiveBoxScale = u_resolution.xy / responsiveBoxSize;

  #ifdef ADD_HELPERS
  v_responsiveHelperBox = uv;
  v_responsiveHelperBox *= responsiveBoxScale;
  v_responsiveHelperBox += boxOrigin * (responsiveBoxScale - 1.);
  #endif

  v_responsiveUV = uv;
  v_responsiveUV *= responsiveBoxScale;
  v_responsiveUV += boxOrigin * (responsiveBoxScale - 1.);
  v_responsiveUV += graphicOffset;
  v_responsiveUV /= u_scale;
  v_responsiveUV.x *= responsiveRatio;
  v_responsiveUV = graphicRotation * v_responsiveUV;
  v_responsiveUV.x /= responsiveRatio;

  // ===================================================

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 patternBoxGivenSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  patternBoxRatio = patternBoxGivenSize.x / patternBoxGivenSize.y;

  vec3 boxSizeData = getBoxSize(patternBoxRatio, patternBoxGivenSize);
  v_patternBoxSize = boxSizeData.xy;
  float patternBoxNoFitBoxWidth = boxSizeData.z;
  vec2 patternBoxScale = u_resolution.xy / v_patternBoxSize;

  v_patternUV = uv;
  v_patternUV += graphicOffset / patternBoxScale;
  v_patternUV += boxOrigin;
  v_patternUV -= boxOrigin / patternBoxScale;
  v_patternUV *= u_resolution.xy;
  v_patternUV /= u_pixelRatio;
  if (u_fit > 0.) {
    v_patternUV *= (patternBoxNoFitBoxWidth / v_patternBoxSize.x);
  }
  v_patternUV /= u_scale;
  v_patternUV = graphicRotation * v_patternUV;
  v_patternUV += boxOrigin / patternBoxScale;
  v_patternUV -= boxOrigin;
  // x100 is a default multiplier between vertex and fragmant shaders
  // we use it to avoid UV presision issues
  v_patternUV *= .01;

  // ===================================================

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  v_imageUV = uv;
  v_imageUV *= imageBoxScale;
  v_imageUV += boxOrigin * (imageBoxScale - 1.);
  v_imageUV += graphicOffset;
  v_imageUV /= u_scale;
  v_imageUV.x *= u_imageAspectRatio;
  v_imageUV = graphicRotation * v_imageUV;
  v_imageUV.x /= u_imageAspectRatio;

  v_imageUV += .5;
  v_imageUV.y = 1. - v_imageUV.y;
}`;var N=8294400;class z{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=f();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(J,K,Q,Y,V=0,$=0,O=2,X=N,_=[]){if(J?.nodeType===1)this.parentElement=J;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=J.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){let j=this.ownerDocument.createElement("style");j.innerHTML=y,j.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(j)}let Z=this.ownerDocument.createElement("canvas");this.canvasElement=Z,this.parentElement.prepend(Z),this.fragmentShader=K,this.providedUniforms=Q,this.mipmaps=_,this.currentFrame=$,this.minPixelRatio=O,this.maxPixelCount=X;let B=Z.getContext("webgl2",Y);if(!B)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=B,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed(V),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let J=P(this.gl,k,this.fragmentShader);if(!J)return;this.program=J};setupPositionAttribute=()=>{let J=this.gl.getAttribLocation(this.program,"a_position"),K=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,K);let Q=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(Q),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(J),this.gl.vertexAttribPointer(J,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let J={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([K,Q])=>{if(J[K]=this.gl.getUniformLocation(this.program,K),Q instanceof HTMLImageElement){let Y=`${K}AspectRatio`;J[Y]=this.gl.getUniformLocation(this.program,Y)}}),this.uniformLocations=J};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([J])=>{if(J?.borderBoxSize[0]){let K=J.devicePixelContentBoxSize?.[0];if(K!==void 0)this.devicePixelsSupported=!0,this.parentDevicePixelWidth=K.inlineSize,this.parentDevicePixelHeight=K.blockSize;this.parentWidth=J.borderBoxSize[0].inlineSize,this.parentHeight=J.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let J=0,K=0,Q=Math.max(1,window.devicePixelRatio),Y=visualViewport?.scale??1;if(this.devicePixelsSupported){let Z=Math.max(1,this.minPixelRatio/Q);J=this.parentDevicePixelWidth*Z*Y,K=this.parentDevicePixelHeight*Z*Y}else{let Z=Math.max(Q,this.minPixelRatio)*Y;if(this.isSafari){let B=v(this.ownerDocument);Z*=Math.max(1,B)}J=Math.round(this.parentWidth)*Z,K=Math.round(this.parentHeight)*Z}let V=Math.sqrt(this.maxPixelCount)/Math.sqrt(J*K),$=Math.min(1,V),O=Math.round(J*$),X=Math.round(K*$),_=O/Math.round(this.parentWidth);if(this.canvasElement.width!==O||this.canvasElement.height!==X||this.renderScale!==_)this.renderScale=_,this.canvasElement.width=O,this.canvasElement.height=X,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now())};render=(J)=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}let K=J-this.lastRenderTime;if(this.lastRenderTime=J,this.currentSpeed!==0)this.currentFrame+=K*this.currentSpeed;if(this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*0.001),this.resolutionChanged)this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1;if(this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0)this.requestRender();else this.rafId=null};requestRender=()=>{if(this.rafId!==null)cancelAnimationFrame(this.rafId);this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(J,K)=>{if(!K.complete||K.naturalWidth===0)throw Error(`Paper Shaders: image for uniform ${J} must be fully loaded`);let Q=this.textures.get(J);if(Q)this.gl.deleteTexture(Q);if(!this.textureUnitMap.has(J))this.textureUnitMap.set(J,this.textureUnitMap.size);let Y=this.textureUnitMap.get(J);this.gl.activeTexture(this.gl.TEXTURE0+Y);let V=this.gl.createTexture();if(this.gl.bindTexture(this.gl.TEXTURE_2D,V),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,K),this.mipmaps.includes(J))this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR);let $=this.gl.getError();if($!==this.gl.NO_ERROR||V===null){console.error("Paper Shaders: WebGL error when uploading texture:",$);return}this.textures.set(J,V);let O=this.uniformLocations[J];if(O){this.gl.uniform1i(O,Y);let X=`${J}AspectRatio`,_=this.uniformLocations[X];if(_){let Z=K.naturalWidth/K.naturalHeight;this.gl.uniform1f(_,Z)}}};areUniformValuesEqual=(J,K)=>{if(J===K)return!0;if(Array.isArray(J)&&Array.isArray(K)&&J.length===K.length)return J.every((Q,Y)=>this.areUniformValuesEqual(Q,K[Y]));return!1};setUniformValues=(J)=>{this.gl.useProgram(this.program),Object.entries(J).forEach(([K,Q])=>{let Y=Q;if(Q instanceof HTMLImageElement)Y=`${Q.src.slice(0,200)}|${Q.naturalWidth}x${Q.naturalHeight}`;if(this.areUniformValuesEqual(this.uniformCache[K],Y))return;this.uniformCache[K]=Y;let V=this.uniformLocations[K];if(!V){console.warn(`Uniform location for ${K} not found`);return}if(Q instanceof HTMLImageElement)this.setTextureUniform(K,Q);else if(Array.isArray(Q)){let $=null,O=null;if(Q[0]!==void 0&&Array.isArray(Q[0])){let X=Q[0].length;if(Q.every((_)=>_.length===X))$=Q.flat(),O=X;else{console.warn(`All child arrays must be the same length for ${K}`);return}}else $=Q,O=$.length;switch(O){case 2:this.gl.uniform2fv(V,$);break;case 3:this.gl.uniform3fv(V,$);break;case 4:this.gl.uniform4fv(V,$);break;case 9:this.gl.uniformMatrix3fv(V,!1,$);break;case 16:this.gl.uniformMatrix4fv(V,!1,$);break;default:console.warn(`Unsupported uniform array length: ${O}`)}}else if(typeof Q==="number")this.gl.uniform1f(V,Q);else if(typeof Q==="boolean")this.gl.uniform1i(V,Q?1:0);else console.warn(`Unsupported uniform type for ${K}: ${typeof Q}`)})};getCurrentFrame=()=>{return this.currentFrame};setFrame=(J)=>{this.currentFrame=J,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(J=1)=>{this.speed=J,this.setCurrentSpeed(this.ownerDocument.hidden?0:J)};setCurrentSpeed=(J)=>{if(this.currentSpeed=J,this.rafId===null&&J!==0)this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render);if(this.rafId!==null&&J===0)cancelAnimationFrame(this.rafId),this.rafId=null};setMaxPixelCount=(J=N)=>{this.maxPixelCount=J,this.handleResize()};setMinPixelRatio=(J=2)=>{this.minPixelRatio=J,this.handleResize()};setUniforms=(J)=>{this.setUniformValues(J),this.providedUniforms={...this.providedUniforms,...J},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.setCurrentSpeed(this.ownerDocument.hidden?0:this.speed)};dispose=()=>{if(this.hasBeenDisposed=!0,this.rafId!==null)cancelAnimationFrame(this.rafId),this.rafId=null;if(this.gl&&this.program)this.textures.forEach((J)=>{this.gl.deleteTexture(J)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError();if(this.resizeObserver)this.resizeObserver.disconnect(),this.resizeObserver=null;visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}}function F(J,K,Q){let Y=J.createShader(K);if(!Y)return null;if(J.shaderSource(Y,Q),J.compileShader(Y),!J.getShaderParameter(Y,J.COMPILE_STATUS))return console.error("An error occurred compiling the shaders: "+J.getShaderInfoLog(Y)),J.deleteShader(Y),null;return Y}function P(J,K,Q){let Y=J.getShaderPrecisionFormat(J.FRAGMENT_SHADER,J.MEDIUM_FLOAT),V=Y?Y.precision:null;if(V&&V<23)K=K.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),Q=Q.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3");let $=F(J,J.VERTEX_SHADER,K),O=F(J,J.FRAGMENT_SHADER,Q);if(!$||!O)return null;let X=J.createProgram();if(!X)return null;if(J.attachShader(X,$),J.attachShader(X,O),J.linkProgram(X),!J.getProgramParameter(X,J.LINK_STATUS))return console.error("Unable to initialize the shader program: "+J.getProgramInfoLog(X)),J.deleteProgram(X),J.deleteShader($),J.deleteShader(O),null;return J.detachShader(X,$),J.detachShader(X,O),J.deleteShader($),J.deleteShader(O),X}var y=`@layer paper-shaders {
  :where([data-paper-shader]) {
    isolation: isolate;
    position: relative;

    & canvas {
      contain: strict;
      display: block;
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      corner-shape: inherit;
    }
  }
}`;function f(){let J=navigator.userAgent.toLowerCase();return J.includes("safari")&&!J.includes("chrome")&&!J.includes("android")}function v(J){let K=visualViewport?.scale??1,Q=visualViewport?.width??window.innerWidth,Y=window.innerWidth-J.documentElement.clientWidth,V=K*Q+Y,$=outerWidth/V,O=Math.round(100*$);if(O%5===0)return O/100;if(O===33)return 0.3333333333333333;if(O===67)return 0.6666666666666666;if(O===133)return 1.3333333333333333;return $}var H=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;var w=`
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`,G=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`;var M=`
vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;var C=`#version 300 es
precision mediump float;

uniform float u_time;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;
uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform float u_pxSize;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;
uniform float u_shape;
uniform float u_type;

out vec4 fragColor;

${M}
${H}
${w}
${G}

float getSimplexNoise(vec2 uv, float t) {
  float noise = .5 * snoise(uv - vec2(0., .3 * t));
  noise += .5 * snoise(2. * uv + vec2(0., .32 * t));

  return noise;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const int bayer8x8[64] = int[64](
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {
  float t = .5 * u_time;

  float pxSize = u_pxSize * u_pixelRatio;
  vec2 pxSizeUV = gl_FragCoord.xy - .5 * u_resolution;
  pxSizeUV /= pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;

  vec2 ditheringNoiseUV = canvasPixelizedUV;
  vec2 shapeUV = normalizedUV;

  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  vec2 givenBoxSize = vec2(u_worldWidth, u_worldHeight);
  givenBoxSize = max(givenBoxSize, vec2(1.)) * u_pixelRatio;
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  float patternBoxRatio = givenBoxSize.x / givenBoxSize.y;
  vec2 boxSize = vec2(
  (u_worldWidth == 0.) ? u_resolution.x : givenBoxSize.x,
  (u_worldHeight == 0.) ? u_resolution.y : givenBoxSize.y
  );
  
  if (u_shape > 3.5) {
    vec2 objectBoxSize = vec2(0.);
    // fit = none
    objectBoxSize.x = min(boxSize.x, boxSize.y);
    if (u_fit == 1.) { // fit = contain
      objectBoxSize.x = min(u_resolution.x, u_resolution.y);
    } else if (u_fit == 2.) { // fit = cover
      objectBoxSize.x = max(u_resolution.x, u_resolution.y);
    }
    objectBoxSize.y = objectBoxSize.x;
    vec2 objectWorldScale = u_resolution.xy / objectBoxSize;

    shapeUV *= objectWorldScale;
    shapeUV += boxOrigin * (objectWorldScale - 1.);
    shapeUV += vec2(-u_offsetX, u_offsetY);
    shapeUV /= u_scale;
    shapeUV = graphicRotation * shapeUV;
  } else {
    vec2 patternBoxSize = vec2(0.);
    // fit = none
    patternBoxSize.x = patternBoxRatio * min(boxSize.x / patternBoxRatio, boxSize.y);
    float patternWorldNoFitBoxWidth = patternBoxSize.x;
    if (u_fit == 1.) { // fit = contain
      patternBoxSize.x = patternBoxRatio * min(u_resolution.x / patternBoxRatio, u_resolution.y);
    } else if (u_fit == 2.) { // fit = cover
      patternBoxSize.x = patternBoxRatio * max(u_resolution.x / patternBoxRatio, u_resolution.y);
    }
    patternBoxSize.y = patternBoxSize.x / patternBoxRatio;
    vec2 patternWorldScale = u_resolution.xy / patternBoxSize;

    shapeUV += vec2(-u_offsetX, u_offsetY) / patternWorldScale;
    shapeUV += boxOrigin;
    shapeUV -= boxOrigin / patternWorldScale;
    shapeUV *= u_resolution.xy;
    shapeUV /= u_pixelRatio;
    if (u_fit > 0.) {
      shapeUV *= (patternWorldNoFitBoxWidth / patternBoxSize.x);
    }
    shapeUV /= u_scale;
    shapeUV = graphicRotation * shapeUV;
    shapeUV += boxOrigin / patternWorldScale;
    shapeUV -= boxOrigin;
    shapeUV += .5;
  }

  float shape = 0.;
  if (u_shape < 1.5) {
    // Simplex noise
    shapeUV *= .001;

    shape = 0.5 + 0.5 * getSimplexNoise(shapeUV, t);
    shape = smoothstep(0.3, 0.9, shape);

  } else if (u_shape < 2.5) {
    // Warp
    shapeUV *= .003;

    for (float i = 1.0; i < 6.0; i++) {
      shapeUV.x += 0.6 / i * cos(i * 2.5 * shapeUV.y + t);
      shapeUV.y += 0.6 / i * cos(i * 1.5 * shapeUV.x + t);
    }

    shape = .15 / max(0.001, abs(sin(t - shapeUV.y - shapeUV.x)));
    shape = smoothstep(0.02, 1., shape);

  } else if (u_shape < 3.5) {
    // Dots
    shapeUV *= .05;

    float stripeIdx = floor(2. * shapeUV.x / TWO_PI);
    float rand = hash11(stripeIdx * 10.);
    rand = sign(rand - .5) * pow(.1 + abs(rand), .4);
    shape = sin(shapeUV.x) * cos(shapeUV.y - 5. * rand * t);
    shape = pow(abs(shape), 6.);

  } else if (u_shape < 4.5) {
    // Sine wave
    shapeUV *= 4.;

    float wave = cos(.5 * shapeUV.x - 2. * t) * sin(1.5 * shapeUV.x + t) * (.75 + .25 * cos(3. * t));
    shape = 1. - smoothstep(-1., 1., shapeUV.y + wave);

  } else if (u_shape < 5.5) {
    // Ripple

    float dist = length(shapeUV);
    float waves = sin(pow(dist, 1.7) * 7. - 3. * t) * .5 + .5;
    shape = waves;

  } else if (u_shape < 6.5) {
    // Swirl

    float l = length(shapeUV);
    float angle = 6. * atan(shapeUV.y, shapeUV.x) + 4. * t;
    float twist = 1.2;
    float offset = 1. / pow(max(l, 1e-6), twist) + angle / TWO_PI;
    float mid = smoothstep(0., 1., pow(l, twist));
    shape = mix(0., fract(offset), mid);

  } else {
    // Sphere
    shapeUV *= 2.;

    float d = 1. - pow(length(shapeUV), 2.);
    vec3 pos = vec3(shapeUV, sqrt(max(0., d)));
    vec3 lightPos = normalize(vec3(cos(1.5 * t), .8, sin(1.25 * t)));
    shape = .5 + .5 * dot(lightPos, pos);
    shape *= step(0., d);
  }


  int type = int(floor(u_type));
  float dithering = 0.0;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoiseUV), shape);
    } break;
    case 2:
    dithering = getBayerValue(pxSizeUV, 2);
    break;
    case 3:
    dithering = getBayerValue(pxSizeUV, 4);
    break;
    default :
    dithering = getBayerValue(pxSizeUV, 8);
    break;
  }

  dithering -= .5;
  float res = step(.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  float fgOpacity = u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  float bgOpacity = u_colorBack.a;

  vec3 color = fgColor * res;
  float opacity = fgOpacity * res;

  color += bgColor * (1. - opacity);
  opacity += bgOpacity * (1. - opacity);

  fragColor = vec4(color, opacity);
}
`;var D=`#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform float u_originX;
uniform float u_originY;
uniform float u_worldWidth;
uniform float u_worldHeight;
uniform float u_fit;

uniform float u_scale;
uniform float u_rotation;
uniform float u_offsetX;
uniform float u_offsetY;

uniform vec4 u_colorFront;
uniform vec4 u_colorBack;
uniform vec4 u_colorHighlight;

uniform sampler2D u_image;
uniform float u_imageAspectRatio;

uniform float u_type;
uniform float u_pxSize;
uniform bool u_originalColors;
uniform bool u_inverted;
uniform float u_colorSteps;

out vec4 fragColor;


${G}
${H}

float getUvFrame(vec2 uv, vec2 pad) {
  float aa = 0.0001;

  float left   = smoothstep(-pad.x, -pad.x + aa, uv.x);
  float right  = smoothstep(1.0 + pad.x, 1.0 + pad.x - aa, uv.x);
  float bottom = smoothstep(-pad.y, -pad.y + aa, uv.y);
  float top    = smoothstep(1.0 + pad.y, 1.0 + pad.y - aa, uv.y);

  return left * right * bottom * top;
}

vec2 getImageUV(vec2 uv) {
  vec2 boxOrigin = vec2(.5 - u_originX, u_originY - .5);
  float r = u_rotation * PI / 180.;
  mat2 graphicRotation = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 graphicOffset = vec2(-u_offsetX, u_offsetY);

  vec2 imageBoxSize;
  if (u_fit == 1.) { // contain
    imageBoxSize.x = min(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else if (u_fit == 2.) { // cover
    imageBoxSize.x = max(u_resolution.x / u_imageAspectRatio, u_resolution.y) * u_imageAspectRatio;
  } else {
    imageBoxSize.x = min(10.0, 10.0 / u_imageAspectRatio * u_imageAspectRatio);
  }
  imageBoxSize.y = imageBoxSize.x / u_imageAspectRatio;
  vec2 imageBoxScale = u_resolution.xy / imageBoxSize;

  vec2 imageUV = uv;
  imageUV *= imageBoxScale;
  imageUV += boxOrigin * (imageBoxScale - 1.);
  imageUV += graphicOffset;
  imageUV /= u_scale;
  imageUV.x *= u_imageAspectRatio;
  imageUV = graphicRotation * imageUV;
  imageUV.x /= u_imageAspectRatio;

  imageUV += .5;
  imageUV.y = 1. - imageUV.y;

  return imageUV;
}

const int bayer2x2[4] = int[4](0, 2, 3, 1);
const int bayer4x4[16] = int[16](
0, 8, 2, 10,
12, 4, 14, 6,
3, 11, 1, 9,
15, 7, 13, 5
);

const int bayer8x8[64] = int[64](
0, 32, 8, 40, 2, 34, 10, 42,
48, 16, 56, 24, 50, 18, 58, 26,
12, 44, 4, 36, 14, 46, 6, 38,
60, 28, 52, 20, 62, 30, 54, 22,
3, 35, 11, 43, 1, 33, 9, 41,
51, 19, 59, 27, 49, 17, 57, 25,
15, 47, 7, 39, 13, 45, 5, 37,
63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv, int size) {
  ivec2 pos = ivec2(fract(uv / float(size)) * float(size));
  int index = pos.y * size + pos.x;

  if (size == 2) {
    return float(bayer2x2[index]) / 4.0;
  } else if (size == 4) {
    return float(bayer4x4[index]) / 16.0;
  } else if (size == 8) {
    return float(bayer8x8[index]) / 64.0;
  }
  return 0.0;
}


void main() {

  float pxSize = u_pxSize * u_pixelRatio;
  vec2 pxSizeUV = gl_FragCoord.xy - .5 * u_resolution;
  pxSizeUV /= pxSize;
  vec2 canvasPixelizedUV = (floor(pxSizeUV) + .5) * pxSize;
  vec2 normalizedUV = canvasPixelizedUV / u_resolution;

  vec2 imageUV = getImageUV(normalizedUV);
  vec2 ditheringNoiseUV = canvasPixelizedUV;
  vec4 image = texture(u_image, imageUV);
  float frame = getUvFrame(imageUV, pxSize / u_resolution);

  int type = int(floor(u_type));
  float dithering = 0.0;

  float lum = dot(vec3(.2126, .7152, .0722), image.rgb);
  lum = u_inverted ? (1. - lum) : lum;

  switch (type) {
    case 1: {
      dithering = step(hash21(ditheringNoiseUV), lum);
    } break;
    case 2:
    dithering = getBayerValue(pxSizeUV, 2);
    break;
    case 3:
    dithering = getBayerValue(pxSizeUV, 4);
    break;
    default :
    dithering = getBayerValue(pxSizeUV, 8);
    break;
  }

  float colorSteps = max(floor(u_colorSteps), 1.);
  vec3 color = vec3(0.0);
  float opacity = 1.;

  dithering -= .5;
  float brightness = clamp(lum + dithering / colorSteps, 0.0, 1.0);
  brightness = mix(0.0, brightness, frame);
  brightness = mix(0.0, brightness, image.a);
  float quantLum = floor(brightness * colorSteps + 0.5) / colorSteps;
  quantLum = mix(0.0, quantLum, frame);

  if (u_originalColors == true) {
    vec3 normColor = image.rgb / max(lum, 0.001);
    color = normColor * quantLum;

    float quantAlpha = floor(image.a * colorSteps + 0.5) / colorSteps;
    opacity = mix(quantLum, 1., quantAlpha);
  } else {
    vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
    float fgOpacity = u_colorFront.a;
    vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
    float bgOpacity = u_colorBack.a;
    vec3 hlColor = u_colorHighlight.rgb * u_colorHighlight.a;
    float hlOpacity = u_colorHighlight.a;

    fgColor = mix(fgColor, hlColor, step(1.02 - .02 * u_colorSteps, brightness));
    fgOpacity = mix(fgOpacity, hlOpacity, step(1.02 - .02 * u_colorSteps, brightness));

    color = fgColor * quantLum;
    opacity = fgOpacity * quantLum;
    color += bgColor * (1.0 - opacity);
    opacity += bgOpacity * (1.0 - opacity);
  }

  fragColor = vec4(color, opacity);
}
`;function W(J){if(Array.isArray(J)){if(J.length===4)return J;if(J.length===3)return[...J,1];return L}if(typeof J!=="string")return L;let K,Q,Y,V=1;if(J.startsWith("#"))[K,Q,Y,V]=x(J);else if(J.startsWith("rgb"))[K,Q,Y,V]=p(J);else if(J.startsWith("hsl"))[K,Q,Y,V]=u(S(J));else return console.error("Unsupported color format",J),L;return[T(K,0,1),T(Q,0,1),T(Y,0,1),T(V,0,1)]}function x(J){if(J=J.replace(/^#/,""),J.length===3)J=J.split("").map(($)=>$+$).join("");if(J.length===6)J=J+"ff";let K=parseInt(J.slice(0,2),16)/255,Q=parseInt(J.slice(2,4),16)/255,Y=parseInt(J.slice(4,6),16)/255,V=parseInt(J.slice(6,8),16)/255;return[K,Q,Y,V]}function p(J){let K=J.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);if(!K)return[0,0,0,1];return[parseInt(K[1]??"0")/255,parseInt(K[2]??"0")/255,parseInt(K[3]??"0")/255,K[4]===void 0?1:parseFloat(K[4])]}function S(J){let K=J.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);if(!K)return[0,0,0,1];return[parseInt(K[1]??"0"),parseInt(K[2]??"0"),parseInt(K[3]??"0"),K[4]===void 0?1:parseFloat(K[4])]}function u(J){let[K,Q,Y,V]=J,$=K/360,O=Q/100,X=Y/100,_,Z,B;if(Q===0)_=Z=B=X;else{let j=(q,E,I)=>{if(I<0)I+=1;if(I>1)I-=1;if(I<0.16666666666666666)return q+(E-q)*6*I;if(I<0.5)return E;if(I<0.6666666666666666)return q+(E-q)*(0.6666666666666666-I)*6;return q},A=X<0.5?X*(1+O):X+O-X*O,U=2*X-A;_=j(U,A,$+0.3333333333333333),Z=j(U,A,$),B=j(U,A,$-0.3333333333333333)}return[_,Z,B,V]}var T=(J,K,Q)=>Math.min(Math.max(J,K),Q),L=[0,0,0,1];var R=document.getElementById("bg-dither");if(R){let K=function(){try{new z(R,D,{u_image:J,u_imageAspectRatio:J.naturalWidth/J.naturalHeight,u_colorFront:W("#00000000"),u_colorBack:W("#00000000"),u_colorHighlight:W("#00000000"),u_originalColors:!0,u_inverted:!1,u_type:4,u_pxSize:2,u_colorSteps:3,u_scale:1,u_fit:2,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:0.5,u_originY:0.5,u_worldWidth:0,u_worldHeight:0},void 0,0),document.body.classList.add("shader-loaded")}catch(Q){}},J=new Image;if(J.crossOrigin="anonymous",J.src="../img/drowning-in-moonlight/sky.png",J.complete&&J.naturalWidth>0)K();else J.onload=K}var b=document.getElementById("bg-overlay-dither");if(b)new z(b,C,{u_colorBack:W("#00000000"),u_colorFront:W("#FFC8E9"),u_shape:2,u_type:4,u_pxSize:2,u_scale:0.6,u_fit:0,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:0.5,u_originY:0.5,u_worldWidth:0,u_worldHeight:0},void 0,0.4);

var U=`#version 300 es
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
}`;var F=8294400;class z{parentElement;canvasElement;gl;program=null;uniformLocations={};fragmentShader;rafId=null;lastRenderTime=0;currentFrame=0;speed=0;currentSpeed=0;providedUniforms;mipmaps=[];hasBeenDisposed=!1;resolutionChanged=!0;textures=new Map;minPixelRatio;maxPixelCount;isSafari=P();uniformCache={};textureUnitMap=new Map;ownerDocument;constructor(_,Y,J,K,$=0,Q=0,X=2,I=F,O=[]){if(_?.nodeType===1)this.parentElement=_;else throw Error("Paper Shaders: parent element must be an HTMLElement");if(this.ownerDocument=_.ownerDocument,!this.ownerDocument.querySelector("style[data-paper-shader]")){let j=this.ownerDocument.createElement("style");j.innerHTML=b,j.setAttribute("data-paper-shader",""),this.ownerDocument.head.prepend(j)}let V=this.ownerDocument.createElement("canvas");this.canvasElement=V,this.parentElement.prepend(V),this.fragmentShader=Y,this.providedUniforms=J,this.mipmaps=O,this.currentFrame=Q,this.minPixelRatio=X,this.maxPixelCount=I;let B=V.getContext("webgl2",K);if(!B)throw Error("Paper Shaders: WebGL is not supported in this browser");this.gl=B,this.initProgram(),this.setupPositionAttribute(),this.setupUniforms(),this.setUniformValues(this.providedUniforms),this.setupResizeObserver(),visualViewport?.addEventListener("resize",this.handleVisualViewportChange),this.setSpeed($),this.parentElement.setAttribute("data-paper-shader",""),this.parentElement.paperShaderMount=this,this.ownerDocument.addEventListener("visibilitychange",this.handleDocumentVisibilityChange)}initProgram=()=>{let _=R(this.gl,U,this.fragmentShader);if(!_)return;this.program=_};setupPositionAttribute=()=>{let _=this.gl.getAttribLocation(this.program,"a_position"),Y=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,Y);let J=[-1,-1,1,-1,-1,1,-1,1,1,-1,1,1];this.gl.bufferData(this.gl.ARRAY_BUFFER,new Float32Array(J),this.gl.STATIC_DRAW),this.gl.enableVertexAttribArray(_),this.gl.vertexAttribPointer(_,2,this.gl.FLOAT,!1,0,0)};setupUniforms=()=>{let _={u_time:this.gl.getUniformLocation(this.program,"u_time"),u_pixelRatio:this.gl.getUniformLocation(this.program,"u_pixelRatio"),u_resolution:this.gl.getUniformLocation(this.program,"u_resolution")};Object.entries(this.providedUniforms).forEach(([Y,J])=>{if(_[Y]=this.gl.getUniformLocation(this.program,Y),J instanceof HTMLImageElement){let K=`${Y}AspectRatio`;_[K]=this.gl.getUniformLocation(this.program,K)}}),this.uniformLocations=_};renderScale=1;parentWidth=0;parentHeight=0;parentDevicePixelWidth=0;parentDevicePixelHeight=0;devicePixelsSupported=!1;resizeObserver=null;setupResizeObserver=()=>{this.resizeObserver=new ResizeObserver(([_])=>{if(_?.borderBoxSize[0]){let Y=_.devicePixelContentBoxSize?.[0];if(Y!==void 0)this.devicePixelsSupported=!0,this.parentDevicePixelWidth=Y.inlineSize,this.parentDevicePixelHeight=Y.blockSize;this.parentWidth=_.borderBoxSize[0].inlineSize,this.parentHeight=_.borderBoxSize[0].blockSize}this.handleResize()}),this.resizeObserver.observe(this.parentElement)};handleVisualViewportChange=()=>{this.resizeObserver?.disconnect(),this.setupResizeObserver()};handleResize=()=>{let _=0,Y=0,J=Math.max(1,window.devicePixelRatio),K=visualViewport?.scale??1;if(this.devicePixelsSupported){let V=Math.max(1,this.minPixelRatio/J);_=this.parentDevicePixelWidth*V*K,Y=this.parentDevicePixelHeight*V*K}else{let V=Math.max(J,this.minPixelRatio)*K;if(this.isSafari){let B=y(this.ownerDocument);V*=Math.max(1,B)}_=Math.round(this.parentWidth)*V,Y=Math.round(this.parentHeight)*V}let $=Math.sqrt(this.maxPixelCount)/Math.sqrt(_*Y),Q=Math.min(1,$),X=Math.round(_*Q),I=Math.round(Y*Q),O=X/Math.round(this.parentWidth);if(this.canvasElement.width!==X||this.canvasElement.height!==I||this.renderScale!==O)this.renderScale=O,this.canvasElement.width=X,this.canvasElement.height=I,this.resolutionChanged=!0,this.gl.viewport(0,0,this.gl.canvas.width,this.gl.canvas.height),this.render(performance.now())};render=(_)=>{if(this.hasBeenDisposed)return;if(this.program===null){console.warn("Tried to render before program or gl was initialized");return}let Y=_-this.lastRenderTime;if(this.lastRenderTime=_,this.currentSpeed!==0)this.currentFrame+=Y*this.currentSpeed;if(this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform1f(this.uniformLocations.u_time,this.currentFrame*0.001),this.resolutionChanged)this.gl.uniform2f(this.uniformLocations.u_resolution,this.gl.canvas.width,this.gl.canvas.height),this.gl.uniform1f(this.uniformLocations.u_pixelRatio,this.renderScale),this.resolutionChanged=!1;if(this.gl.drawArrays(this.gl.TRIANGLES,0,6),this.currentSpeed!==0)this.requestRender();else this.rafId=null};requestRender=()=>{if(this.rafId!==null)cancelAnimationFrame(this.rafId);this.rafId=requestAnimationFrame(this.render)};setTextureUniform=(_,Y)=>{if(!Y.complete||Y.naturalWidth===0)throw Error(`Paper Shaders: image for uniform ${_} must be fully loaded`);let J=this.textures.get(_);if(J)this.gl.deleteTexture(J);if(!this.textureUnitMap.has(_))this.textureUnitMap.set(_,this.textureUnitMap.size);let K=this.textureUnitMap.get(_);this.gl.activeTexture(this.gl.TEXTURE0+K);let $=this.gl.createTexture();if(this.gl.bindTexture(this.gl.TEXTURE_2D,$),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_S,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_WRAP_T,this.gl.CLAMP_TO_EDGE),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MAG_FILTER,this.gl.LINEAR),this.gl.texImage2D(this.gl.TEXTURE_2D,0,this.gl.RGBA,this.gl.RGBA,this.gl.UNSIGNED_BYTE,Y),this.mipmaps.includes(_))this.gl.generateMipmap(this.gl.TEXTURE_2D),this.gl.texParameteri(this.gl.TEXTURE_2D,this.gl.TEXTURE_MIN_FILTER,this.gl.LINEAR_MIPMAP_LINEAR);let Q=this.gl.getError();if(Q!==this.gl.NO_ERROR||$===null){console.error("Paper Shaders: WebGL error when uploading texture:",Q);return}this.textures.set(_,$);let X=this.uniformLocations[_];if(X){this.gl.uniform1i(X,K);let I=`${_}AspectRatio`,O=this.uniformLocations[I];if(O){let V=Y.naturalWidth/Y.naturalHeight;this.gl.uniform1f(O,V)}}};areUniformValuesEqual=(_,Y)=>{if(_===Y)return!0;if(Array.isArray(_)&&Array.isArray(Y)&&_.length===Y.length)return _.every((J,K)=>this.areUniformValuesEqual(J,Y[K]));return!1};setUniformValues=(_)=>{this.gl.useProgram(this.program),Object.entries(_).forEach(([Y,J])=>{let K=J;if(J instanceof HTMLImageElement)K=`${J.src.slice(0,200)}|${J.naturalWidth}x${J.naturalHeight}`;if(this.areUniformValuesEqual(this.uniformCache[Y],K))return;this.uniformCache[Y]=K;let $=this.uniformLocations[Y];if(!$){console.warn(`Uniform location for ${Y} not found`);return}if(J instanceof HTMLImageElement)this.setTextureUniform(Y,J);else if(Array.isArray(J)){let Q=null,X=null;if(J[0]!==void 0&&Array.isArray(J[0])){let I=J[0].length;if(J.every((O)=>O.length===I))Q=J.flat(),X=I;else{console.warn(`All child arrays must be the same length for ${Y}`);return}}else Q=J,X=Q.length;switch(X){case 2:this.gl.uniform2fv($,Q);break;case 3:this.gl.uniform3fv($,Q);break;case 4:this.gl.uniform4fv($,Q);break;case 9:this.gl.uniformMatrix3fv($,!1,Q);break;case 16:this.gl.uniformMatrix4fv($,!1,Q);break;default:console.warn(`Unsupported uniform array length: ${X}`)}}else if(typeof J==="number")this.gl.uniform1f($,J);else if(typeof J==="boolean")this.gl.uniform1i($,J?1:0);else console.warn(`Unsupported uniform type for ${Y}: ${typeof J}`)})};getCurrentFrame=()=>{return this.currentFrame};setFrame=(_)=>{this.currentFrame=_,this.lastRenderTime=performance.now(),this.render(performance.now())};setSpeed=(_=1)=>{this.speed=_,this.setCurrentSpeed(this.ownerDocument.hidden?0:_)};setCurrentSpeed=(_)=>{if(this.currentSpeed=_,this.rafId===null&&_!==0)this.lastRenderTime=performance.now(),this.rafId=requestAnimationFrame(this.render);if(this.rafId!==null&&_===0)cancelAnimationFrame(this.rafId),this.rafId=null};setMaxPixelCount=(_=F)=>{this.maxPixelCount=_,this.handleResize()};setMinPixelRatio=(_=2)=>{this.minPixelRatio=_,this.handleResize()};setUniforms=(_)=>{this.setUniformValues(_),this.providedUniforms={...this.providedUniforms,..._},this.render(performance.now())};handleDocumentVisibilityChange=()=>{this.setCurrentSpeed(this.ownerDocument.hidden?0:this.speed)};dispose=()=>{if(this.hasBeenDisposed=!0,this.rafId!==null)cancelAnimationFrame(this.rafId),this.rafId=null;if(this.gl&&this.program)this.textures.forEach((_)=>{this.gl.deleteTexture(_)}),this.textures.clear(),this.gl.deleteProgram(this.program),this.program=null,this.gl.bindBuffer(this.gl.ARRAY_BUFFER,null),this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,null),this.gl.bindRenderbuffer(this.gl.RENDERBUFFER,null),this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null),this.gl.getError();if(this.resizeObserver)this.resizeObserver.disconnect(),this.resizeObserver=null;visualViewport?.removeEventListener("resize",this.handleVisualViewportChange),this.ownerDocument.removeEventListener("visibilitychange",this.handleDocumentVisibilityChange),this.uniformLocations={},this.canvasElement.remove(),delete this.parentElement.paperShaderMount}}function D(_,Y,J){let K=_.createShader(Y);if(!K)return null;if(_.shaderSource(K,J),_.compileShader(K),!_.getShaderParameter(K,_.COMPILE_STATUS))return console.error("An error occurred compiling the shaders: "+_.getShaderInfoLog(K)),_.deleteShader(K),null;return K}function R(_,Y,J){let K=_.getShaderPrecisionFormat(_.FRAGMENT_SHADER,_.MEDIUM_FLOAT),$=K?K.precision:null;if($&&$<23)Y=Y.replace(/precision\s+(lowp|mediump)\s+float;/g,"precision highp float;"),J=J.replace(/precision\s+(lowp|mediump)\s+float/g,"precision highp float").replace(/\b(uniform|varying|attribute)\s+(lowp|mediump)\s+(\w+)/g,"$1 highp $3");let Q=D(_,_.VERTEX_SHADER,Y),X=D(_,_.FRAGMENT_SHADER,J);if(!Q||!X)return null;let I=_.createProgram();if(!I)return null;if(_.attachShader(I,Q),_.attachShader(I,X),_.linkProgram(I),!_.getProgramParameter(I,_.LINK_STATUS))return console.error("Unable to initialize the shader program: "+_.getProgramInfoLog(I)),_.deleteProgram(I),_.deleteShader(Q),_.deleteShader(X),null;return _.detachShader(I,Q),_.detachShader(I,X),_.deleteShader(Q),_.deleteShader(X),I}var b=`@layer paper-shaders {
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
}`;function P(){let _=navigator.userAgent.toLowerCase();return _.includes("safari")&&!_.includes("chrome")&&!_.includes("android")}function y(_){let Y=visualViewport?.scale??1,J=visualViewport?.width??window.innerWidth,K=window.innerWidth-_.documentElement.clientWidth,$=Y*J+K,Q=outerWidth/$,X=Math.round(100*Q);if(X%5===0)return X/100;if(X===33)return 0.3333333333333333;if(X===67)return 0.6666666666666666;if(X===133)return 1.3333333333333333;return Q}var L=`
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
`;var k=`
  float hash11(float p) {
    p = fract(p * 0.3183099) + 0.1;
    p *= p + 19.19;
    return fract(p * p);
  }
`,N=`
  float hash21(vec2 p) {
    p = fract(p * vec2(0.3183099, 0.3678794)) + 0.1;
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }
`;var w=`
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
`;var G=`#version 300 es
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

${w}
${L}
${k}
${N}

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
`;function E(_){if(Array.isArray(_)){if(_.length===4)return _;if(_.length===3)return[..._,1];return T}if(typeof _!=="string")return T;let Y,J,K,$=1;if(_.startsWith("#"))[Y,J,K,$]=f(_);else if(_.startsWith("rgb"))[Y,J,K,$]=v(_);else if(_.startsWith("hsl"))[Y,J,K,$]=p(x(_));else return console.error("Unsupported color format",_),T;return[C(Y,0,1),C(J,0,1),C(K,0,1),C($,0,1)]}function f(_){if(_=_.replace(/^#/,""),_.length===3)_=_.split("").map((Q)=>Q+Q).join("");if(_.length===6)_=_+"ff";let Y=parseInt(_.slice(0,2),16)/255,J=parseInt(_.slice(2,4),16)/255,K=parseInt(_.slice(4,6),16)/255,$=parseInt(_.slice(6,8),16)/255;return[Y,J,K,$]}function v(_){let Y=_.match(/^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+))?\s*\)$/i);if(!Y)return[0,0,0,1];return[parseInt(Y[1]??"0")/255,parseInt(Y[2]??"0")/255,parseInt(Y[3]??"0")/255,Y[4]===void 0?1:parseFloat(Y[4])]}function x(_){let Y=_.match(/^hsla?\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([0-9.]+))?\s*\)$/i);if(!Y)return[0,0,0,1];return[parseInt(Y[1]??"0"),parseInt(Y[2]??"0"),parseInt(Y[3]??"0"),Y[4]===void 0?1:parseFloat(Y[4])]}function p(_){let[Y,J,K,$]=_,Q=Y/360,X=J/100,I=K/100,O,V,B;if(J===0)O=V=B=I;else{let j=(W,A,Z)=>{if(Z<0)Z+=1;if(Z>1)Z-=1;if(Z<0.16666666666666666)return W+(A-W)*6*Z;if(Z<0.5)return A;if(Z<0.6666666666666666)return W+(A-W)*(0.6666666666666666-Z)*6;return W},q=I<0.5?I*(1+X):I+X-I*X,H=2*I-q;O=j(H,q,Q+0.3333333333333333),V=j(H,q,Q),B=j(H,q,Q-0.3333333333333333)}return[O,V,B,$]}var C=(_,Y,J)=>Math.min(Math.max(_,Y),J),T=[0,0,0,1];var M=document.getElementById("dithering");if(M)new z(M,G,{u_colorBack:E("#00000000"),u_colorFront:E("#FFC8E9"),u_shape:4,u_type:4,u_pxSize:4.3,u_scale:1,u_fit:0,u_rotation:0,u_offsetX:0,u_offsetY:0,u_originX:0.5,u_originY:0.5,u_worldWidth:0,u_worldHeight:0},void 0,0.46);

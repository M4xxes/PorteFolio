import * as THREE from 'three'

/**
 * Simulation de fluide sur GPU (courbe → vorticité → divergence → pression → gradient → advection),
 * qui transporte la vitesse et un « colorant » (densité) injectés par le curseur.
 * Cibles en demi-flottants, filtrage linéaire. Réglages du brief : simulation 256², colorant 512²,
 * dissipations 0,98 (vitesse) / 0,97 (densité) / 0,95 (pression), 5 itérations de pression, curl 30, dt = 1/60.
 */
export const FLUID = {
  simRes: 256,
  dyeRes: 512,
  velocityDissipation: 0.98,
  densityDissipation: 0.97,
  pressureDissipation: 0.95,
  pressureIterations: 5,
  curl: 30,
  dt: 1 / 60,
}

const baseVert = /* glsl */ `
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main() {
  vUv = uv;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

const head = /* glsl */ `
precision highp float;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
`

const splatFrag = head + /* glsl */ `
uniform sampler2D uTarget;
uniform vec2 uP0;
uniform vec2 uP1;
uniform vec3 uColor;
uniform float uAspect;
uniform float uRadius;
void main() {
  vec2 asp = vec2(uAspect, 1.0);
  vec2 pa = (vUv - uP0) * asp;
  vec2 ba = (uP1 - uP0) * asp;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
  vec2 d = pa - ba * h;
  float g = exp(-dot(d, d) / (uRadius * uRadius));
  gl_FragColor = vec4(texture2D(uTarget, vUv).rgb + g * uColor, 1.0);
}`

const curlFrag = head + /* glsl */ `
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`

const vorticityFrag = head + /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float uCurlAmount;
uniform float uDt;
void main() {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlAmount * C;
  force.y *= -1.0;
  vec2 vel = texture2D(uVelocity, vUv).xy + force * uDt;
  gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}`

const divergenceFrag = head + /* glsl */ `
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x;
  if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y;
  if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`

const clearFrag = head + /* glsl */ `
uniform sampler2D uTexture;
uniform float uValue;
void main() { gl_FragColor = uValue * texture2D(uTexture, vUv); }`

const pressureFrag = head + /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float div = texture2D(uDivergence, vUv).x;
  gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`

const gradientFrag = head + /* glsl */ `
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main() {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
  gl_FragColor = vec4(vel, 0.0, 1.0);
}`

const advectionFrag = head + /* glsl */ `
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float uDt;
uniform float uDissipation;
void main() {
  vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * texelSize;
  gl_FragColor = uDissipation * texture2D(uSource, coord);
}`

class Double {
  read: THREE.WebGLRenderTarget
  write: THREE.WebGLRenderTarget
  constructor(w: number, h: number, filter: THREE.MagnificationTextureFilter) {
    const make = () =>
      new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: filter,
        magFilter: filter,
        depthBuffer: false,
        stencilBuffer: false,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping,
      })
    this.read = make()
    this.write = make()
  }
  swap() {
    ;[this.read, this.write] = [this.write, this.read]
  }
  dispose() {
    this.read.dispose()
    this.write.dispose()
  }
}

const mat = (frag: string, uniforms: Record<string, THREE.IUniform>) =>
  new THREE.ShaderMaterial({
    vertexShader: baseVert,
    fragmentShader: frag,
    uniforms: { texelSize: { value: new THREE.Vector2() }, ...uniforms },
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  })

export class Fluid {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh
  private velocity: Double
  private density: Double
  private pressure: Double
  private divergence: THREE.WebGLRenderTarget
  private curlTarget: THREE.WebGLRenderTarget
  private sim = new THREE.Vector2(1 / FLUID.simRes, 1 / FLUID.simRes)
  private dye = new THREE.Vector2(1 / FLUID.dyeRes, 1 / FLUID.dyeRes)
  private m: Record<string, THREE.ShaderMaterial>

  constructor(renderer: THREE.WebGLRenderer) {
    this.renderer = renderer
    const S = FLUID.simRes
    const D = FLUID.dyeRes
    this.velocity = new Double(S, S, THREE.LinearFilter)
    this.density = new Double(D, D, THREE.LinearFilter)
    this.pressure = new Double(S, S, THREE.NearestFilter)
    const single = (n: number) =>
      new THREE.WebGLRenderTarget(n, n, { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false })
    this.divergence = single(S)
    this.curlTarget = single(S)
    const t = () => ({ value: null as THREE.Texture | null })
    this.m = {
      splat: mat(splatFrag, { uTarget: t(), uP0: { value: new THREE.Vector2() }, uP1: { value: new THREE.Vector2() }, uColor: { value: new THREE.Vector3() }, uAspect: { value: 1 }, uRadius: { value: 0.1 } }),
      curl: mat(curlFrag, { uVelocity: t() }),
      vorticity: mat(vorticityFrag, { uVelocity: t(), uCurl: t(), uCurlAmount: { value: FLUID.curl }, uDt: { value: FLUID.dt } }),
      divergence: mat(divergenceFrag, { uVelocity: t() }),
      clear: mat(clearFrag, { uTexture: t(), uValue: { value: FLUID.pressureDissipation } }),
      pressure: mat(pressureFrag, { uPressure: t(), uDivergence: t() }),
      gradient: mat(gradientFrag, { uPressure: t(), uVelocity: t() }),
      advection: mat(advectionFrag, { uVelocity: t(), uSource: t(), uDt: { value: FLUID.dt }, uDissipation: { value: 1 } }),
    }
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.m.splat)
    this.quad.frustumCulled = false
    this.scene.add(this.quad)
  }

  get velocityTexture() {
    return this.velocity.read.texture
  }
  get densityTexture() {
    return this.density.read.texture
  }

  private run(m: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget, texel: THREE.Vector2) {
    m.uniforms.texelSize.value.copy(texel)
    this.quad.material = m
    this.renderer.setRenderTarget(target)
    this.renderer.render(this.scene, this.cam)
  }

  /** Injecte un segment (p0 → p1, en UV) : `color` dans la vitesse (ajout), blanc dans la densité. `radius` en UV, `aspect` = largeur / hauteur. */
  splat(p0: THREE.Vector2, p1: THREE.Vector2, color: THREE.Vector3, radius: number, aspect: number) {
    const u = this.m.splat.uniforms
    u.uP0.value.copy(p0)
    u.uP1.value.copy(p1)
    u.uAspect.value = aspect
    u.uRadius.value = radius
    u.uTarget.value = this.velocity.read.texture
    u.uColor.value.copy(color)
    this.run(this.m.splat, this.velocity.write, this.sim)
    this.velocity.swap()
    u.uTarget.value = this.density.read.texture
    u.uColor.value.set(1, 1, 1)
    this.run(this.m.splat, this.density.write, this.dye)
    this.density.swap()
  }

  step() {
    const m = this.m
    m.curl.uniforms.uVelocity.value = this.velocity.read.texture
    this.run(m.curl, this.curlTarget, this.sim)

    m.vorticity.uniforms.uVelocity.value = this.velocity.read.texture
    m.vorticity.uniforms.uCurl.value = this.curlTarget.texture
    this.run(m.vorticity, this.velocity.write, this.sim)
    this.velocity.swap()

    m.divergence.uniforms.uVelocity.value = this.velocity.read.texture
    this.run(m.divergence, this.divergence, this.sim)

    m.clear.uniforms.uTexture.value = this.pressure.read.texture
    this.run(m.clear, this.pressure.write, this.sim)
    this.pressure.swap()

    m.pressure.uniforms.uDivergence.value = this.divergence.texture
    for (let i = 0; i < FLUID.pressureIterations; i++) {
      m.pressure.uniforms.uPressure.value = this.pressure.read.texture
      this.run(m.pressure, this.pressure.write, this.sim)
      this.pressure.swap()
    }

    m.gradient.uniforms.uPressure.value = this.pressure.read.texture
    m.gradient.uniforms.uVelocity.value = this.velocity.read.texture
    this.run(m.gradient, this.velocity.write, this.sim)
    this.velocity.swap()

    m.advection.uniforms.uVelocity.value = this.velocity.read.texture
    m.advection.uniforms.uSource.value = this.velocity.read.texture
    m.advection.uniforms.uDissipation.value = FLUID.velocityDissipation
    this.run(m.advection, this.velocity.write, this.sim)
    this.velocity.swap()

    m.advection.uniforms.uVelocity.value = this.velocity.read.texture
    m.advection.uniforms.uSource.value = this.density.read.texture
    m.advection.uniforms.uDissipation.value = FLUID.densityDissipation
    this.run(m.advection, this.density.write, this.sim)
    this.density.swap()

    this.renderer.setRenderTarget(null)
  }

  dispose() {
    this.velocity.dispose()
    this.density.dispose()
    this.pressure.dispose()
    this.divergence.dispose()
    this.curlTarget.dispose()
    Object.values(this.m).forEach((x) => x.dispose())
    this.quad.geometry.dispose()
  }
}

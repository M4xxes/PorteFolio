import * as THREE from 'three'

/** Le quad dépasse l'écran de 6 % : la marge sert aux franges du décalage RGB. */
export const PAD = 1.06

const vertexShader = /* glsl */ `
  uniform float uSkew;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.y += p.x * uSkew; // légère inclinaison liée à la vitesse du scroll
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uReady;
  uniform float uActive;   // 0 = écran voisin (gris, sombre), 1 = écran actif
  uniform float uMono;     // 1 = noir et blanc (salle de contrôle)
  uniform float uFringe;   // intensité des franges accent / bleu
  uniform float uVel;      // vitesse du scroll, px / frame
  uniform float uTime;
  uniform float uOpacity;
  uniform float uPx;       // 1 / largeur de l'écran en px
  uniform float uLines;    // nombre de lignes de balayage
  uniform vec3 uAccent;
  uniform vec3 uBlue;
  uniform vec3 uSurface;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Déformation en barillet : l'image paraît bombée, les bords se courbent.
  vec2 barrel(vec2 uv, float k) {
    vec2 c = uv * 2.0 - 1.0;
    c *= (1.0 + k * dot(c, c)) / (1.0 + k);
    return c * 0.5 + 0.5;
  }

  // 1 à l'intérieur de l'écran (coins légèrement arrondis), 0 dehors.
  float inside(vec2 uv) {
    vec2 d = abs(uv - 0.5) - (0.5 - 0.035);
    float sd = length(max(d, 0.0)) - 0.035;
    return 1.0 - smoothstep(-uPx, uPx, sd);
  }

  void main() {
    float v = min(abs(uVel) * 0.02, 1.0);
    float k = 0.07 + v * 0.11;
    vec2 s = (vUv - 0.5) * ${PAD.toFixed(2)} + 0.5;
    vec2 uv = barrel(s, k);
    vec2 dir = uv - 0.5;

    // Image : à l'arrêt elle est nette ; en mouvement, rouge et bleu se séparent vers les bords.
    float ca = v * 0.014;
    vec3 col = vec3(
      texture2D(uTex, uv + dir * ca).r,
      texture2D(uTex, uv).g,
      texture2D(uTex, uv - dir * ca).b
    );
    col = mix(uSurface, col, uReady);

    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(luma), col, mix(0.0, 0.62, uActive) * (1.0 - uMono));
    col = (col - 0.5) * 1.1 + 0.5;
    col *= mix(0.55, 1.0, uActive);

    // Lignes de balayage fines, grain, vignettage.
    float line = smoothstep(0.0, 0.28, abs(fract(uv.y * uLines) - 0.5));
    col *= 1.0 - (0.2 + v * 0.14) * (1.0 - line);
    col += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * (0.05 + v * 0.1);
    col *= 1.0 - 0.5 * smoothstep(0.5, 1.05, length(dir * 2.0) * 0.72);

    // Décalage RGB sur les bords : accent à gauche, bleu à droite, plus large quand ça défile.
    float off = (2.0 + abs(uVel) * 0.16) * uPx * uFringe;
    float m = inside(uv);
    float fa = inside(barrel(s + vec2(off, 0.0), k));
    float fb = inside(barrel(s - vec2(off, 0.0), k));
    vec3 fringe = (uAccent * fa * 0.55 + uBlue * fb * 0.5);
    float fringeAlpha = max(fa * 0.55, fb * 0.5) * (1.0 - m);

    float alpha = max(m, fringeAlpha) * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(mix(fringe / max(max(fa * 0.55, fb * 0.5), 0.001), col, m), alpha);
  }
`

export function cssColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  const hex = /^#([0-9a-f]{6})$/i.exec(raw)?.[1] ?? fallback.slice(1)
  const n = parseInt(hex, 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

/** Capture redimensionnée par l'optimiseur d'images de Next (1200 px suffisent pour un écran 3D). */
export const optimized = (src: string, w = 1200) => `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`


export function screenColors() {
  return {
    accent: cssColor('--accent', '#d4ff3a'),
    surface: cssColor('--surface', '#18181b'),
    fg: cssColor('--fg', '#edede8'),
    blue: new THREE.Vector3(0x5a / 255, 0xc8 / 255, 0xfa / 255),
  }
}

/** Matériau « écran » : barillet, lignes de balayage, grain, vignettage, décalage RGB. */
export function createScreenMaterial(colors: ReturnType<typeof screenColors>, depth = false) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: depth,
    depthWrite: false,
    uniforms: {
      uTex: { value: null as THREE.Texture | null },
      uReady: { value: 0 },
      uActive: { value: 0 },
      uMono: { value: 0 },
      uFringe: { value: 0 },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uPx: { value: 0.002 },
      uLines: { value: 90 },
      uSkew: { value: 0 },
      uAccent: { value: colors.accent },
      uBlue: { value: colors.blue },
      uSurface: { value: colors.surface },
    },
  })
}

/** Charge une capture (via l'optimiseur Next, sinon le fichier d'origine) prête pour le shader écran. */
export function loadScreenTexture(src: string, width: number, onLoad: (t: THREE.Texture) => void) {
  const loader = new THREE.TextureLoader()
  const apply = (t: THREE.Texture) => {
    t.colorSpace = THREE.NoColorSpace
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.anisotropy = 4
    onLoad(t)
  }
  loader.load(optimized(src, width), apply, undefined, () => loader.load(src, apply))
}

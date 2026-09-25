/**
 * Procedural concept-art scenes for the UEFN page, turned into images by
 * scripts/concept-art.mjs. Everything is built from primitives in code (no
 * Fortnite assets, no screenshots), and every scene is seeded, so re-running
 * the script reproduces the same pictures.
 */
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

const TAU = Math.PI * 2
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z)
const UP = V(0, 1, 0)
const angleDiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

/* ------------------------------------------------------------------ utils */

/** Deterministic PRNG (mulberry32), so every run renders the same picture. */
function rng(seed) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  next.pick = (list) => list[Math.floor(next() * list.length)]
  return next
}

/** A colour nudged in lightness and hue — the facets of a low-poly surface. */
function vary(color, r, amount = 0.06) {
  const c = new THREE.Color(color)
  const hsl = {}
  c.getHSL(hsl)
  return c.setHSL(
    hsl.h + (r() - 0.5) * amount * 0.25,
    hsl.s,
    THREE.MathUtils.clamp(hsl.l + (r() - 0.5) * amount, 0, 1)
  )
}

const std = (color, o = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, flatShading: true, ...o })

/** Self-lit material, bright enough to trip the bloom pass. */
const glow = (color, intensity = 4, o = {}) =>
  new THREE.MeshStandardMaterial({
    color: '#000000',
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 1,
    ...o,
  })

const gold = () =>
  std('#ffc53d', {
    metalness: 0.6,
    roughness: 0.3,
    emissive: '#b87400',
    emissiveIntensity: 0.6,
    flatShading: false,
  })

function add(parent, geometry, material, { at = [0, 0, 0], rot = [0, 0, 0], scale = 1, cast = true, receive = true } = {}) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...at)
  mesh.rotation.set(...rot)
  if (typeof scale === 'number') mesh.scale.setScalar(scale)
  else mesh.scale.set(...scale)
  mesh.castShadow = cast
  mesh.receiveShadow = receive
  parent.add(mesh)
  return mesh
}

function group(parent, at = [0, 0, 0], rotY = 0) {
  const g = new THREE.Group()
  g.position.set(...at)
  g.rotation.y = rotY
  parent.add(g)
  return g
}

/** A cylinder from a to b. */
function rod(parent, a, b, radius, material, { seg = 6, cast = true } = {}) {
  const dir = V().subVectors(b, a)
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, dir.length(), seg), material)
  mesh.position.copy(a).addScaledVector(dir, 0.5)
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize())
  mesh.castShadow = cast
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

/** Moves every vertex by a random offset; corners shared by faces move together. */
function jitter(geometry, amount, r) {
  const g = geometry.index ? geometry.toNonIndexed() : geometry
  const p = g.attributes.position
  const moved = new Map()
  for (let i = 0; i < p.count; i++) {
    const key = `${p.getX(i).toFixed(3)}|${p.getY(i).toFixed(3)}|${p.getZ(i).toFixed(3)}`
    if (!moved.has(key)) moved.set(key, [(r() - 0.5) * amount, (r() - 0.5) * amount, (r() - 0.5) * amount])
    const [dx, dy, dz] = moved.get(key)
    p.setXYZ(i, p.getX(i) + dx, p.getY(i) + dy, p.getZ(i) + dz)
  }
  g.computeVertexNormals()
  return g
}

/** Triangular prism: base `width` along x, apex `height` up, extruded `length` along z. */
function prism(width, height, length, { right = false } = {}) {
  const apex = right ? width / 2 : 0
  const shape = new THREE.Shape([
    new THREE.Vector2(-width / 2, 0),
    new THREE.Vector2(width / 2, 0),
    new THREE.Vector2(apex, height),
  ])
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false })
  geometry.translate(0, 0, -length / 2)
  return geometry
}

function radialTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.22, 'rgba(255,255,255,0.5)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(canvas)
}

function halo(parent, at, size, color, opacity = 0.6) {
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: radialTexture(),
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
    })
  )
  sprite.position.copy(at)
  sprite.scale.setScalar(size)
  parent.add(sprite)
  return sprite
}

/* -------------------------------------------------------------- shaders */

const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`

/** Additive light shaft. Brightest at the base (uv.y = 0), or at the apex when `fromApex`. */
function beamMaterial(color, strength = 1, falloff = 2.2, fromApex = false) {
  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      strength: { value: strength },
      falloff: { value: falloff },
      fromApex: { value: fromApex ? 1 : 0 },
    },
    vertexShader: QUAD_VERT,
    fragmentShader: /* glsl */ `
      uniform vec3 color; uniform float strength; uniform float falloff; uniform float fromApex;
      varying vec2 vUv;
      void main() {
        float t = clamp(mix(1.0 - vUv.y, vUv.y, fromApex), 0.0, 1.0);
        gl_FragColor = vec4(color * 1.6, pow(t, falloff) * strength);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

/** The storm wall: streaked, fading upwards, with a hot line where it meets the ground. */
function stormMaterial(color) {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(color) } },
    vertexShader: QUAD_VERT,
    fragmentShader: /* glsl */ `
      uniform vec3 color; varying vec2 vUv;
      void main() {
        float ends = smoothstep(0.0, 0.14, vUv.x) * smoothstep(1.0, 0.86, vUv.x);
        float streak = 0.5 + 0.5 * sin(vUv.x * 260.0 + sin(vUv.y * 7.0 + vUv.x * 50.0) * 2.4);
        float up = clamp(1.0 - vUv.y, 0.0, 1.0);
        float body = pow(up, 1.3);
        float base = pow(up, 16.0);
        float a = ends * (body * (0.1 + 0.2 * streak) + base * 0.9);
        gl_FragColor = vec4(color * 1.1, a);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

function waterfallMaterial() {
  return new THREE.ShaderMaterial({
    vertexShader: QUAD_VERT,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        float streak = 0.5 + 0.5 * sin(vUv.x * 40.0 + sin(vUv.y * 16.0) * 1.6);
        float edges = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
        float fade = smoothstep(0.0, 0.6, vUv.y);
        vec3 c = mix(vec3(0.22, 0.72, 0.95), vec3(0.95, 1.0, 1.0), streak * 0.6 + 0.2);
        gl_FragColor = vec4(c * 1.15, (0.7 + 0.3 * streak) * edges * fade);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  })
}

/**
 * Zeroes NaN/Inf pixels before bloom. Flat shading can yield a NaN normal on
 * a sliver of a triangle, and bloom's blur would smear one such pixel across
 * the whole frame.
 */
const SANITIZE = {
  uniforms: { tDiffuse: { value: null } },
  vertexShader: QUAD_VERT,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      if (any(isnan(c)) || any(isinf(c))) c = vec4(0.0, 0.0, 0.0, 1.0);
      gl_FragColor = vec4(clamp(c.rgb, 0.0, 48.0), c.a);
    }`,
}

const VIGNETTE = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.3 } },
  vertexShader: QUAD_VERT,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      float d = length((vUv - 0.5) * vec2(1.0, 0.8));
      c.rgb *= mix(1.0 - amount, 1.0, smoothstep(0.78, 0.2, d));
      gl_FragColor = c;
    }`,
}

/* ---------------------------------------------------------- environment */

function skyDome(scene, { top, horizon, bottom, glowColor = '#ffffff', glowAmount = 0 }) {
  const material = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(top) },
      horizon: { value: new THREE.Color(horizon) },
      bottom: { value: new THREE.Color(bottom) },
      glowDir: { value: V(0, 1, 0) },
      glowColor: { value: new THREE.Color(glowColor) },
      glowAmount: { value: glowAmount },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom;
      uniform vec3 glowDir; uniform vec3 glowColor; uniform float glowAmount;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        vec3 c = d.y > 0.0 ? mix(horizon, top, pow(max(d.y, 0.0), 0.6)) : mix(horizon, bottom, pow(max(-d.y, 0.0), 0.5));
        float s = max(dot(d, normalize(glowDir)), 0.0);
        c += glowColor * glowAmount * (pow(s, 5.0) * 0.45 + pow(s, 40.0) * 0.7);
        gl_FragColor = vec4(c, 1.0);
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  })
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(900, 64, 32), material)
  mesh.renderOrder = -10
  mesh.frustumCulled = false
  scene.add(mesh)
  return material
}

/** Places the sky's glow relative to the camera, so it always lands in frame. */
function aimGlow(sky, camera, { right = 0, up = 0 }) {
  const fwd = V()
  camera.getWorldDirection(fwd)
  const side = V().crossVectors(fwd, camera.up).normalize()
  const lift = V().crossVectors(side, fwd).normalize()
  sky.uniforms.glowDir.value.copy(fwd).addScaledVector(side, right).addScaledVector(lift, up).normalize()
}

function sun(scene, { dir, color = '#ffffff', intensity = 3, hemi, size = 12, map = 4096, target = V() }) {
  scene.add(new THREE.HemisphereLight(...hemi))
  const light = new THREE.DirectionalLight(color, intensity)
  light.position.copy(target).addScaledVector(dir.clone().normalize(), 80)
  light.target.position.copy(target)
  light.castShadow = true
  Object.assign(light.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 1, far: 200 })
  light.shadow.mapSize.set(map, map)
  light.shadow.bias = -0.0003
  light.shadow.normalBias = 0.04
  light.shadow.radius = 3
  scene.add(light, light.target)
  return light
}

function cloud(parent, r, at, s = 1, color = '#ffffff', emissive = 0.08) {
  const g = group(parent, at, r() * TAU)
  const material = std(color, { roughness: 1, emissive: color, emissiveIntensity: emissive })
  const puffs = 6 + Math.floor(r() * 4)
  for (let i = 0; i < puffs; i++) {
    const u = (i / (puffs - 1)) * 2 - 1
    const k = (0.5 + (1 - Math.abs(u)) * 0.55 + r() * 0.25) * s
    add(g, new THREE.IcosahedronGeometry(k, 1), material, {
      at: [u * 1.9 * s, ((1 - Math.abs(u)) * 0.35 + (r() - 0.5) * 0.15) * s, (r() - 0.5) * 0.7 * s],
      scale: [1, 0.82, 0.9],
      cast: false,
      receive: false,
    })
  }
  return g
}

/** A floor of cloud far below the islands; the fog fades it into the sky. */
function cloudSea(parent, r, { y = -38, count = 150, inner = 22, outer = 150, color = '#ffffff', emissive = 0.1, arc = null } = {}) {
  const mesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(1, 1),
    std('#ffffff', { roughness: 1, emissive: color, emissiveIntensity: emissive }),
    count
  )
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = V()
  const p = V()
  const tint = new THREE.Color(color)
  const white = new THREE.Color('#ffffff')
  for (let i = 0; i < count; i++) {
    const t = arc ? arc[0] + (r() - 0.5) * 2 * arc[1] : r() * TAU
    const rad = inner + Math.sqrt(r()) * (outer - inner)
    const k = 3.5 + r() * 5.5
    p.set(Math.sin(t) * rad, y + (r() - 0.5) * 2.4, Math.cos(t) * rad)
    s.set(k * (1 + r() * 0.7), k * 0.5, k)
    q.setFromAxisAngle(UP, r() * TAU)
    mesh.setMatrixAt(i, m.compose(p, q, s))
    mesh.setColorAt(i, tint.clone().lerp(white, r() * 0.25))
  }
  mesh.castShadow = false
  mesh.receiveShadow = false
  parent.add(mesh)
}

function stars(parent, r, count, { size = 2.4, opacity = 0.9, minY = -1 } = {}) {
  const positions = []
  for (let i = 0; i < count; i++) {
    const y = minY + (1 - minY) * r()
    const t = r() * TAU
    const rr = Math.sqrt(1 - y * y)
    positions.push(Math.cos(t) * rr * 800, y * 800, Math.sin(t) * rr * 800)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const points = new THREE.Points(
    g,
    new THREE.PointsMaterial({
      color: '#ffffff',
      size,
      sizeAttenuation: false,
      map: radialTexture(),
      transparent: true,
      opacity,
      fog: false,
      depthWrite: false,
    })
  )
  points.renderOrder = -9
  parent.add(points)
}

/* ------------------------------------------------------------- terrain */

/**
 * A floating island: a flat top painted by `top(fraction, angle, r)` above a
 * rugged, tapering underside of earth and rock `bands`. `edge(angle)` is the
 * outline radius and `at(angle, radius, y)` a point in the same polar frame,
 * so props can be placed relative to the rim.
 */
function floatingIsland(r, { radius, sides = 40, depth = 6.4, top, bands }) {
  const ph = [r() * TAU, r() * TAU, r() * TAU]
  const wob = (t) => 0.05 * Math.sin(3 * t + ph[0]) + 0.035 * Math.sin(5 * t + ph[1]) + 0.02 * Math.sin(9 * t + ph[2])
  const jag = Array.from({ length: sides }, () => (r() - 0.5) * 0.04)
  const edge = (t) => radius * (1 + wob(t))
  const at = (t, rad, y = 0) => V(Math.sin(t) * rad, y, Math.cos(t) * rad)
  const ang = (i) => (i / sides) * TAU

  const fractions = [0.3, 0.55, 0.75, 0.9, 1]
  const topRings = fractions.map((f, k) =>
    Array.from({ length: sides }, (_, i) => {
      const rim = k === fractions.length - 1
      const rad = edge(ang(i)) * (1 + jag[i] * (rim ? 1 : 0.4)) * f
      return at(ang(i), rad, f > 0.7 ? (r() - 0.5) * 0.05 : 0)
    })
  )

  const S = depth / 6.4
  // [y, radius factor, noise]; the first two rings are the overhanging grass lip.
  const spec = [
    [-0.22, 1.02, 0.01],
    [-0.46, 0.985, 0.02],
    [-1.3, 0.9, 0.05],
    [-2.4, 0.74, 0.07],
    [-3.5, 0.55, 0.08],
    [-4.6, 0.34, 0.09],
    [-5.6, 0.15, 0.08],
  ]
  const sideRings = [topRings[topRings.length - 1]].concat(
    spec.map(([y, f, n], k) =>
      Array.from({ length: sides }, (_, i) => {
        const drip = k === 1 && i % 2 ? -0.16 : 0
        const rad = edge(ang(i)) * (1 + jag[i]) * f * (1 + (r() - 0.5) * 2 * n)
        const yy = k < 2 ? y + drip : y * S + (r() - 0.5) * 0.25 * S
        return at(ang(i), rad, yy)
      })
    )
  )
  const apex = V((r() - 0.5) * 0.5, -depth, (r() - 0.5) * 0.5)

  const pos = []
  const col = []
  const ab = V()
  const ac = V()
  const tri = (a, b, c, color, up) => {
    const n = ab.subVectors(b, a).cross(ac.subVectors(c, a))
    const cx = (a.x + b.x + c.x) / 3
    const cz = (a.z + b.z + c.z) / 3
    const flip = up ? n.y < 0 : n.x * cx + n.z * cz < 0
    for (const p of flip ? [a, c, b] : [a, b, c]) {
      pos.push(p.x, p.y, p.z)
      col.push(color.r, color.g, color.b)
    }
  }
  const topColor = (a, b, c) => {
    const cx = (a.x + b.x + c.x) / 3
    const cz = (a.z + b.z + c.z) / 3
    const t = Math.atan2(cx, cz)
    return top(Math.hypot(cx, cz) / edge(t), t, r)
  }

  const centre = V()
  for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides
    tri(centre, topRings[0][i], topRings[0][j], topColor(centre, topRings[0][i], topRings[0][j]), true)
    for (let k = 0; k < topRings.length - 1; k++) {
      const [a, b, c, d] = [topRings[k][i], topRings[k + 1][i], topRings[k + 1][j], topRings[k][j]]
      tri(a, b, c, topColor(a, b, c), true)
      tri(a, c, d, topColor(a, c, d), true)
    }
    for (let k = 0; k < sideRings.length - 1; k++) {
      const [a, b, c, d] = [sideRings[k][i], sideRings[k + 1][i], sideRings[k + 1][j], sideRings[k][j]]
      const band = bands[Math.min(k, bands.length - 2)]
      tri(a, b, c, vary(band, r, 0.07), false)
      tri(a, c, d, vary(band, r, 0.07), false)
    }
    const last = sideRings[sideRings.length - 1]
    tri(last[i], apex, last[j], vary(bands[bands.length - 1], r, 0.07), false)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  geometry.computeVertexNormals()
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })
  )
  mesh.castShadow = true
  mesh.receiveShadow = true
  return { mesh, edge, at }
}

/** Random points on an island's top, `min`–`max` of the way to the rim. */
function scatter(r, island, count, { min = 0.2, max = 0.95, spacing = 0.6, avoid = () => false, tries = 8000 } = {}) {
  const pts = []
  for (let n = 0; n < tries && pts.length < count; n++) {
    const t = r() * TAU
    const rad = island.edge(t) * Math.sqrt(min * min + r() * (max * max - min * min))
    const x = Math.sin(t) * rad
    const z = Math.cos(t) * rad
    if (avoid(x, z)) continue
    if (pts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < spacing * spacing)) continue
    pts.push({ x, z, t })
  }
  return pts
}

/* --------------------------------------------------------------- props */

const PINE = { trunk: '#6d4c33', leaves: ['#2f7d4f', '#37905a', '#43a066'] }

function pine(parent, r, at, s = 1, palette = PINE) {
  const g = group(parent, at, r() * TAU)
  add(g, new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.5 * s, 6), std(palette.trunk), { at: [0, 0.25 * s, 0] })
  for (let t = 0; t < 3; t++) {
    const rad = (0.62 - t * 0.15) * s
    const h = (0.9 - t * 0.12) * s
    add(g, new THREE.ConeGeometry(rad, h, 7), std(vary(palette.leaves[t], r, 0.04)), {
      at: [0, (0.42 + t * 0.42) * s + h / 2, 0],
      rot: [0, r() * TAU, 0],
    })
  }
  return g
}

function leafGeometry(length, width, droop, segments = 6) {
  const pos = []
  const pt = (t, side) =>
    V(t * length, -droop * t * t + (side === 0 ? 0.05 * Math.sin(Math.PI * t) : 0), side * width * Math.sin(Math.PI * Math.min(1, t * 1.1)))
  for (let s = 0; s < segments; s++) {
    const t0 = s / segments
    const t1 = (s + 1) / segments
    for (const side of [-1, 1]) {
      const [a, b, c, d] = [pt(t0, 0), pt(t1, 0), pt(t0, side), pt(t1, side)]
      pos.push(a.x, a.y, a.z, c.x, c.y, c.z, b.x, b.y, b.z, b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.computeVertexNormals()
  return g
}

function palm(parent, r, at, s = 1) {
  const g = group(parent, at, r() * TAU)
  const bark = [std('#9b7450'), std('#86623f')]
  const lean = 0.35 + r() * 0.4
  let prev = V()
  for (let i = 1; i <= 7; i++) {
    const t = i / 7
    const next = V(lean * t * t * 1.3 * s, i * 0.34 * s, 0)
    rod(g, prev, next, (0.11 - 0.045 * t) * s, bark[i % 2])
    prev = next
  }
  const leaves = ['#3f9f45', '#4db352', '#2f8a3c'].map((c) => std(c, { side: THREE.DoubleSide }))
  for (let k = 0; k < 7; k++) {
    const leaf = new THREE.Mesh(leafGeometry((1.15 + r() * 0.35) * s, 0.2 * s, (0.55 + r() * 0.25) * s), leaves[k % 3])
    leaf.position.copy(prev)
    leaf.rotation.set(0, (k / 7) * TAU + r() * 0.4, (r() - 0.3) * 0.25)
    leaf.castShadow = true
    leaf.receiveShadow = true
    g.add(leaf)
  }
  for (let k = 0; k < 3; k++)
    add(g, new THREE.IcosahedronGeometry(0.075 * s, 0), std('#6b4a2b'), {
      at: [prev.x + Math.sin(k * 2.1) * 0.1 * s, prev.y - 0.09 * s, prev.z + Math.cos(k * 2.1) * 0.1 * s],
    })
  return g
}

function roundTree(parent, r, at, s = 1, colors = ['#5fae4b', '#6cbf55', '#529e42']) {
  const g = group(parent, at)
  add(g, new THREE.CylinderGeometry(0.07 * s, 0.1 * s, 0.75 * s, 6), std('#7a5537'), { at: [0, 0.37 * s, 0] })
  add(g, jitter(new THREE.IcosahedronGeometry(0.52 * s, 0), 0.14 * s, r), std(vary(r.pick(colors), r)), { at: [0, 1.0 * s, 0] })
  add(g, jitter(new THREE.IcosahedronGeometry(0.36 * s, 0), 0.1 * s, r), std(vary(r.pick(colors), r)), {
    at: [0.26 * s, 1.3 * s, 0.1 * s],
  })
  return g
}

function bush(parent, r, at, s = 1, colors = ['#4f9f45', '#5cb34f']) {
  return add(parent, jitter(new THREE.IcosahedronGeometry(0.42 * s, 0), 0.12 * s, r), std(vary(r.pick(colors), r)), {
    at: [at[0], at[1] + 0.26 * s, at[2]],
    scale: [1, 0.78, 1],
  })
}

function rock(parent, r, at, s = 1, color = '#8b847e') {
  return add(parent, jitter(new THREE.IcosahedronGeometry(0.3 * s, 0), 0.14 * s, r), std(vary(color, r, 0.05)), {
    at: [at[0], at[1] + 0.08 * s, at[2]],
    rot: [r(), r() * TAU, r()],
    scale: [1, 0.7, 1],
  })
}

function tufts(parent, r, island, count, colors, opts = {}) {
  const geometry = new THREE.ConeGeometry(0.055, 0.3, 3)
  geometry.translate(0, 0.15, 0)
  const pts = scatter(r, island, count, { spacing: 0.25, ...opts })
  const mesh = new THREE.InstancedMesh(geometry, std('#ffffff', { roughness: 1 }), pts.length * 3)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const s = V()
  const p = V()
  let n = 0
  for (const pt of pts)
    for (let k = 0; k < 3; k++) {
      p.set(pt.x + (r() - 0.5) * 0.16, 0, pt.z + (r() - 0.5) * 0.16)
      q.setFromEuler(e.set((r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5))
      const k2 = 0.7 + r() * 0.6
      s.set(k2, k2 * (0.8 + r() * 0.5), k2)
      mesh.setMatrixAt(n, m.compose(p, q, s))
      mesh.setColorAt(n++, vary(r.pick(colors), r, 0.06))
    }
  mesh.castShadow = false
  parent.add(mesh)
}

function flowers(parent, r, island, count, colors, opts = {}) {
  const pts = scatter(r, island, count, { spacing: 0.16, ...opts })
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 0), std('#ffffff', { roughness: 0.8 }), pts.length)
  const m = new THREE.Matrix4()
  pts.forEach((pt, i) => {
    mesh.setMatrixAt(i, m.makeTranslation(pt.x, 0.08 + r() * 0.06, pt.z))
    mesh.setColorAt(i, new THREE.Color(r.pick(colors)))
  })
  mesh.castShadow = false
  parent.add(mesh)
}

/** A small floating rock with something on top. */
function islet(parent, r, at, s, palette, dressing) {
  const g = group(parent, at, r() * TAU)
  g.scale.setScalar(s)
  const island = floatingIsland(r, {
    radius: 1,
    sides: 12,
    depth: 1.8,
    top: (f, t, rr) => vary(rr.pick(palette.grass), rr, 0.05),
    bands: palette.bands,
  })
  g.add(island.mesh)
  dressing?.(g, r)
  return g
}

function coin(parent, at, s = 1, rotY = 0, tilt = 0) {
  const g = group(parent, at, rotY)
  g.rotation.x = tilt
  add(g, new THREE.CylinderGeometry(0.24 * s, 0.24 * s, 0.07 * s, 24), gold(), { rot: [Math.PI / 2, 0, 0] })
  const rim = std('#e6a817', { metalness: 0.7, roughness: 0.3, emissive: '#8a5a00', emissiveIntensity: 0.4 })
  add(g, new THREE.TorusGeometry(0.17 * s, 0.022 * s, 6, 24), rim, { at: [0, 0, 0.036 * s] })
  add(g, new THREE.TorusGeometry(0.17 * s, 0.022 * s, 6, 24), rim, { at: [0, 0, -0.036 * s] })
  return g
}

/* ------------------------------------------------ Tidebreak: box-fight arena */

const BLUE = '#3d9bff'
const ORANGE = '#ff7a2e'
const STORM = '#b15cff'
const SAND = ['#f2dfab', '#ebd49c', '#f6e7bd']
const GRASS = ['#6cc24a', '#62b845', '#75c955', '#5fb141']
const TUFT = ['#4fa83a', '#5cb947', '#459a33']
const EARTH = ['#a8774c', '#8e603e', '#775036', '#80766e', '#675f58', '#524b46']

function glass(color) {
  return new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    roughness: 0.1,
    emissive: color,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
}

/** A build wall: a glowing frame around a translucent pane. */
function wall(parent, team, { at, rotY = 0, w = 1.6, h = 1.45 }) {
  const g = group(parent, at, rotY)
  const t = 0.07
  const bar = glow(team, 5)
  add(g, new THREE.BoxGeometry(w - 0.08, h - 0.08, 0.035), glass(team), { at: [0, h / 2, 0], cast: false })
  add(g, new THREE.BoxGeometry(w, t, t), bar, { at: [0, t / 2, 0] })
  add(g, new THREE.BoxGeometry(w, t, t), bar, { at: [0, h - t / 2, 0] })
  add(g, new THREE.BoxGeometry(t, h, t), bar, { at: [-w / 2 + t / 2, h / 2, 0] })
  add(g, new THREE.BoxGeometry(t, h, t), bar, { at: [w / 2 - t / 2, h / 2, 0] })
  add(g, new THREE.BoxGeometry(w - t, 0.035, 0.04), bar, { at: [0, h / 2, 0] })
  return g
}

function floorPiece(parent, team, { at, w = 1.6 }) {
  const g = group(parent, at)
  const t = 0.07
  const bar = glow(team, 5)
  add(g, new THREE.BoxGeometry(w - 0.08, 0.035, w - 0.08), glass(team), { cast: false })
  for (const [x, z, sx, sz] of [
    [0, w / 2 - t / 2, w, t],
    [0, -w / 2 + t / 2, w, t],
    [w / 2 - t / 2, 0, t, w],
    [-w / 2 + t / 2, 0, t, w],
  ])
    add(g, new THREE.BoxGeometry(sx, t, sz), bar, { at: [x, 0, z] })
  return g
}

/** A ramp rising towards local -z across one build cell. */
function ramp(parent, team, { at, rotY = 0, w = 1.6, h = 1.45 }) {
  const g = group(parent, at, rotY)
  const len = Math.hypot(w, h)
  const t = 0.07
  const bar = glow(team, 5)
  const slab = group(g, [0, h / 2, 0])
  slab.rotation.x = Math.atan2(h, w)
  add(slab, new THREE.BoxGeometry(w - 0.08, 0.035, len), glass(team), { cast: false })
  add(slab, new THREE.BoxGeometry(t, t, len), bar, { at: [w / 2 - t / 2, 0, 0] })
  add(slab, new THREE.BoxGeometry(t, t, len), bar, { at: [-w / 2 + t / 2, 0, 0] })
  for (let i = 1; i < 4; i++)
    add(slab, new THREE.BoxGeometry(w - t, 0.03, 0.03), bar, { at: [0, 0.01, -len / 2 + (i * len) / 4] })
  return g
}

function buildBox(parent, team, [cx, y, cz], { open = [], roof = true, withRamp = true, rampRot = 0 } = {}) {
  const s = 1.6
  const h = 1.45
  const sides = {
    north: [cx, cz - s / 2, 0],
    south: [cx, cz + s / 2, 0],
    east: [cx + s / 2, cz, Math.PI / 2],
    west: [cx - s / 2, cz, Math.PI / 2],
  }
  for (const [side, [x, z, ry]] of Object.entries(sides))
    if (!open.includes(side)) wall(parent, team, { at: [x, y, z], rotY: ry, w: s, h })
  if (roof) floorPiece(parent, team, { at: [cx, y + h, cz], w: s })
  if (withRamp) ramp(parent, team, { at: [cx, y, cz], rotY: rampRot, w: s * 0.92, h })
}

function spawnPad(parent, color, [x, y, z]) {
  add(parent, new THREE.CylinderGeometry(0.62, 0.7, 0.12, 24), std('#1d2838', { flatShading: false, roughness: 0.5 }), {
    at: [x, y + 0.06, z],
  })
  add(parent, new THREE.TorusGeometry(0.53, 0.05, 8, 48), glow(color, 8), {
    at: [x, y + 0.13, z],
    rot: [-Math.PI / 2, 0, 0],
    cast: false,
  })
  add(parent, new THREE.CircleGeometry(0.46, 40), glow(color, 1.2, { transparent: true, opacity: 0.7 }), {
    at: [x, y + 0.125, z],
    rot: [-Math.PI / 2, 0, 0],
    cast: false,
  })
  add(parent, new THREE.CylinderGeometry(0.5, 0.5, 3.4, 40, 1, true), beamMaterial(color, 0.75, 2.4), {
    at: [x, y + 1.82, z],
    cast: false,
    receive: false,
  })
}

function arenaFloor(parent) {
  add(parent, new THREE.BoxGeometry(7.7, 0.32, 7.7), std('#33425a', { roughness: 0.7 }), { at: [0, 0.16, 0] })
  const trim = glow('#8fe9ff', 5)
  for (const [x, z, w, d] of [
    [0, 3.86, 7.72, 0.06],
    [0, -3.86, 7.72, 0.06],
    [3.86, 0, 0.06, 7.72],
    [-3.86, 0, 0.06, 7.72],
  ])
    add(parent, new THREE.BoxGeometry(w, 0.05, d), trim, { at: [x, 0.3, z], cast: false })

  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.76, 0.08, 0.76), std('#ffffff', { roughness: 0.55 }), 81)
  const m = new THREE.Matrix4()
  let n = 0
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++) {
      const x = -3.2 + i * 0.8
      const z = -3.2 + j * 0.8
      tiles.setMatrixAt(n, m.makeTranslation(x, 0.36, z))
      const odd = (i + j) % 2
      const color =
        j < 4 ? (odd ? '#dfeaf8' : '#c9dbf1') : j > 4 ? (odd ? '#f9e9dd' : '#f2d8c6') : '#ffffff'
      tiles.setColorAt(n++, new THREE.Color(color))
    }
  tiles.castShadow = false
  tiles.receiveShadow = true
  parent.add(tiles)
}

/** A floating, text-free scoreboard: team blocks and round pips. */
function scoreboard(parent, at) {
  const g = group(parent, at)
  const flat = { cast: false, receive: false }
  add(
    g,
    new THREE.PlaneGeometry(3.0, 0.95),
    new THREE.MeshBasicMaterial({ color: '#0d1b33', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }),
    flat
  )
  const edge = glow('#9fe8ff', 3)
  for (const [x, y, w, h] of [
    [0, 0.475, 3.0, 0.035],
    [0, -0.475, 3.0, 0.035],
    [-1.5, 0, 0.035, 0.95],
    [1.5, 0, 0.035, 0.95],
  ])
    add(g, new THREE.PlaneGeometry(w, h), edge, { ...flat, at: [x, y, 0.005] })
  add(g, new THREE.PlaneGeometry(0.95, 0.46), glow(BLUE, 2.4), { ...flat, at: [-0.82, 0.08, 0.01] })
  add(g, new THREE.PlaneGeometry(0.95, 0.46), glow(ORANGE, 2.4), { ...flat, at: [0.82, 0.08, 0.01] })
  add(g, new THREE.PlaneGeometry(0.04, 0.46), glow('#ffffff', 2), { ...flat, at: [0, 0.08, 0.01] })
  for (let i = 0; i < 5; i++) {
    const color = i < 3 ? BLUE : i < 4 ? ORANGE : '#4d5a6e'
    add(g, new THREE.CircleGeometry(0.065, 20), glow(color, i < 4 ? 3 : 0.8), { ...flat, at: [-0.44 + i * 0.22, -0.3, 0.01] })
  }
  return g
}

function waterfall(parent, r, island, theta) {
  const rim = island.edge(theta)
  const water = std('#35c4e6', {
    roughness: 0.08,
    metalness: 0.1,
    emissive: '#0d7fa3',
    emissiveIntensity: 0.35,
    flatShading: false,
  })
  const pool = island.at(theta, rim * 0.72, 0)
  add(parent, new THREE.CircleGeometry(0.95, 24), water, { at: [pool.x, 0.04, pool.z], rot: [-Math.PI / 2, 0, 0], cast: false })
  for (let i = 0; i < 11; i++) {
    const t = (i / 11) * TAU
    if (angleDiff(t, theta) < 0.5) continue // leave the outflow open
    rock(parent, r, [pool.x + Math.sin(t) * 1.05, 0, pool.z + Math.cos(t) * 1.05], 0.45 + r() * 0.3)
  }
  const from = rim * 0.72 + 0.8
  const to = rim * 1.02
  const mid = island.at(theta, (from + to) / 2, 0)
  add(parent, new THREE.BoxGeometry(0.75, 0.03, to - from), water, { at: [mid.x, 0.05, mid.z], rot: [0, theta, 0], cast: false })
  const lip = island.at(theta, rim * 1.06, 0)
  add(parent, new THREE.CylinderGeometry(0.42, 0.3, 6.4, 24, 1, true), waterfallMaterial(), {
    at: [lip.x, -3.15, lip.z],
    rot: [0, theta + Math.PI, 0],
    scale: [1.5, 1, 0.75],
    cast: false,
    receive: false,
  })
  add(parent, new THREE.TorusGeometry(0.42, 0.09, 6, 16, Math.PI), std('#ffffff', { roughness: 0.6, emissive: '#ffffff', emissiveIntensity: 0.2 }), {
    at: [lip.x, 0.02, lip.z],
    rot: [0, theta + Math.PI / 2, 0],
    scale: [1.5, 1, 1],
    cast: false,
  })
  const mist = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, roughness: 1, flatShading: true, depthWrite: false })
  for (let i = 0; i < 5; i++)
    add(parent, new THREE.IcosahedronGeometry(0.35 + r() * 0.35, 1), mist, {
      at: [lip.x + (r() - 0.5) * 0.9, -6.4 + r() * 0.5, lip.z + (r() - 0.5) * 0.9],
      cast: false,
    })
  return { theta, pool }
}

function tidebreak(root, r, { camTheta = Math.atan2(15.5, 17) } = {}) {
  const island = floatingIsland(r, {
    radius: 8,
    sides: 48,
    depth: 6.4,
    top: (f, t, rr) => (f > 0.8 + 0.03 * Math.sin(t * 5 + 1) ? vary(rr.pick(SAND), rr, 0.04) : vary(rr.pick(GRASS), rr, 0.05)),
    bands: ['#e5cd92', '#d6ba80', ...EARTH],
  })
  root.add(island.mesh)

  arenaFloor(root)
  const Y = 0.4
  buildBox(root, BLUE, [-1.6, Y, -1.6], { open: ['south'] })
  buildBox(root, ORANGE, [1.6, Y, 1.6], { open: ['north', 'west'], withRamp: false })
  wall(root, BLUE, { at: [-3.0, Y, 0.9], rotY: Math.PI / 2 })
  ramp(root, ORANGE, { at: [2.3, Y, -1.8], rotY: Math.PI / 2 })
  spawnPad(root, BLUE, [2.95, Y, -2.95])
  spawnPad(root, ORANGE, [-2.95, Y, 2.95])

  // The storm: an arc of wall behind the arena, and its ring on the ground.
  const back = camTheta + Math.PI
  add(root, new THREE.CylinderGeometry(6.9, 6.9, 3.4, 180, 1, true, back - 2.1, 4.2), stormMaterial(STORM), {
    at: [0, 1.7, 0],
    cast: false,
    receive: false,
  })
  add(root, new THREE.TorusGeometry(6.9, 0.05, 6, 240), glow(STORM, 2.6), { at: [0, 0.06, 0], rot: [-Math.PI / 2, 0, 0], cast: false })

  const fall = waterfall(root, r, island, 1.3)
  const avoid = (x, z) =>
    Math.max(Math.abs(x), Math.abs(z)) < 4.4 ||
    Math.hypot(x - fall.pool.x, z - fall.pool.z) < 1.5 ||
    angleDiff(Math.atan2(x, z), fall.theta) < 0.12
  for (const p of scatter(r, island, 10, { min: 0.87, max: 0.95, spacing: 1.5, avoid }))
    palm(root, r, [p.x, 0, p.z], 0.62 + r() * 0.22)
  for (const p of scatter(r, island, 12, { min: 0.55, max: 0.96, spacing: 0.9, avoid }))
    rock(root, r, [p.x, 0, p.z], 0.6 + r() * 0.9)
  tufts(root, r, island, 60, TUFT, { min: 0.58, max: 0.8, avoid })

  const board = scoreboard(root, [-0.6, 4.4, -2.6])
  return { island, billboards: [board] }
}

/* ------------------------------------------------ Nightjar: co-op survival */

const NIGHT = {
  grass: ['#2d5c4d', '#295547', '#326557', '#264b40'],
  pine: { trunk: '#3b2c24', leaves: ['#1b473b', '#205344', '#275f4f'] },
  bands: ['#244a3f', '#1f4238', '#4c3b37', '#40322e', '#352926', '#3c3e4c', '#31333f', '#272934'],
  stone: '#4b5166',
  sandbag: '#6a6250',
  canvas: '#56684f',
  wood: '#5b4332',
  woodDark: '#3f2f25',
  roof: '#3a2e3f',
}
const NIGHT_DAYLIT = {
  grass: ['#5fa653', '#58a04d', '#67b05a', '#51964a'],
  pine: PINE,
  bands: ['#4c9a3c', '#448d36', ...EARTH],
  stone: '#8e93a3',
  sandbag: '#b3a37f',
  canvas: '#7d9463',
  wood: '#7a5a42',
  woodDark: '#5d4533',
  roof: '#8a4f3f',
}

function tent(parent, at, rotY, color) {
  const g = group(parent, at, rotY)
  add(g, prism(1.1, 0.78, 1.25), std(color))
  const door = new THREE.Shape([new THREE.Vector2(-0.22, 0), new THREE.Vector2(0.22, 0), new THREE.Vector2(0, 0.46)])
  add(g, new THREE.ShapeGeometry(door), std('#15161c'), { at: [0, 0.001, 0.63], cast: false })
  return g
}

function campfire(parent, r, at) {
  const g = group(parent, at)
  const apex = V(0, 0.42, 0)
  const log = std('#4a3223')
  for (let i = 0; i < 6; i++) {
    const t = (i / 6) * TAU
    rod(g, V(Math.sin(t) * 0.34, 0.02, Math.cos(t) * 0.34), apex, 0.045, log, { seg: 5 })
  }
  for (let i = 0; i < 9; i++) {
    const t = (i / 9) * TAU
    rock(g, r, [Math.sin(t) * 0.52, 0, Math.cos(t) * 0.52], 0.32, '#5d6070')
  }
  add(g, new THREE.ConeGeometry(0.24, 0.62, 6), glow('#ff6a1a', 5), { at: [0, 0.33, 0], cast: false })
  add(g, new THREE.ConeGeometry(0.13, 0.42, 5), glow('#ffd166', 6), { at: [0, 0.26, 0], cast: false })
  const light = new THREE.PointLight('#ff8c3a', 16, 9, 1.6)
  light.position.set(0, 0.8, 0)
  g.add(light)
}

function shade(parent, [x, y, z], s = 1) {
  const g = group(parent, [x, y, z], Math.atan2(-x, -z))
  add(g, new THREE.CapsuleGeometry(0.2 * s, 0.42 * s, 4, 10), std('#10121b', { roughness: 1, flatShading: false }), { at: [0, 0.42 * s, 0] })
  for (const sx of [-1, 1])
    add(g, new THREE.SphereGeometry(0.035 * s, 8, 6), glow('#ff5470', 8), { at: [sx * 0.075 * s, 0.63 * s, 0.17 * s], cast: false })
}

function watchtower(parent, P, [x, z], aimAt, { night }) {
  const g = group(parent, [x, 0, z])
  const H = 3.1
  const wood = std(P.wood)
  const dark = std(P.woodDark)
  const corners = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ]
  for (const [sx, sz] of corners) rod(g, V(sx * 0.62, 0, sz * 0.62), V(sx * 0.44, H, sz * 0.44), 0.065, wood)
  rod(g, V(0.62, 0.3, 0.62), V(-0.5, H * 0.6, 0.5), 0.03, dark)
  rod(g, V(-0.62, 0.3, 0.62), V(0.5, H * 0.6, 0.5), 0.03, dark)
  rod(g, V(0.62, 0.3, -0.62), V(0.5, H * 0.6, 0.5), 0.03, dark)
  add(g, new THREE.BoxGeometry(1.3, 0.1, 1.3), dark, { at: [0, H, 0] })
  for (const [sx, sz] of corners) rod(g, V(sx * 0.6, H, sz * 0.6), V(sx * 0.6, H + 1.1, sz * 0.6), 0.045, wood)
  for (const [a, b] of [
    [V(0.6, H + 0.45, 0.6), V(-0.6, H + 0.45, 0.6)],
    [V(0.6, H + 0.45, -0.6), V(-0.6, H + 0.45, -0.6)],
    [V(0.6, H + 0.45, 0.6), V(0.6, H + 0.45, -0.6)],
    [V(-0.6, H + 0.45, 0.6), V(-0.6, H + 0.45, -0.6)],
  ])
    rod(g, a, b, 0.035, wood)
  add(g, new THREE.ConeGeometry(1.08, 0.66, 4), std(P.roof), { at: [0, H + 1.43, 0], rot: [0, Math.PI / 4, 0] })

  const lampPos = V(x, H + 0.75, z)
  const dir = V().subVectors(aimAt, lampPos).normalize()
  const lamp = add(g, new THREE.CylinderGeometry(0.15, 0.22, 0.36, 14), std('#2a2d36', { metalness: 0.6, roughness: 0.4 }), {
    at: [0, H + 0.75, 0],
  })
  lamp.quaternion.setFromUnitVectors(UP, dir)
  add(g, new THREE.CircleGeometry(0.2, 20), glow('#fff4d0', night ? 7 : 2), {
    at: [dir.x * 0.19, H + 0.75 + dir.y * 0.19, dir.z * 0.19],
    cast: false,
  }).quaternion.setFromUnitVectors(V(0, 0, 1), dir)

  if (!night) return
  const spot = new THREE.SpotLight('#fff1c9', 70, 24, 0.3, 0.6, 1.3)
  spot.position.copy(lampPos)
  spot.target.position.copy(aimAt)
  spot.castShadow = true
  spot.shadow.mapSize.set(2048, 2048)
  spot.shadow.bias = -0.0005
  parent.add(spot, spot.target)
  const len = lampPos.distanceTo(aimAt) + 1
  const cone = new THREE.Mesh(new THREE.ConeGeometry(Math.tan(0.3) * len, len, 48, 1, true), beamMaterial('#fff0c2', 0.14, 2.0, true))
  cone.position.copy(lampPos).addScaledVector(dir, len / 2)
  cone.quaternion.setFromUnitVectors(UP, dir.clone().negate())
  cone.material.side = THREE.FrontSide
  parent.add(cone)
}

function nightjar(root, r, { night = true, camTheta = Math.atan2(-14.5, 17.5) } = {}) {
  const P = night ? NIGHT : NIGHT_DAYLIT
  const island = floatingIsland(r, {
    radius: 8,
    sides: 48,
    depth: 6.8,
    top: (f, t, rr) => vary(rr.pick(P.grass), rr, 0.04),
    bands: P.bands,
  })
  root.add(island.mesh)
  const back = camTheta + Math.PI
  const pathTheta = camTheta + 0.25

  // The squad's hold point: a paved clearing ringed by sandbags.
  add(root, new THREE.CylinderGeometry(2.55, 2.7, 0.1, 14), std(P.stone), { at: [0, 0.05, 0] })
  for (let layer = 0; layer < 2; layer++)
    for (let i = 0; i < 18; i++) {
      const t = ((i + layer * 0.5) / 18) * TAU
      if (angleDiff(t, pathTheta) < 0.42) continue
      const p = island.at(t, 2.85)
      add(root, new THREE.CapsuleGeometry(0.15, 0.5, 3, 8), std(vary(P.sandbag, r, 0.05)), {
        at: [p.x, 0.15 + layer * 0.24, p.z],
        rot: [0, t, Math.PI / 2],
      })
    }
  campfire(root, r, [0, 0.1, 0])
  for (const [t, d] of [
    [back + 0.9, 1.75],
    [back - 0.35, 1.85],
  ]) {
    const p = island.at(t, d)
    tent(root, [p.x, 0.1, p.z], Math.atan2(-p.x, -p.z), P.canvas)
  }
  const crateAt = island.at(camTheta + 1.2, 1.9)
  for (const [dx, dy, dz, s] of [
    [0, 0, 0, 0.42],
    [0.46, 0, 0.1, 0.36],
    [0.2, 0.42, 0.05, 0.34],
  ])
    add(root, new THREE.BoxGeometry(s, s, s), std('#8a6a45'), {
      at: [crateAt.x + dx, 0.1 + dy + s / 2, crateAt.z + dz],
      rot: [0, r() * 0.6, 0],
    })

  // The trail out of camp, with waypoint markers.
  const pathPts = []
  for (let d = 3.05; d < island.edge(pathTheta) - 0.35; d += 0.42) pathPts.push(island.at(pathTheta + 0.22 * Math.sin(d * 0.9), d))
  for (const p of pathPts)
    add(root, jitter(new THREE.CylinderGeometry(0.2, 0.22, 0.06, 6), 0.05, r), std(vary(P.stone, r, 0.05)), {
      at: [p.x + (r() - 0.5) * 0.1, 0.03, p.z + (r() - 0.5) * 0.1],
      rot: [0, r() * TAU, 0],
    })
  pathPts
    .filter((_, i) => i % 3 === 1)
    .forEach((p) => {
      add(root, new THREE.OctahedronGeometry(0.1), glow('#52e6ff', 5), { at: [p.x, 0.45, p.z], cast: false })
      add(root, new THREE.TorusGeometry(0.2, 0.018, 6, 24), glow('#52e6ff', 3), { at: [p.x, 0.07, p.z], rot: [-Math.PI / 2, 0, 0], cast: false })
    })

  // Spawn beacons the director wakes — and what comes out of them.
  const beacons = [back + 0.55, camTheta + 1.35, camTheta - 1.55].map((t) => island.at(t, island.edge(t) * 0.7))
  beacons.forEach((b) => {
    add(root, new THREE.CylinderGeometry(0.34, 0.42, 0.28, 7), std(P.stone), { at: [b.x, 0.14, b.z] })
    for (let k = 0; k < 3; k++)
      add(root, new THREE.OctahedronGeometry(0.2), glow('#ff3355', 4.5), {
        at: [b.x + (k - 1) * 0.15, 0.62 + (k % 2) * 0.1, b.z + ((k * 7) % 3 - 1) * 0.1],
        rot: [(k - 1) * 0.35, k, (k - 1) * 0.3],
        scale: [0.7, 2.2, 0.7],
        cast: false,
      })
    add(root, new THREE.TorusGeometry(0.72, 0.035, 6, 40), glow('#ff3355', 3), { at: [b.x, 0.04, b.z], rot: [-Math.PI / 2, 0, 0], cast: false })
    const light = new THREE.PointLight('#ff2d4d', 9, 5.5, 1.6)
    light.position.set(b.x, 1.0, b.z)
    root.add(light)
    const inward = V(-b.x, 0, -b.z).normalize()
    const side = V(inward.z, 0, -inward.x)
    for (const k of [-1, 1]) {
      const p = V(b.x, 0, b.z).addScaledVector(inward, 1.0).addScaledVector(side, k * 0.55)
      shade(root, [p.x, 0, p.z], 0.9 + r() * 0.3)
    }
  })

  const towerAt = island.at(back - 0.75, 3.95)
  const aim = V(beacons[2].x * 0.72, 0.2, beacons[2].z * 0.72)
  watchtower(root, P, [towerAt.x, towerAt.z], aim, { night })

  const nearPath = (x, z) => pathPts.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < 0.8 ** 2)
  const avoid = (x, z) =>
    Math.hypot(x, z) < 3.35 ||
    nearPath(x, z) ||
    Math.hypot(x - towerAt.x, z - towerAt.z) < 1.25 ||
    beacons.some((b) => Math.hypot(x - b.x, z - b.z) < 1.7)
  for (const p of scatter(r, island, 48, { min: 0.44, max: 0.95, spacing: 0.72, avoid }))
    pine(root, r, [p.x, 0, p.z], 0.85 + r() * 0.55, P.pine)
  for (const p of scatter(r, island, 8, { min: 0.45, max: 0.95, spacing: 0.9, avoid }))
    rock(root, r, [p.x, 0, p.z], 0.5 + r() * 0.7, night ? '#5a5e6e' : '#8b847e')

  if (night) {
    const fly = glow('#d8ff75', 5)
    for (let i = 0; i < 34; i++) {
      const t = r() * TAU
      const rad = 2.8 + r() * 4.6
      add(root, new THREE.SphereGeometry(0.022, 6, 4), fly, { at: [Math.sin(t) * rad, 0.4 + r() * 2.2, Math.cos(t) * rad], cast: false })
    }
  }
  return { island, billboards: [] }
}

/* ------------------------------------------------ Pinegrove: tycoon plots */

const WARM = {
  grass: ['#8dc257', '#84b94f', '#96ca60', '#7eb24a'],
  tuft: ['#6ea83f', '#7cb84a', '#5f9a36'],
  pine: { trunk: '#6b4a31', leaves: ['#2c7446', '#358651', '#43995d'] },
  bands: ['#74a847', '#699c40', '#a57443', '#8b5e38', '#734b2e', '#8c8072', '#73695e', '#5c544b'],
}

function hut(parent, r, at) {
  const g = group(parent, at, 0.2)
  add(g, new THREE.BoxGeometry(0.95, 0.72, 0.95), std('#f1e2c4'), { at: [0, 0.36, 0] })
  add(g, new THREE.ConeGeometry(0.86, 0.6, 4), std('#d9603f'), { at: [0, 1.02, 0], rot: [0, Math.PI / 4, 0] })
  add(g, new THREE.BoxGeometry(0.26, 0.42, 0.03), std('#6b4a31'), { at: [0, 0.21, 0.485] })
  rod(g, V(0.66, 0, 0.62), V(0.66, 1.15, 0.62), 0.02, std('#8a8f99'))
  add(g, new THREE.BoxGeometry(0.3, 0.18, 0.02), std('#4ea3ff'), { at: [0.82, 1.02, 0.62] })
}

function house(parent, r, at) {
  const g = group(parent, at, -0.15)
  const [w, d, h] = [1.5, 1.15, 0.95]
  add(g, new THREE.BoxGeometry(w, h, d), std('#f6ead3'), { at: [0, h / 2, 0] })
  add(g, prism(d + 0.24, 0.62, w + 0.22), std('#3f7fd0'), { at: [0, h, 0], rot: [0, Math.PI / 2, 0] })
  add(g, new THREE.BoxGeometry(0.2, 0.5, 0.2), std('#b8a38a'), { at: [0.42, h + 0.45, -0.2] })
  const win = glow('#ffcf70', 1.6)
  for (const wx of [-0.45, 0.45]) add(g, new THREE.BoxGeometry(0.26, 0.24, 0.03), win, { at: [wx, h * 0.58, d / 2 + 0.01], cast: false })
  add(g, new THREE.BoxGeometry(0.28, 0.5, 0.03), std('#5a3d29'), { at: [0, 0.25, d / 2 + 0.01] })
  bush(g, r, [-0.85, 0, 0.75], 0.5)
  bush(g, r, [0.85, 0, 0.8], 0.42)
}

function sawmill(parent, r, at) {
  const g = group(parent, at)
  const post = std('#8a5c34')
  for (const [px, pz] of [
    [-0.75, -0.5],
    [0.75, -0.5],
    [-0.75, 0.5],
    [0.75, 0.5],
  ])
    rod(g, V(px, 0, pz), V(px, pz < 0 ? 1.32 : 1.08, pz), 0.05, post)
  add(g, new THREE.BoxGeometry(1.8, 0.08, 1.35), std('#b8492f'), { at: [0, 1.2, 0], rot: [0.18, 0, 0] })
  add(g, new THREE.BoxGeometry(1.1, 0.35, 0.45), std('#a8773f'), { at: [0, 0.18, -0.05] })
  add(g, new THREE.CylinderGeometry(0.34, 0.34, 0.04, 24), std('#cfd6de', { metalness: 0.85, roughness: 0.25, flatShading: false }), {
    at: [0.1, 0.5, -0.05],
    rot: [Math.PI / 2, 0, 0],
  })
  const logMat = std('#9b6a3e')
  for (const [lx, ly] of [
    [-0.36, 0.12],
    [0, 0.12],
    [0.36, 0.12],
    [-0.18, 0.37],
    [0.18, 0.37],
    [0, 0.62],
  ])
    add(g, new THREE.CylinderGeometry(0.13, 0.13, 0.85, 8), logMat, { at: [lx, ly, 0.78], rot: [0, 0, Math.PI / 2] })

  // Scaffolding and a progress ring: this plot is mid-upgrade.
  const pole = std('#d8b27a')
  for (const pz of [-0.8, 0.8]) rod(g, V(1.02, 0, pz), V(1.02, 1.75, pz), 0.03, pole)
  for (const py of [0.62, 1.22]) add(g, new THREE.BoxGeometry(0.28, 0.04, 1.7), std('#c89a5b'), { at: [1.02, py, 0] })
  const ring = group(g, [0, 2.05, 0])
  add(ring, new THREE.TorusGeometry(0.34, 0.045, 8, 48), std('#3a4452', { transparent: true, opacity: 0.7 }), { cast: false })
  add(ring, new THREE.TorusGeometry(0.34, 0.06, 8, 48, TAU * 0.68), glow('#5cf08e', 3), { rot: [0, 0, Math.PI / 2], cast: false })
  return [ring]
}

function factory(parent, r, at) {
  const g = group(parent, at)
  add(g, new THREE.BoxGeometry(1.8, 1.05, 1.45), std('#a3adbd'), { at: [0, 0.525, 0] })
  for (let i = 0; i < 3; i++) add(g, prism(0.6, 0.42, 1.45, { right: true }), std('#5e6c84'), { at: [-0.6 + i * 0.6, 1.05, 0] })
  add(g, new THREE.CylinderGeometry(0.15, 0.19, 1.5, 10), std('#7d8697'), { at: [0.62, 1.6, -0.45] })
  add(g, new THREE.CylinderGeometry(0.2, 0.2, 0.12, 10), std('#d9534f'), { at: [0.62, 2.1, -0.45] })
  const smoke = std('#f4f1ec', { roughness: 1, transparent: true, opacity: 0.9 })
  for (let i = 0; i < 4; i++)
    add(g, new THREE.IcosahedronGeometry(0.16 + i * 0.07, 1), smoke, { at: [0.62 + i * 0.16, 2.55 + i * 0.36, -0.45 - i * 0.1], cast: false })
  const brass = std('#f2b33d', { metalness: 0.4, roughness: 0.4 })
  add(g, new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12), brass, { at: [-0.45, 0.6, 0.74], rot: [Math.PI / 2, 0, 0] })
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * TAU
    add(g, new THREE.BoxGeometry(0.1, 0.1, 0.08), brass, { at: [-0.45 + Math.cos(a) * 0.33, 0.6 + Math.sin(a) * 0.33, 0.74], rot: [0, 0, a] })
  }
  add(g, new THREE.CylinderGeometry(0.09, 0.09, 0.12, 8), std('#6b5a3a'), { at: [-0.45, 0.6, 0.77], rot: [Math.PI / 2, 0, 0] })
  const win = glow('#ffd27a', 1.4)
  for (const wx of [0.12, 0.5]) add(g, new THREE.BoxGeometry(0.24, 0.3, 0.03), win, { at: [wx, 0.62, 0.735], cast: false })
}

function prestige(parent, r, at) {
  const g = group(parent, at)
  add(g, new THREE.BoxGeometry(1.3, 0.3, 1.3), std('#f1ebdf'), { at: [0, 0.15, 0] })
  add(g, new THREE.BoxGeometry(0.95, 0.25, 0.95), std('#e4dccb'), { at: [0, 0.42, 0] })
  add(g, new THREE.CylinderGeometry(0.1, 0.3, 1.9, 4), gold(), { at: [0, 1.5, 0], rot: [0, Math.PI / 4, 0] })
  add(g, new THREE.OctahedronGeometry(0.26), glow('#63f2ff', 3.5), { at: [0, 2.85, 0], scale: [1, 1.35, 1], cast: false })
  add(g, new THREE.TorusGeometry(0.46, 0.025, 6, 40), glow('#ffd35a', 4), { at: [0, 2.85, 0], rot: [Math.PI / 2 - 0.35, 0, 0.2], cast: false })
  for (const [lx, lz] of [
    [-0.55, -0.55],
    [0.55, -0.55],
    [-0.55, 0.55],
    [0.55, 0.55],
  ])
    add(g, new THREE.BoxGeometry(0.1, 0.16, 0.1), glow('#ffd27a', 2.5), { at: [lx, 0.63, lz], cast: false })
}

function forSale(parent, r, at) {
  const g = group(parent, at)
  add(g, new THREE.PlaneGeometry(1.9, 1.9), glow('#3dff8b', 0.6, { transparent: true, opacity: 0.5 }), {
    at: [0, 0.02, 0],
    rot: [-Math.PI / 2, 0, 0],
    cast: false,
  })
  const dash = glow('#b6ffd0', 3)
  for (let i = 0; i < 6; i++) {
    const t = -0.85 + i * 0.34
    for (const [dx, dz, ry] of [
      [t, -0.95, 0],
      [t, 0.95, 0],
      [-0.95, t, Math.PI / 2],
      [0.95, t, Math.PI / 2],
    ])
      add(g, new THREE.BoxGeometry(0.18, 0.04, 0.05), dash, { at: [dx, 0.04, dz], rot: [0, ry, 0], cast: false })
  }
  add(g, new THREE.CylinderGeometry(0.62, 0.62, 2.4, 40, 1, true), beamMaterial('#4dff94', 0.3, 2.4), {
    at: [0, 1.22, 0],
    cast: false,
    receive: false,
  })
  coin(g, [0, 1.15, 0], 1.25, Math.PI / 4)
}

function conveyor(parent, r, x0, x1, z) {
  const len = x1 - x0
  const cx = (x0 + x1) / 2
  add(parent, new THREE.BoxGeometry(len, 0.2, 0.6), std('#f0b43c'), { at: [cx, 0.36, z] })
  add(parent, new THREE.BoxGeometry(len + 0.02, 0.04, 0.46), std('#30363f', { roughness: 0.55 }), { at: [cx, 0.48, z] })
  for (let x = x0 + 0.2; x < x1; x += 0.9)
    for (const dz of [-0.24, 0.24]) add(parent, new THREE.BoxGeometry(0.08, 0.28, 0.08), std('#7b8494'), { at: [x, 0.14, z + dz] })
  const wood = std('#b98549')
  const logMat = std('#9b6a3e')
  for (let x = x0 + 0.35; x < x1 - 0.2; x += 0.62) {
    if (r() < 0.55) add(parent, new THREE.BoxGeometry(0.28, 0.24, 0.28), wood, { at: [x, 0.62, z], rot: [0, r() * 0.4, 0] })
    else add(parent, new THREE.CylinderGeometry(0.11, 0.11, 0.36, 8), logMat, { at: [x, 0.61, z], rot: [Math.PI / 2, 0, 0] })
  }
}

function bank(parent, r, at) {
  const g = group(parent, at)
  add(g, new THREE.BoxGeometry(1.9, 0.24, 1.5), std('#e9dfca'), { at: [0, 0.12, 0] })
  add(g, new THREE.BoxGeometry(1.6, 0.95, 1.2), std('#f6efe0'), { at: [0, 0.715, 0] })
  for (const cx of [-0.6, -0.2, 0.2, 0.6])
    add(g, new THREE.CylinderGeometry(0.07, 0.08, 0.95, 10), std('#ffffff', { flatShading: false }), { at: [cx, 0.715, 0.66] })
  add(g, new THREE.BoxGeometry(1.75, 0.1, 1.4), std('#e0d3b8'), { at: [0, 1.24, 0.05] })
  add(g, prism(1.7, 0.36, 0.2), std('#f1e6cf'), { at: [0, 1.29, 0.66] })
  add(g, new THREE.SphereGeometry(0.46, 20, 10, 0, TAU, 0, Math.PI / 2), gold(), { at: [0, 1.29, -0.1] })
  for (const [cx, cy, cz, s] of [
    [-0.55, 1.75, 0.35, 0.9],
    [0.5, 2.0, 0.15, 1.05],
    [0.02, 2.35, 0.3, 0.95],
    [-0.35, 2.7, -0.05, 0.85],
    [0.38, 3.0, 0.25, 0.9],
  ])
    coin(g, [cx, cy, cz], s, Math.PI / 4 + (r() - 0.5) * 0.9, (r() - 0.5) * 0.8)
}

function windmill(parent, r, at, rotY) {
  const g = group(parent, at, rotY)
  add(g, new THREE.CylinderGeometry(0.42, 0.66, 2.3, 8), std('#f3e6cc'), { at: [0, 1.15, 0] })
  add(g, new THREE.ConeGeometry(0.58, 0.72, 8), std('#c8553d'), { at: [0, 2.66, 0] })
  add(g, new THREE.BoxGeometry(0.28, 0.46, 0.03), std('#6b4a31'), { at: [0, 0.23, 0.6] })
  const rotor = group(g, [0, 2.2, 0.56])
  add(rotor, new THREE.CylinderGeometry(0.1, 0.1, 0.22, 8), std('#6b4a31'), { rot: [Math.PI / 2, 0, 0] })
  for (let k = 0; k < 4; k++) {
    const arm = new THREE.Group()
    arm.rotation.z = (k * Math.PI) / 2 + 0.35
    rotor.add(arm)
    add(arm, new THREE.BoxGeometry(0.06, 1.35, 0.04), std('#7a5537'), { at: [0, 0.72, 0.06] })
    add(arm, new THREE.BoxGeometry(0.3, 1.05, 0.02), std('#fbf4e4'), { at: [0.17, 0.85, 0.07] })
  }
}

function pinegrove(root, r) {
  const island = floatingIsland(r, {
    radius: 8.6,
    sides: 52,
    depth: 6.6,
    top: (f, t, rr) => vary(rr.pick(WARM.grass), rr, 0.05),
    bands: WARM.bands,
  })
  root.add(island.mesh)

  const sand = std('#ecdcae', { roughness: 1 })
  add(root, new THREE.BoxGeometry(9.9, 0.04, 0.6), sand, { at: [0, 0.02, -1.1], cast: false })
  for (const x of [-1.55, 1.55]) add(root, new THREE.BoxGeometry(0.6, 0.04, 6.2), sand, { at: [x, 0.02, -1.1], cast: false })

  const plots = [
    [-3.1, -2.6],
    [0, -2.6],
    [3.1, -2.6],
    [-3.1, 0.4],
    [0, 0.4],
    [3.1, 0.4],
  ]
  const tiers = [prestige, factory, sawmill, house, hut, forSale]
  const billboards = []
  plots.forEach(([x, z], i) => {
    add(root, new THREE.BoxGeometry(2.5, 0.2, 2.5), std('#dccfb6'), { at: [x, 0.1, z] })
    add(root, new THREE.BoxGeometry(2.24, 0.05, 2.24), std(i === 5 ? '#b5e889' : '#9fd06a'), { at: [x, 0.215, z], cast: false })
    billboards.push(...(tiers[i](root, r, [x, 0.24, z]) ?? []))
  })
  conveyor(root, r, -4.4, -0.95, 2.3)
  conveyor(root, r, 0.95, 4.4, 2.3)
  bank(root, r, [0, 0, 3.15])

  const mill = island.at(-0.95, island.edge(-0.95) * 0.8)
  windmill(root, r, [mill.x, 0, mill.z], Math.PI / 4)

  const avoid = (x, z) => (Math.abs(x) < 4.7 && z > -4.3 && z < 4.3) || Math.hypot(x - mill.x, z - mill.z) < 1.3
  for (const p of scatter(r, island, 40, { min: 0.66, max: 0.95, spacing: 0.85, avoid }))
    pine(root, r, [p.x, 0, p.z], 0.8 + r() * 0.5, WARM.pine)
  for (const p of scatter(r, island, 6, { min: 0.55, max: 0.8, spacing: 1.2, avoid })) roundTree(root, r, [p.x, 0, p.z], 0.9 + r() * 0.3)
  for (const p of scatter(r, island, 9, { min: 0.6, max: 0.97, spacing: 0.9, avoid })) rock(root, r, [p.x, 0, p.z], 0.5 + r() * 0.8)
  flowers(root, r, island, 160, ['#ff8fb1', '#ffffff', '#ffd45c', '#c49bff'], { min: 0.45, max: 0.9, avoid })
  tufts(root, r, island, 70, WARM.tuft, { min: 0.45, max: 0.9, avoid })
  return { island, billboards }
}

/* ------------------------------------------ Orrery: physics puzzle island */

const DUSK = {
  grass: ['#4f9f86', '#469379', '#58ab90', '#3f8a72'],
  tuft: ['#3f8a72', '#4f9f86', '#2f7a64'],
  bands: ['#3d8a72', '#357a65', '#8d6a74', '#77596a', '#624a5d', '#6f6a8a', '#5d5877', '#4a4663'],
  tile: ['#ece6f6', '#e0d8ef', '#d4cbe7', '#c9bfe0'],
  stone: '#d9d1ea',
}

function hexPlaza(parent, r, radius) {
  const R = 0.46
  const spots = []
  const dx = Math.sqrt(3) * R
  const dz = 1.5 * R
  for (let j = -14; j <= 14; j++)
    for (let i = -14; i <= 14; i++) {
      const x = (i + (j & 1) * 0.5) * dx
      const z = j * dz
      const d = Math.hypot(x, z)
      if (d > radius) continue
      if (d > radius - 1.1 && r() < 0.45) continue
      if (d > 2 && r() < 0.05) continue
      spots.push([x, z])
    }
  const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(R - 0.035, R - 0.035, 0.12, 6), std('#ffffff', { roughness: 0.8 }), spots.length)
  const m = new THREE.Matrix4()
  spots.forEach(([x, z], k) => {
    mesh.setMatrixAt(k, m.makeTranslation(x, 0.06 + (r() - 0.5) * 0.02, z))
    mesh.setColorAt(k, vary(r.pick(DUSK.tile), r, 0.03))
  })
  mesh.castShadow = false
  parent.add(mesh)
}

function pedestal(parent, at, h = 0.8) {
  add(parent, new THREE.CylinderGeometry(0.22, 0.3, h, 8), std(DUSK.stone), { at: [at.x, h / 2 + 0.1, at.z] })
}

function orreryMachine(parent) {
  const g = group(parent, [0, 0.12, 0])
  const brass = std('#d6a445', { metalness: 0.8, roughness: 0.28, flatShading: false })
  const stone = std('#cfc6e3')
  add(g, new THREE.CylinderGeometry(1.55, 1.75, 0.35, 10), stone, { at: [0, 0.175, 0] })
  add(g, new THREE.CylinderGeometry(1.2, 1.35, 0.2, 10), stone, { at: [0, 0.45, 0] })
  add(g, new THREE.TorusGeometry(1.25, 0.05, 8, 60), brass, { at: [0, 0.56, 0], rot: [-Math.PI / 2, 0, 0] })
  add(g, new THREE.CylinderGeometry(0.13, 0.2, 2.3, 12), brass, { at: [0, 1.7, 0] })
  const sunY = 2.95
  add(g, new THREE.SphereGeometry(0.55, 32, 16), glow('#ffc862', 3.4), { at: [0, sunY, 0], cast: false })
  halo(g, V(0, sunY, 0), 3.2, '#ffcf7a', 0.55)
  const light = new THREE.PointLight('#ffcf7a', 10, 9, 1.5)
  light.position.set(0, sunY, 0)
  g.add(light)
  for (const ring of [
    { R: 1.3, tilt: [0.18, 0], size: 0.16, color: '#8fd3ff', a: 0.9 },
    { R: 1.95, tilt: [-0.28, 0.35], size: 0.22, color: '#ff7b6b', a: 2.6 },
    { R: 2.6, tilt: [0.12, -0.4], size: 0.3, color: '#9be07a', a: 4.4, rings: true },
    { R: 3.2, tilt: [-0.08, 0.2], size: 0.2, color: '#c7a6ff', a: 5.6 },
  ]) {
    const holder = group(g, [0, sunY, 0])
    holder.rotation.set(Math.PI / 2 + ring.tilt[0], 0, ring.tilt[1])
    add(holder, new THREE.TorusGeometry(ring.R, 0.028, 6, 120), brass)
    const px = Math.cos(ring.a) * ring.R
    const py = Math.sin(ring.a) * ring.R
    add(holder, new THREE.SphereGeometry(ring.size, 28, 14), std(ring.color, { flatShading: false, roughness: 0.55, emissive: ring.color, emissiveIntensity: 0.3 }), {
      at: [px, py, 0],
    })
    rod(holder, V(0, 0, 0), V(px, py, 0), 0.018, brass, { seg: 5 })
    if (ring.rings) add(holder, new THREE.TorusGeometry(ring.size * 1.7, 0.02, 4, 40), brass, { at: [px, py, 0], rot: [0.9, 0.3, 0] })
  }
}

/** The launch room: a launcher, the arc as flown, and the target ring. */
function launchPuzzle(parent) {
  const base = V(-4.2, 0.12, 1.0)
  add(parent, new THREE.CylinderGeometry(0.55, 0.62, 0.2, 8), std('#8c83ad'), { at: [base.x, 0.22, base.z] })
  add(parent, new THREE.TorusGeometry(0.46, 0.04, 6, 32), glow('#6ff3ff', 4), { at: [base.x, 0.33, base.z], rot: [-Math.PI / 2, 0, 0], cast: false })
  const brass = std('#d6a445', { metalness: 0.8, roughness: 0.3, flatShading: false })
  const muzzle = V(base.x + 0.42, 1.15, base.z + 0.18)
  rod(parent, V(base.x, 0.35, base.z), muzzle, 0.15, brass, { seg: 12 })

  const end = V(3.1, 1.95, 3.4)
  const pts = []
  for (let i = 0; i <= 30; i++) {
    const t = i / 30
    const p = muzzle.clone().lerp(end, t)
    p.y += 4 * 4.1 * t * (1 - t)
    pts.push(p)
  }
  const dot = glow('#6ff3ff', 3.5)
  pts.forEach((p, i) => {
    if (i % 2 || (i > 15 && i < 21)) return
    add(parent, new THREE.SphereGeometry(0.05, 10, 6), dot, { at: [p.x, p.y, p.z], cast: false })
  })
  const ball = pts[20]
  add(parent, new THREE.SphereGeometry(0.17, 20, 12), glow('#ffb347', 3.5), { at: [ball.x, ball.y, ball.z], cast: false })
  halo(parent, ball, 1.3, '#ffb347', 0.5)
  for (let k = 1; k <= 4; k++) {
    const p = pts[20 - k]
    add(parent, new THREE.SphereGeometry(0.15 - k * 0.028, 12, 8), glow('#ff9a3c', 3 - k * 0.5, { transparent: true, opacity: 0.9 - k * 0.18 }), {
      at: [p.x, p.y, p.z],
      cast: false,
    })
  }
  const inbound = V().subVectors(pts[30], pts[28]).normalize()
  rod(parent, V(end.x, 0.1, end.z), V(end.x, end.y - 0.55, end.z), 0.12, std(DUSK.stone), { seg: 8 })
  const target = add(parent, new THREE.TorusGeometry(0.5, 0.06, 10, 40), glow('#ff5fd2', 4), { at: [end.x, end.y, end.z], cast: false })
  target.quaternion.setFromUnitVectors(V(0, 0, 1), inbound)
}

/** A laser bounced between mirrors into a receiver gate. */
function laserPuzzle(parent) {
  const [A, B, C, D] = [V(-2.9, 0.95, -3.9), V(1.1, 0.95, -4.6), V(4.1, 0.95, -2.0), V(4.5, 0.95, 0.6)]
  pedestal(parent, A)
  add(parent, new THREE.OctahedronGeometry(0.2), glow('#ff6ad5', 5), { at: [A.x, A.y + 0.18, A.z], scale: [0.8, 1.5, 0.8], cast: false })
  const mirror = std('#e8f4ff', { metalness: 1, roughness: 0.05, flatShading: false })
  for (const [p, from, to] of [
    [B, A, C],
    [C, B, D],
  ]) {
    pedestal(parent, p)
    const normal = V().subVectors(from, p).normalize().add(V().subVectors(to, p).normalize()).normalize()
    // Local rotation, not lookAt: lookAt works in world space, and in the
    // hero shot this island sits inside a moved group.
    add(parent, new THREE.BoxGeometry(0.62, 0.52, 0.05), mirror, { at: [p.x, p.y + 0.2, p.z] }).quaternion.setFromUnitVectors(
      V(0, 0, 1),
      normal
    )
  }
  // The receiver: an arch that lights up when the beam lands.
  const stone = std(DUSK.stone)
  add(parent, new THREE.BoxGeometry(0.28, 1.7, 0.28), stone, { at: [D.x, 0.95, D.z - 0.55] })
  add(parent, new THREE.BoxGeometry(0.28, 1.7, 0.28), stone, { at: [D.x, 0.95, D.z + 0.55] })
  add(parent, new THREE.BoxGeometry(0.34, 0.26, 1.46), stone, { at: [D.x, 1.9, D.z] })
  add(parent, new THREE.BoxGeometry(0.06, 1.0, 0.82), glow('#ff6ad5', 2.2, { transparent: true, opacity: 0.8 }), { at: [D.x, 1.1, D.z], cast: false })
  const beam = glow('#ff6ad5', 6)
  const soft = new THREE.MeshBasicMaterial({ color: '#ff6ad5', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false })
  for (const [a, b] of [
    [A, B],
    [B, C],
    [C, D],
  ]) {
    const a2 = V(a.x, a.y + 0.2, a.z)
    const b2 = V(b.x, b.y + 0.2, b.z)
    rod(parent, a2, b2, 0.022, beam, { seg: 6, cast: false })
    rod(parent, a2, b2, 0.06, soft, { seg: 10, cast: false })
  }
  // Pressure plates, two of them already solved.
  for (const [x, z, on] of [
    [-3.1, 2.7, true],
    [-2.2, 3.5, true],
    [-3.9, -0.6, false],
  ]) {
    add(parent, new THREE.CylinderGeometry(0.42, 0.42, 0.06, 6), std('#b3a8d2'), { at: [x, 0.15, z] })
    add(parent, new THREE.TorusGeometry(0.36, 0.03, 4, 6), glow(on ? '#5cf08e' : '#6d6690', on ? 4 : 0.6), {
      at: [x, 0.19, z],
      rot: [-Math.PI / 2, 0, 0],
      cast: false,
    })
  }
}

function crystalCluster(parent, r, at, color) {
  const g = group(parent, at, r() * TAU)
  rock(g, r, [0, 0, 0], 0.9, '#6f6a8a')
  for (let k = 0; k < 4; k++)
    add(g, new THREE.OctahedronGeometry(0.18), glow(color, 1.8, { color: '#241a3a', roughness: 0.4 }), {
      at: [(r() - 0.5) * 0.4, 0.35 + r() * 0.2, (r() - 0.5) * 0.4],
      rot: [(r() - 0.5) * 0.8, r() * TAU, (r() - 0.5) * 0.8],
      scale: [0.6, 1.8 + r() * 1.2, 0.6],
      cast: false,
    })
}

function orrery(root, r) {
  const island = floatingIsland(r, {
    radius: 8,
    sides: 48,
    depth: 6.2,
    top: (f, t, rr) => vary(rr.pick(DUSK.grass), rr, 0.05),
    bands: DUSK.bands,
  })
  root.add(island.mesh)
  hexPlaza(root, r, 5.4)
  orreryMachine(root)
  launchPuzzle(root)
  laserPuzzle(root)

  const stone = std('#e3dcf0')
  for (const [t, h, broken] of [
    [0.3, 2.3, false],
    [1.2, 1.4, true],
    [2.25, 2.5, false],
    [3.0, 1.1, true],
    [3.75, 2.2, false],
    [4.6, 1.6, true],
    [5.5, 2.4, false],
  ]) {
    const p = island.at(t, 6.05)
    add(root, new THREE.CylinderGeometry(0.22, 0.27, h, 10), stone, { at: [p.x, h / 2, p.z] })
    if (broken)
      add(root, new THREE.CylinderGeometry(0.22, 0.22, 0.7, 10), stone, {
        at: [p.x + 0.55, 0.22, p.z + 0.2],
        rot: [0, r() * TAU, Math.PI / 2],
      })
    else add(root, new THREE.BoxGeometry(0.62, 0.16, 0.62), stone, { at: [p.x, h + 0.08, p.z] })
  }
  const avoid = (x, z) => Math.hypot(x, z) < 5.7
  scatter(r, island, 8, { min: 0.8, max: 0.94, spacing: 1.6, avoid }).forEach((p, i) =>
    crystalCluster(root, r, [p.x, 0, p.z], i % 2 ? '#7cf3ff' : '#c58bff')
  )
  for (const p of scatter(r, island, 12, { min: 0.74, max: 0.95, spacing: 0.9, avoid }))
    bush(root, r, [p.x, 0, p.z], 0.5 + r() * 0.4, ['#3f9a7c', '#4aab8a'])
  tufts(root, r, island, 70, DUSK.tuft, { min: 0.72, max: 0.95, avoid })

  for (const [t, rad, y, s] of [
    [2.6, 11.5, 1.5, 1.2],
    [3.9, 13, -1.2, 1.5],
    [5.1, 11, 2.6, 0.9],
    [0.9, 12.5, -2.5, 1.0],
    [3.3, 16.5, 3.5, 0.8],
  ])
    islet(root, r, [Math.sin(t) * rad, y, Math.cos(t) * rad], s, DUSK, (g, rr) =>
      rr() < 0.5
        ? crystalCluster(g, rr, [0, 0, 0], rr() < 0.5 ? '#7cf3ff' : '#c58bff')
        : bush(g, rr, [0, 0, 0], 0.8, ['#3f9a7c', '#4aab8a'])
    )
  return { island, billboards: [] }
}

/* --------------------------------------------------------------- scenes */

/** Clouds set around the direction behind the island, as seen from the key camera. */
function cloudsBehind(scene, r, back, color, emissive) {
  for (const [dt, rad, y, s] of [
    [-1.15, 17, 1.5, 1.3],
    [-0.55, 21, 4.5, 1.1],
    [0.35, 19, -2.5, 1.6],
    [1.1, 16, 2.5, 1.2],
    [0.9, 22, -7, 1.8],
    [-0.9, 18, -6.5, 1.5],
  ])
    cloud(scene, r, [Math.sin(back + dt) * rad, y, Math.cos(back + dt) * rad], s, color, emissive)
}

/** The angle, around the island, of the side facing away from a camera. */
const behind = ([x, , z]) => Math.atan2(x, z) + Math.PI

function tidebreakScene() {
  const r = rng(111)
  const scene = new THREE.Scene()
  skyDome(scene, { top: '#2f7fd8', horizon: '#e3f4ff', bottom: '#8cc8f0' })
  scene.fog = new THREE.Fog('#cfe8fb', 30, 120)
  sun(scene, { dir: V(0.65, 0.8, -0.2), color: '#fff3dc', intensity: 3.1, hemi: ['#d2ebff', '#6f935a', 1.05] })
  const back = behind(SHOTS.tidebreak.pos)
  cloudsBehind(scene, r, back)
  const { billboards } = tidebreak(scene, rng(11))
  return { scene, billboards, bloom: { strength: 0.4, radius: 0.35, threshold: 1.35 }, env: 0.35 }
}

function nightjarScene() {
  const r = rng(119)
  const scene = new THREE.Scene()
  skyDome(scene, { top: '#070b1f', horizon: '#2b2657', bottom: '#0b0e24' })
  scene.fog = new THREE.FogExp2('#161a36', 0.011)
  sun(scene, { dir: V(-0.55, 0.8, -0.45), color: '#9db4ff', intensity: 1.2, hemi: ['#34427a', '#0c0f1d', 0.6] })
  stars(scene, r, 900, { size: 2.2, opacity: 0.8 })
  stars(scene, r, 140, { size: 4, opacity: 0.9 })
  const back = behind(SHOTS.nightjar.pos)
  cloudsBehind(scene, r, back, '#39406f', 0.04)
  const moon = add(scene, new THREE.SphereGeometry(18, 48, 24), glow('#fff3dc', 2.2, { fog: false }), { cast: false, receive: false })
  const moonGlow = halo(scene, V(), 170, '#8ea2ff', 0.5)
  const { billboards } = nightjar(scene, rng(19))
  return {
    scene,
    billboards,
    bloom: { strength: 0.6, radius: 0.45, threshold: 0.9 },
    env: 0.12,
    backdrop(camera) {
      const fwd = V()
      camera.getWorldDirection(fwd)
      const side = V().crossVectors(fwd, camera.up).normalize()
      const lift = V().crossVectors(side, fwd).normalize()
      const p = camera.position.clone().addScaledVector(fwd, 420).addScaledVector(side, -150).addScaledVector(lift, 95)
      moon.position.copy(p)
      moonGlow.position.copy(p)
    },
  }
}

function pinegroveScene() {
  const r = rng(123)
  const scene = new THREE.Scene()
  const sky = skyDome(scene, { top: '#6fa3e6', horizon: '#ffd6a8', bottom: '#f0ab86', glowColor: '#ffe3b8', glowAmount: 0.9 })
  scene.fog = new THREE.Fog('#f6c9a0', 35, 130)
  sun(scene, { dir: V(-0.55, 0.45, 0.7), color: '#ffd2a0', intensity: 3.2, hemi: ['#ffe2c6', '#6b8a4a', 0.9] })
  const back = behind(SHOTS.pinegrove.pos)
  cloudsBehind(scene, r, back, '#fff1e6', 0.1)
  const { billboards } = pinegrove(scene, rng(23))
  return {
    scene,
    billboards,
    bloom: { strength: 0.4, radius: 0.35, threshold: 1.35 },
    env: 0.35,
    backdrop: (camera) => aimGlow(sky, camera, { right: 0.45, up: 0.3 }),
  }
}

function orreryScene() {
  const r = rng(131)
  const scene = new THREE.Scene()
  const sky = skyDome(scene, { top: '#211c58', horizon: '#f39cbb', bottom: '#4a3a86', glowColor: '#ffc2d4', glowAmount: 0.7 })
  scene.fog = new THREE.Fog('#8a6fb8', 40, 150)
  sun(scene, { dir: V(0.3, 0.55, -0.75), color: '#ffc0d6', intensity: 2.2, hemi: ['#9a98f0', '#3b2b58', 1.1] })
  stars(scene, r, 500, { size: 2, opacity: 0.55, minY: 0.05 })
  const back = behind(SHOTS.orrery.pos)
  cloudsBehind(scene, r, back, '#e6c9f0', 0.08)
  const { billboards } = orrery(scene, rng(31))
  return {
    scene,
    billboards,
    bloom: { strength: 0.45, radius: 0.4, threshold: 1.2 },
    env: 0.3,
    backdrop: (camera) => aimGlow(sky, camera, { right: -0.35, up: 0.25 }),
  }
}

function heroScene() {
  const r = rng(107)
  const scene = new THREE.Scene()
  const sky = skyDome(scene, { top: '#3f86e0', horizon: '#ffe6d6', bottom: '#8fc0f0', glowColor: '#fff0d6', glowAmount: 0.45 })
  scene.fog = new THREE.Fog('#dcecff', 45, 200)
  sun(scene, { dir: V(0.8, 1.0, 0.35), color: '#fff1dc', intensity: 3.0, hemi: ['#d7ecff', '#7a9160', 1.1], size: 44, map: 8192, target: V(-4, 0, -14) })
  const back = behind([SHOTS.hero.pos[0] + 3, 0, SHOTS.hero.pos[2] + 10])
  cloudSea(scene, r, { y: -36, count: 200, inner: 14, outer: 160, color: '#f4f8ff', emissive: 0.06, arc: [back, 1.3] })
  for (const [x, y, z, s] of [
    [-14, -6, 2, 1.5],
    [13, -8, -6, 1.8],
    [-33, 4, -22, 2],
    [2, 12, -48, 1.7],
    [24, 0, -34, 1.9],
  ])
    cloud(scene, r, [x, y, z], s)

  const billboards = []
  billboards.push(...tidebreak(group(scene), rng(11), { camTheta: Math.atan2(15, 21) }).billboards)
  const farm = group(scene, [-20, -1, -8])
  farm.scale.setScalar(0.8)
  billboards.push(...pinegrove(farm, rng(23)).billboards)
  const lab = group(scene, [6, 3, -20])
  lab.scale.setScalar(0.75)
  orrery(lab, rng(31))
  const camp = group(scene, [-10, 6.5, -34])
  camp.scale.setScalar(0.7)
  nightjar(camp, rng(19), { night: false })
  return {
    scene,
    billboards,
    bloom: { strength: 0.4, radius: 0.35, threshold: 1.35 },
    env: 0.35,
    backdrop: (camera) => aimGlow(sky, camera, { right: 0.2, up: 0.35 }),
  }
}

const SHOTS = {
  hero: { scene: heroScene, pos: [15, 10, 21], target: [-4, 0.5, -9], fov: 40 },
  tidebreak: { scene: tidebreakScene, pos: [15.5, 10.5, 17], target: [0, -0.3, 0], fov: 31 },
  'tidebreak-detail': { scene: tidebreakScene, pos: [6.2, 2.4, 7.4], target: [-0.9, 1.1, -1.5], fov: 42, bloom: { strength: 0.25 } },
  nightjar: { scene: nightjarScene, pos: [-14.5, 11, 17.5], target: [0, -0.4, 0], fov: 31 },
  'nightjar-detail': { scene: nightjarScene, pos: [-4.8, 2.6, 6.2], target: [0.6, 0.8, -0.8], fov: 44 },
  pinegrove: { scene: pinegroveScene, pos: [16, 12.5, 16.5], target: [0, -0.2, 0.2], fov: 31 },
  'pinegrove-detail': { scene: pinegroveScene, pos: [4.8, 2.6, 8.2], target: [0.3, 0.9, 1.6], fov: 42, bloom: { strength: 0.3 } },
  orrery: { scene: orreryScene, pos: [14, 9.5, 16], target: [0, 0.8, 0], fov: 31 },
  'orrery-detail': { scene: orreryScene, pos: [4.6, 3.2, 5.6], target: [0, 2.4, 0], fov: 46 },
}

/* --------------------------------------------------------------- render */

const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.NeutralToneMapping
document.body.appendChild(renderer.domElement)
const envMap = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture

function disposeScene(scene) {
  scene.traverse((o) => {
    o.geometry?.dispose()
    for (const m of [o.material].flat()) {
      if (!m) continue
      m.map?.dispose()
      m.dispose()
    }
    o.shadow?.dispose?.()
  })
}

function render(name, width, height, scale = 2) {
  const shot = SHOTS[name]
  const { scene, billboards = [], bloom: sceneBloom = {}, env = 0.3, exposure = 1, backdrop } = shot.scene()
  const bloom = { ...sceneBloom, ...shot.bloom }
  scene.environment = envMap
  scene.environmentIntensity = env

  const W = Math.round(width * scale)
  const H = Math.round(height * scale)
  renderer.setPixelRatio(1)
  renderer.setSize(W, H, false)
  renderer.toneMappingExposure = exposure

  const camera = new THREE.PerspectiveCamera(shot.fov, width / height, 0.1, 3000)
  camera.position.set(...shot.pos)
  camera.lookAt(...shot.target)
  camera.updateMatrixWorld()
  for (const b of billboards) b.lookAt(camera.position)
  backdrop?.(camera)

  const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 })
  const composer = new EffectComposer(renderer, target)
  composer.setPixelRatio(1)
  composer.setSize(W, H)
  const vignette = new ShaderPass(VIGNETTE)
  vignette.uniforms.amount.value = shot.vignette ?? 0.3
  const passes = [
    new RenderPass(scene, camera),
    new ShaderPass(SANITIZE),
    new UnrealBloomPass(new THREE.Vector2(W, H), bloom.strength ?? 0.5, bloom.radius ?? 0.5, bloom.threshold ?? 1),
    vignette,
    new OutputPass(),
  ]
  for (const pass of passes) composer.addPass(pass)
  composer.render()

  const url = renderer.domElement.toDataURL('image/png')
  for (const pass of passes) pass.dispose()
  composer.dispose()
  target.dispose()
  disposeScene(scene)
  return url
}

window.conceptArt = { shots: Object.keys(SHOTS), render }

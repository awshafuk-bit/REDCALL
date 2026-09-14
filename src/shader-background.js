import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  vec3 spectrum(float h) {
    vec3 c = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c * c * (3.0 - 2.0 * c);
  }

  /* Full rainbow, warped so it lingers on red (spectrum(0) = red) and blended with the
     brand red so the beam still reads as Redcall's own color, not a generic prism. */
  vec3 palette(float t) {
    float warped = pow(fract(t), 2.4);
    vec3 rainbow = spectrum(warped);
    vec3 brand = vec3(0.85, 0.16, 0.13);
    return mix(rainbow, brand, 0.5);
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    float sway = sin(uTime * 0.12) * 0.22 + uMouse.x * 0.35;
    vec2 source = vec2(sway, -1.65 + uMouse.y * 0.08);

    vec2 d = p - source;
    float angle = atan(d.x, d.y);
    float dist = length(d);

    float beamWidth = 0.5 + sin(uTime * 0.18) * 0.04;
    float edge = smoothstep(beamWidth, beamWidth - 0.42, abs(angle));

    float raySlices = noise(vec2(angle * 9.0 + uTime * 0.05, uTime * 0.25)) * 0.5 + 0.5;
    float falloff = smoothstep(2.5, 0.05, dist);

    float hueShift = (angle / beamWidth) * 0.7 + 0.5 + uTime * 0.05;
    vec3 color = palette(hueShift);

    float core = smoothstep(0.06, 0.0, abs(angle)) * 0.6;
    float intensity = edge * falloff * (0.5 + raySlices * 0.7) + core * falloff;

    float grain = (hash(uv * uResolution.xy * 0.75 + uTime) - 0.5) * 0.03;

    vec3 coreColor = mix(vec3(1.0), vec3(0.98, 0.35, 0.28), 0.25);
    vec3 finalColor = color * intensity + coreColor * core * falloff * 0.4 + grain;
    float alpha = clamp(intensity + core * falloff, 0.0, 1.0);

    gl_FragColor = vec4(finalColor, alpha);
  }
`

export function mountShaderBackground(container) {
  if (!container) return () => {}

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const scene = new THREE.Scene()
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  const geometry = new THREE.PlaneGeometry(2, 2)
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const targetMouse = { x: 0, y: 0 }
  const currentMouse = { x: 0, y: 0 }

  const handleMouseMove = (e) => {
    targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1
    targetMouse.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('mousemove', handleMouseMove)

  const handleResize = () => {
    const w = container.clientWidth
    const h = container.clientHeight
    renderer.setSize(w, h)
    uniforms.uResolution.value.set(w, h)
  }
  window.addEventListener('resize', handleResize)

  let raf = 0
  const clock = new THREE.Clock()

  const renderFrame = () => {
    currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04
    currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04
    uniforms.uMouse.value.set(currentMouse.x, currentMouse.y)
    uniforms.uTime.value = clock.getElapsedTime()
    renderer.render(scene, camera)
  }

  if (prefersReducedMotion) {
    renderFrame()
  } else {
    const animate = () => {
      renderFrame()
      raf = requestAnimationFrame(animate)
    }
    animate()
  }

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', handleResize)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
    container.removeChild(renderer.domElement)
  }
}

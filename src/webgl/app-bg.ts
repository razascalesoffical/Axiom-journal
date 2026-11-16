import * as THREE from 'three';
import { FluidSim, ParticleSim } from './Simulations';
import * as Shaders from './shaders';

const MATCAP_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFmUlEQVR4nO2bXWgcVRTHf2dzs02SptS0TdKmbX7VpiZ9aB9UfKggig/6oiCigvhQQfRFEBEVREH0RRAfVBAFFUQUH/Sjgqj4UHxofVB8KD6I1m9N2jRpmu1mZzYfznRrd+Z7mU3S1In+YX4wu5m99/zvPffcc88ZmqYREmBq6qIDDAnQ778XN0S7Y7p9+t6m09M069VXt6Zp8SOfp0mAtS9fPJKm6fVpmhGmbp6mX/zyu61pYf7X99OktXNf7S87vW9v+HhD9M2G6DsNMXi9H8z67XvP/AEm8+Z5U28/MAnvU3D/JNz9O364L76f4Pz7G/M2YvC+MfhM+H6HqI1N6X9I/q0BvLcx/B7GvY2YyYzhB16P2u8f8z0XzE0XfG9f+N2E72YmXo/+N+V7r6A+F/C5TPh8O7F5C+E+Z9jE8D0XvjclvF9S8D+XmXglfXfK9/mG+D8mAnBvY+Z+O+S7iX9nAt+T8P8uYvA1An9jAn9n+K3Mv6/H913f63YpA39mAn+mUv6XIn9iEv+qEP+yUn6mIn9lEv+oEn+fEn+fEn+fEuevU/6pEv+pEn+rEv6mIn9mEv+mUn6mIn9iEv8qEP8qEf6mEf6nEv6vEn+fEn+fEn6eIu9v0+8N+P9zIvxOJeN9Khnm+0Dq9yv777vK/v1OInZ8An6vE6jP+Yv4Xibkf4lA9TqZjfP9An7XSPhvJeR77QT6cyrL9/X9/uOIn6kEn6mE758I9DkZ+N66yPl/9vO+N8TPrfG+N8XPPfFzT/z8f3Z/r7N3+8/v63P2vof9u479u469u87f28ZfSsb5nU76XEr6nE76XG7v/uP9fUf8viP+3hH/vCH+fkP8uS3+vCH+7E78eUP8vCH+vCH+ZkP8zYb494b4s9v/9+R8v/9Zl8DfbYh/0xD/phP8yV7g5V5uL/Xn0v7S7e2ly/V9X2rPh+05P5+S798Bv+p8T4fEnE4P0m8v0nE06m4/8U4P9vX/x6v6vPz/Pzi6P670u6/q4iP9Rz0sR7+fUn8vAn+0wn6XIn8iQn4mI75e8r9mYr4p4r8jAn0f+0m99/9mN3f7Sbn/zmO/90O/r87/V9S9/9v4P894X9vAv96Ev';

function detectSoftwareRenderer(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererParam = debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpuName = String(gl.getParameter(rendererParam));
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuName);
  } catch {
    return true;
  }
}

export function initAppBackground(containerId: string = 'webgl-app-bg') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false };
  const cameraTarget = new THREE.Vector3(-1.17, 0, 6);

  let isDisposed = false;
  let frameId = 0;

  let renderer: THREE.WebGLRenderer | null = null;
  let fluidSim: FluidSim | null = null;
  let particleSim: ParticleSim | null = null;
  let geometry: THREE.BufferGeometry | null = null;
  let particleMat: THREE.ShaderMaterial | null = null;
  let matcapTexture: THREE.Texture | null = null;

  const splatPoint = new THREE.Vector2();
  const splatVelocity = new THREE.Vector3();
  const splatDensity = new THREE.Vector3(1, 1, 1);

  const handlePointerCoord = (clientX: number, clientY: number) => {
    const nx = clientX / window.innerWidth;
    const ny = 1 - clientY / window.innerHeight;

    pointer.dx = nx - pointer.x;
    pointer.dy = ny - pointer.y;
    pointer.x = nx;
    pointer.y = ny;
    pointer.moved = true;

    const mx = (clientX / window.innerWidth) * 2 - 1;
    const my = (clientY / window.innerHeight) * 2 - 1;
    cameraTarget.x = -1.17 - mx;
    cameraTarget.y = my * 2;
  };

  const handleMouseMove = (event: MouseEvent) => {
    handlePointerCoord(event.clientX, event.clientY);
  };

  const handleTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) {
      handlePointerCoord(touch.clientX, touch.clientY);
    }
  };

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    isDisposed = true;
    cancelAnimationFrame(frameId);
  };

  let camera: THREE.PerspectiveCamera | null = null;

  const handleResize = () => {
    if (!renderer || !camera || !particleMat) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    particleMat.uniforms.uDPR.value = renderer.getPixelRatio();
  };

  try {
    const isSoftware = detectSoftwareRenderer();
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({
      antialias: !isSoftware,
      powerPreference: 'high-performance',
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // transparent so dark/light theme background works nicely
    renderer.domElement.id = 'app-bg-canvas';
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 1000);
    camera.position.set(-1.17, 0, 6);

    fluidSim = new FluidSim(renderer);

    const particleRes = width < 760 ? 128 : 512;
    const particleCount = particleRes * particleRes;
    particleSim = new ParticleSim(renderer, particleRes);

    matcapTexture = new THREE.TextureLoader().load(MATCAP_DATA);

    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const uvs = new Float32Array(particleCount * 2);
    const randoms = new Float32Array(particleCount * 4);

    for (let i = 0; i < particleCount; i++) {
      const u = (i % particleRes) / particleRes;
      const v = Math.floor(i / particleRes) / particleRes;
      positions[i * 3 + 0] = u;
      positions[i * 3 + 1] = v;
      positions[i * 3 + 2] = 0;
      uvs[i * 2 + 0] = u;
      uvs[i * 2 + 1] = v;
      randoms[i * 4 + 0] = Math.random();
      randoms[i * 4 + 1] = Math.random();
      randoms[i * 4 + 2] = Math.random();
      randoms[i * 4 + 3] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute('random', new THREE.BufferAttribute(randoms, 4));

    particleMat = new THREE.ShaderMaterial({
      vertexShader: Shaders.particleRenderVertexShader,
      fragmentShader: Shaders.particleRenderFragmentShader,
      uniforms: {
        uPosTexture: { value: particleSim.targets[0].texture },
        uMatcap: { value: matcapTexture },
        uTime: { value: 0 },
        uDPR: { value: renderer.getPixelRatio() }
      },
      transparent: true,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const mesh = new THREE.Points(geometry, particleMat);
    const group = new THREE.Group();
    group.position.set(0.343, 0.16, -1);
    group.rotation.set(
      THREE.MathUtils.degToRad(-28.4),
      THREE.MathUtils.degToRad(390),
      THREE.MathUtils.degToRad(4.92)
    );
    group.scale.set(5, 5, 6);
    group.add(mesh);
    scene.add(group);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();
    const renderLoop = (now: number) => {
      if (isDisposed || !renderer || !camera || !fluidSim || !particleSim || !particleMat) {
        return;
      }

      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const time = now / 1000;
      const hz = dt * 60;

      camera.position.lerp(cameraTarget, 0.05);
      camera.lookAt(0, 0, 0);

      if (pointer.moved) {
        const dist = Math.hypot(pointer.dx, pointer.dy) * 1000;
        const mobileScale = window.innerWidth < 760 ? 0.8 : 1;
        const radius = THREE.MathUtils.clamp(dist, 0, 60) * 0.6 * mobileScale * 0.0001;
        const force = THREE.MathUtils.clamp(dist, 0, 15) * 10;

        if (dist > 0.01) {
          splatPoint.set(pointer.x, pointer.y);
          splatVelocity.set(pointer.dx * force, pointer.dy * force, 1);
          fluidSim.splat(splatPoint, splatVelocity, radius, false);
          fluidSim.splat(splatPoint, splatDensity, radius, true);
        }
        pointer.moved = false;
      }

      fluidSim.update(dt);
      particleSim.update(time, hz, fluidSim, camera, group);

      particleMat.uniforms.uTime.value = time;
      particleMat.uniforms.uPosTexture.value = particleSim.targets[0].texture;

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(renderLoop);
    };

    frameId = requestAnimationFrame(renderLoop);
  } catch (err) {
    console.warn('App WebGL background initialization failed:', err);
  }
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAppBackground());
  } else {
    initAppBackground();
  }
}

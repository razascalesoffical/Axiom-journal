import * as THREE from 'three';
import * as Shaders from './shaders';

type RenderTargetPair = [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];

function swapRenderTargets(pair: RenderTargetPair): void {
  const first = pair[0];
  pair[0] = pair[1];
  pair[1] = first;
}

export class FluidSim {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  readonly quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

  velocity: RenderTargetPair;
  density: RenderTargetPair;
  pressure: RenderTargetPair;
  divergence: THREE.WebGLRenderTarget;

  readonly materials: Record<string, THREE.ShaderMaterial> = {};

  constructor(private readonly renderer: THREE.WebGLRenderer) {
    const res = 256;
    const dyeRes = 512;

    const createTarget = (size: number) =>
      new THREE.WebGLRenderTarget(size, size, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
        stencilBuffer: false
      });

    this.velocity = [createTarget(res), createTarget(res)];
    this.density = [createTarget(dyeRes), createTarget(dyeRes)];
    this.pressure = [createTarget(res), createTarget(res)];
    this.divergence = createTarget(res);

    this.quad.frustumCulled = false;
    this.scene.add(this.quad);

    const common = { transparent: false, depthTest: false, depthWrite: false };
    const simTexel = new THREE.Vector2(1 / res, 1 / res);

    this.materials.splat = new THREE.ShaderMaterial({
      ...common,
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.splatShader,
      uniforms: {
        uTarget: { value: null },
        uAspect: { value: 1 },
        uPoint: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Vector3() },
        uRadius: { value: 0.0001 }
      }
    });

    this.materials.advect = new THREE.ShaderMaterial({
      ...common,
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.advectShader,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        uTexelSize: { value: simTexel.clone() },
        uDt: { value: 1 / 60 },
        uDissipation: { value: 0.98 }
      }
    });

    this.materials.divergence = new THREE.ShaderMaterial({
      ...common,
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.divergenceShader,
      uniforms: {
        uVelocity: { value: null },
        uTexelSize: { value: simTexel.clone() }
      }
    });

    this.materials.pressure = new THREE.ShaderMaterial({
      ...common,
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.pressureShader,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        uTexelSize: { value: simTexel.clone() }
      }
    });

    this.materials.gradientSubtract = new THREE.ShaderMaterial({
      ...common,
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.gradientSubtractShader,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        uTexelSize: { value: simTexel.clone() }
      }
    });
  }

  splat(point: THREE.Vector2, color: THREE.Vector3, radius: number, isDensity = false): void {
    const mat = this.materials.splat;
    const pair = isDensity ? this.density : this.velocity;

    mat.uniforms.uTarget.value = pair[0].texture;
    mat.uniforms.uPoint.value.copy(point);
    mat.uniforms.uColor.value.copy(color);
    mat.uniforms.uRadius.value = radius;
    mat.uniforms.uAspect.value = pair[0].width / pair[0].height;

    this.quad.material = mat;
    this.renderer.setRenderTarget(pair[1]);
    this.renderer.render(this.scene, this.camera);
    swapRenderTargets(pair);
  }

  update(dt: number): void {
    const res = 256;
    const dyeRes = 512;

    this.materials.advect.uniforms.uVelocity.value = this.velocity[0].texture;
    this.materials.advect.uniforms.uSource.value = this.velocity[0].texture;
    this.materials.advect.uniforms.uTexelSize.value.set(1 / res, 1 / res);
    this.materials.advect.uniforms.uDt.value = dt;
    this.materials.advect.uniforms.uDissipation.value = 0.98;
    this.quad.material = this.materials.advect;
    this.renderer.setRenderTarget(this.velocity[1]);
    this.renderer.render(this.scene, this.camera);
    swapRenderTargets(this.velocity);

    this.materials.advect.uniforms.uVelocity.value = this.velocity[0].texture;
    this.materials.advect.uniforms.uSource.value = this.density[0].texture;
    this.materials.advect.uniforms.uTexelSize.value.set(1 / dyeRes, 1 / dyeRes);
    this.materials.advect.uniforms.uDissipation.value = 0.97;
    this.renderer.setRenderTarget(this.density[1]);
    this.renderer.render(this.scene, this.camera);
    swapRenderTargets(this.density);

    this.materials.divergence.uniforms.uVelocity.value = this.velocity[0].texture;
    this.quad.material = this.materials.divergence;
    this.renderer.setRenderTarget(this.divergence);
    this.renderer.render(this.scene, this.camera);

    this.materials.pressure.uniforms.uDivergence.value = this.divergence.texture;
    this.quad.material = this.materials.pressure;
    for (let iteration = 0; iteration < 5; iteration++) {
      this.materials.pressure.uniforms.uPressure.value = this.pressure[0].texture;
      this.renderer.setRenderTarget(this.pressure[1]);
      this.renderer.render(this.scene, this.camera);
      swapRenderTargets(this.pressure);
    }

    this.materials.gradientSubtract.uniforms.uPressure.value = this.pressure[0].texture;
    this.materials.gradientSubtract.uniforms.uVelocity.value = this.velocity[0].texture;
    this.quad.material = this.materials.gradientSubtract;
    this.renderer.setRenderTarget(this.velocity[1]);
    this.renderer.render(this.scene, this.camera);
    swapRenderTargets(this.velocity);

    this.renderer.setRenderTarget(this.pressure[1]);
    this.renderer.clear();
    swapRenderTargets(this.pressure);
  }

  dispose(): void {
    this.velocity.forEach(target => target.dispose());
    this.density.forEach(target => target.dispose());
    this.pressure.forEach(target => target.dispose());
    this.divergence.dispose();
    Object.values(this.materials).forEach(material => material.dispose());
    this.quad.geometry.dispose();
  }
}

export class ParticleSim {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  readonly quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));

  targets: RenderTargetPair;
  originTarget: THREE.WebGLRenderTarget;
  readonly material: THREE.ShaderMaterial;

  constructor(private readonly renderer: THREE.WebGLRenderer, size: number) {
    const createTarget = () =>
      new THREE.WebGLRenderTarget(size, size, {
        type: THREE.FloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false
      });

    this.targets = [createTarget(), createTarget()];
    this.originTarget = createTarget();

    const initialPositions = new Float32Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      initialPositions[i * 4 + 0] = (Math.random() * 2 - 1) * 0.7;
      initialPositions[i * 4 + 1] = (Math.random() * 2 - 1) * 0.7;
      initialPositions[i * 4 + 2] = (Math.random() * 2 - 1) * 0.7;
      initialPositions[i * 4 + 3] = 1;
    }
    const seedTexture = new THREE.DataTexture(
      initialPositions,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    seedTexture.needsUpdate = true;

    const copyMaterial = new THREE.ShaderMaterial({
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.copyShader,
      uniforms: { uTexture: { value: seedTexture } }
    });

    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
    this.quad.material = copyMaterial;

    this.renderer.setRenderTarget(this.targets[0]);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(this.originTarget);
    this.renderer.render(this.scene, this.camera);

    copyMaterial.dispose();
    seedTexture.dispose();

    this.material = new THREE.ShaderMaterial({
      vertexShader: Shaders.simVertexShader,
      fragmentShader: Shaders.particleSimShader,
      uniforms: {
        uPos: { value: null },
        uOrigin: { value: this.originTarget.texture },
        uFluidVel: { value: null },
        uFluidDen: { value: null },
        uTime: { value: 0 },
        uHZ: { value: 1 },
        uProjectionMatrix: { value: new THREE.Matrix4() },
        uModelMatrix: { value: new THREE.Matrix4() },
        uViewMatrix: { value: new THREE.Matrix4() }
      }
    });
  }

  update(
    time: number,
    hz: number,
    fluid: FluidSim,
    camera: THREE.Camera,
    model: THREE.Object3D
  ): void {
    this.material.uniforms.uPos.value = this.targets[0].texture;
    this.material.uniforms.uFluidVel.value = fluid.velocity[0].texture;
    this.material.uniforms.uFluidDen.value = fluid.density[0].texture;
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uHZ.value = hz;
    this.material.uniforms.uProjectionMatrix.value.copy(camera.projectionMatrix);
    this.material.uniforms.uViewMatrix.value.copy(camera.matrixWorldInverse);
    this.material.uniforms.uModelMatrix.value.copy(model.matrixWorld);

    this.quad.material = this.material;
    this.renderer.setRenderTarget(this.targets[1]);
    this.renderer.render(this.scene, this.camera);
    swapRenderTargets(this.targets);
  }

  dispose(): void {
    this.targets.forEach(target => target.dispose());
    this.originTarget.dispose();
    this.material.dispose();
    this.quad.geometry.dispose();
  }
}

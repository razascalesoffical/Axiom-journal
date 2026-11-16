export const simVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const copyShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main() {
    gl_FragColor = texture2D(uTexture, vUv);
  }
`;

export const splatShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTarget;
  uniform float uAspect;
  uniform vec2 uPoint;
  uniform vec3 uColor;
  uniform float uRadius;

  void main() {
    vec2 p = vUv - uPoint;
    p.x *= uAspect;
    float d = exp(-dot(p, p) / uRadius);
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + d * uColor, 1.0);
  }
`;

export const advectShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 uTexelSize;
  uniform float uDt;
  uniform float uDissipation;

  void main() {
    vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
    gl_FragColor = uDissipation * texture2D(uSource, coord);
  }
`;

export const divergenceShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uVelocity;
  uniform vec2 uTexelSize;

  void main() {
    float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
    float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`;

export const pressureShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform vec2 uTexelSize;

  void main() {
    float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
    float div = texture2D(uDivergence, vUv).x;
    float p = (L + R + B + T - div) * 0.25;
    gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
  }
`;

export const gradientSubtractShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform vec2 uTexelSize;

  void main() {
    float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity -= 0.5 * vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

export const particleSimShader = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uPos;
  uniform sampler2D uOrigin;
  uniform sampler2D uFluidVel;
  uniform sampler2D uFluidDen;
  uniform float uTime;
  uniform float uHZ;
  uniform mat4 uProjectionMatrix;
  uniform mat4 uModelMatrix;
  uniform mat4 uViewMatrix;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - p.xzw * n_;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p2), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);
    float p_x0 = snoise(p - dx);
    float p_x1 = snoise(p + dx);
    float p_y0 = snoise(p - dy);
    float p_y1 = snoise(p + dy);
    float p_z0 = snoise(p - dz);
    float p_z1 = snoise(p + dz);
    float x = p_y1 - p_y0 - (p_z1 - p_z0);
    float y = p_z1 - p_z0 - (p_x1 - p_x0);
    float z = p_x1 - p_x0 - (p_y1 - p_y0);
    return normalize(vec3(x, y, z) / (2.0 * e));
  }

  float sdfShape(vec3 p) {
    p.z = sqrt(p.z * p.z + 0.0215) - sqrt(0.012);

    // Rodrigues quaternion rotation by q = (0.5, 0.5, 0.5, 0.5)
    vec3 q = vec3(0.5, 0.5, 0.5);
    float qw = 0.5;
    p = p + 2.0 * cross(q, cross(q, p) + qw * p);

    float r = length(p.xy);
    float torus = length(vec2(r - 0.45, p.z)) - 0.18;
    float hole = length(p - vec3(0.35, 0.35, 0.2)) - 0.3;
    float lobes = sin(p.x * 5.0) * sin(p.y * 5.0) * sin(p.z * 5.0) * 0.05;
    float d = max(torus + lobes, -hole);

    if (length(p) > 0.8) d = length(p) - 0.7;
    return d;
  }

  vec3 sdfNormal(vec3 p) {
    const float e = 0.001;
    return normalize(vec3(
      sdfShape(p + vec3(e, 0, 0)) - sdfShape(p - vec3(e, 0, 0)),
      sdfShape(p + vec3(0, e, 0)) - sdfShape(p - vec3(0, e, 0)),
      sdfShape(p + vec3(0, 0, e)) - sdfShape(p - vec3(0, 0, e))
    ));
  }

  void main() {
    vec3 pos = texture2D(uPos, vUv).xyz;
    vec3 origin = texture2D(uOrigin, vUv).xyz;

    if (length(pos) > 2.0) pos = origin;

    pos += curlNoise(pos * 0.1 + uTime * 0.05) * 0.0002 * uHZ;

    vec3 grad = sdfNormal(pos);
    float sdf = sdfShape(pos);
    pos += cross(normalize(pos + 0.001), normalize(grad + 0.001)) * 0.0005;
    pos += -grad * sdf * 0.5;
    pos += (origin - pos) * 0.0002 * uHZ;

    vec4 projected = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vec2 screenUV = (projected.xy / projected.w) * 0.5 + 0.5;

    if (screenUV.x >= 0.0 && screenUV.x <= 1.0 && screenUV.y >= 0.0 && screenUV.y <= 1.0) {
      vec3 flow = vec3(texture2D(uFluidVel, screenUV).xy, 0.0);
      pos += flow * 0.0001 * uHZ * 0.4 * texture2D(uFluidDen, screenUV).r;
    }

    gl_FragColor = vec4(pos, 1.0);
  }
`;

export const particleRenderVertexShader = `
  attribute vec4 random;
  uniform sampler2D uPosTexture;
  uniform float uDPR;
  uniform float uTime;
  varying vec4 vRandom;
  varying float vDist;

  void main() {
    vRandom = random;
    vec3 pos = texture2D(uPosTexture, position.xy).xyz;
    float sizeScale = mix(1.0, 1.5, pow(random.y, 150.0));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = length(mvPosition.xyz);
    vDist = dist;

    float scale = smoothstep(3.0, 15.0, dist) * mix(0.5, 1.0, random.z);
    gl_PointSize = 0.04 * uDPR * 2.0 * scale * (1000.0 / dist) * sizeScale;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleRenderFragmentShader = `
  precision highp float;
  varying vec4 vRandom;
  varying float vDist;
  uniform float uTime;
  uniform sampler2D uMatcap;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float distSq = dot(uv, uv);
    if (distSq > 0.25) discard;

    float randomZ = vRandom.z;

    vec3 color = mix(vec3(0.0), vec3(0.2, 0.17, 0.16), vRandom.x);
    vec3 creamColor = vec3(0.96, 0.92, 0.82);
    vec3 crimsonColor = vec3(0.92, 0.12, 0.20);
    vec3 accentColor = mix(crimsonColor, creamColor, vRandom.w);

    color = mix(color, accentColor, pow(randomZ, 50.0));

    float sparkle = 0.5 + (0.4 + sin(uTime * 4.0 + vRandom.y * 20.0)) * pow(randomZ, 10.0) * 2.5;
    color *= sparkle;

    vec3 normal = normalize(vec3(uv * 2.0, sqrt(max(0.0, 1.0 - distSq * 4.0))));

    float angle = sin(uTime + randomZ * 20.0) * 0.5 + 1.0;
    float s = sin(angle);
    float c = cos(angle);
    vec2 matcapUv = (mat2(c, -s, s, c) * normal.xy) * 0.5 + 0.5;
    vec3 matcapColor = texture2D(uMatcap, matcapUv).rgb;

    color = mix(color, color * matcapColor * 2.0, 0.8);

    gl_FragColor = vec4(color, 1.0);
  }
`;

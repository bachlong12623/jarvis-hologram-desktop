export const hologramVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

export const hologramFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uFresnelPower;
  uniform float uScanlineSpeed;
  uniform float uScanlineDensity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), uFresnelPower);

    float scanline = sin((gl_FragCoord.y + uTime * uScanlineSpeed * 80.0) * uScanlineDensity) * 0.5 + 0.5;
    scanline = mix(0.75, 1.0, scanline);

    float dataBand = step(0.92, fract(vUv.y * 24.0 - uTime * uScanlineSpeed * 2.0));
    float hexPattern = step(0.85, sin(vUv.x * 80.0) * sin(vUv.y * 80.0));

    float flicker = 1.0 - random(vec2(floor(uTime * 12.0), 0.0)) * 0.02;

    vec3 rimColor = mix(uColor, vec3(0.95, 0.98, 1.0), fresnel * 0.7);
    vec3 color = rimColor * fresnel * scanline * flicker;
    color += uColor * dataBand * fresnel * 0.4;
    color += vec3(0.3, 0.6, 1.0) * hexPattern * fresnel * 0.08;

    float alpha = fresnel * uOpacity * flicker;
    alpha += dataBand * fresnel * 0.15;

    gl_FragColor = vec4(color, alpha);
  }
`

export const circuitVertex = /* glsl */ `
  varying vec2 vUv;
  varying float vFade;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    float dist = length(worldPos.xz);
    vFade = 1.0 - smoothstep(2.0, 8.0, dist);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export const circuitFragment = /* glsl */ `
  uniform float uTime;

  varying vec2 vUv;
  varying float vFade;

  float grid(vec2 uv, float width) {
    vec2 g = abs(fract(uv - 0.5) - 0.5);
    float line = min(g.x, g.y);
    return 1.0 - smoothstep(0.0, width, line);
  }

  float trace(vec2 uv, float speed, float offset) {
    float t = fract(uv.x * 0.5 - uTime * speed + offset);
    return smoothstep(0.0, 0.08, t) * smoothstep(0.25, 0.08, t);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * 30.0;

    float baseGrid = grid(uv, 0.03);
    float majorGrid = grid(uv * 0.25, 0.02);

    float hTrace = trace(uv.yx + vec2(0.0, 3.0), 0.4, 0.0);
    float vTrace = trace(uv.xy + vec2(5.0, 0.0), 0.3, 0.5);
    float pulse = hTrace + vTrace;

    vec3 color = vec3(0.15, 0.45, 0.85) * baseGrid * 0.5;
    color += vec3(0.2, 0.55, 0.95) * majorGrid * 0.35;
    color += vec3(0.4, 0.8, 1.0) * pulse * 0.6;

    float alpha = (baseGrid * 0.2 + majorGrid * 0.15 + pulse * 0.5) * vFade;
    gl_FragColor = vec4(color, alpha);
  }
`

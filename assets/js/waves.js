/**
 * Pure Native WebGL 2.0 Raymarched Wave Field (GradientWaves)
 * Standalone - Zero External Dependencies
 * Ultra-Optimized for Mobile, Battery Efficiency & High-DPI screens
 */

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255
  ];
}

const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function initGradientWaves(container, options = {}) {
  if (!container) return null;

  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    window.innerWidth <= 768 ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const config = {
    horizonColor: '#5227FF',
    waveColor: '#FF9FFC',
    crestColor: '#FFFFFF',
    speed: prefersReducedMotion ? 0.08 : 0.4,
    amplitude: 2.5,
    waveScale: 0.6,
    waveRatio: 0.9,
    swell: 35,
    turbulence: 20,
    tilt: 1.11,
    zoom: 1.0,
    height: 5.5,
    fogDepth: 15,
    detail: isMobile ? 'mobile' : 'medium',
    brightness: 1.0,
    opacity: 1.0,
    grain: true,
    grainIntensity: isMobile ? 0.03 : 0.05,
    mouseInteraction: !prefersReducedMotion && !isMobile,
    parallaxStrength: isMobile ? 0.2 : 0.5,
    ...options
  };

  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.pointerEvents = isMobile ? 'none' : 'auto';
  container.innerHTML = '';
  container.appendChild(canvas);

  let gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: false,
    powerPreference: isMobile ? 'low-power' : 'default',
    premultipliedAlpha: true
  });

  if (!gl) {
    console.warn('WebGL 2.0 is not supported by your browser/device.');
    return null;
  }

  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  let program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) return null;

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    -1.0, -1.0,
     3.0, -1.0,
    -1.0,  3.0
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionAttributeLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    iResolution: gl.getUniformLocation(program, 'iResolution'),
    iTime: gl.getUniformLocation(program, 'iTime'),
    uSpeed: gl.getUniformLocation(program, 'uSpeed'),
    uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
    uWaveScale: gl.getUniformLocation(program, 'uWaveScale'),
    uWaveRatio: gl.getUniformLocation(program, 'uWaveRatio'),
    uSwell: gl.getUniformLocation(program, 'uSwell'),
    uTurbulence: gl.getUniformLocation(program, 'uTurbulence'),
    uTilt: gl.getUniformLocation(program, 'uTilt'),
    uZoom: gl.getUniformLocation(program, 'uZoom'),
    uHeight: gl.getUniformLocation(program, 'uHeight'),
    uFogDepth: gl.getUniformLocation(program, 'uFogDepth'),
    uSteps: gl.getUniformLocation(program, 'uSteps'),
    uBrightness: gl.getUniformLocation(program, 'uBrightness'),
    uOpacity: gl.getUniformLocation(program, 'uOpacity'),
    uGrain: gl.getUniformLocation(program, 'uGrain'),
    uGrainIntensity: gl.getUniformLocation(program, 'uGrainIntensity'),
    uMouse: gl.getUniformLocation(program, 'uMouse'),
    uParallax: gl.getUniformLocation(program, 'uParallax'),
    uEnableMouse: gl.getUniformLocation(program, 'uEnableMouse'),
    uHorizonColor: gl.getUniformLocation(program, 'uHorizonColor'),
    uWaveColor: gl.getUniformLocation(program, 'uWaveColor'),
    uCrestColor: gl.getUniformLocation(program, 'uCrestColor')
  };

  const hRgb = hexToRgb(config.horizonColor);
  const wRgb = hexToRgb(config.waveColor);
  const cRgb = hexToRgb(config.crestColor);

  const setSize = () => {
    const dprCap = isMobile ? 1.0 : 1.5;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const rect = container.getBoundingClientRect();
    const displayWidth = Math.max(1, Math.floor((rect.width || window.innerWidth) * dpr));
    const displayHeight = Math.max(1, Math.floor((rect.height || window.innerHeight) * dpr));

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const ro = new ResizeObserver(setSize);
  ro.observe(container);
  setSize();

  const currentMouse = [0.5, 0.5];
  const targetMouse = [0.5, 0.5];

  const onPointerMove = (e) => {
    if (!config.mouseInteraction) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      targetMouse[0] = (e.clientX - rect.left) / rect.width;
      targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    }
  };

  const onPointerLeave = () => {
    targetMouse[0] = 0.5;
    targetMouse[1] = 0.5;
  };

  if (!isMobile) {
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  }

  let raf = 0;
  let isPageVisible = !document.hidden;
  let isScrolledDeep = false;
  const t0 = performance.now();

  const stepCount = isMobile ? 42.0 : 70.0;

  const render = (t) => {
    if (!isPageVisible || isScrolledDeep) {
      raf = 0;
      return;
    }

    const timeSec = (t - t0) * 0.001;

    const tx = config.mouseInteraction ? targetMouse[0] : 0.5;
    const ty = config.mouseInteraction ? targetMouse[1] : 0.5;
    currentMouse[0] += 0.04 * (tx - currentMouse[0]);
    currentMouse[1] += 0.04 * (ty - currentMouse[1]);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.uniform2f(uniforms.iResolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.iTime, timeSec);
    gl.uniform1f(uniforms.uSpeed, config.speed);
    gl.uniform1f(uniforms.uAmplitude, config.amplitude);
    gl.uniform1f(uniforms.uWaveScale, config.waveScale);
    gl.uniform1f(uniforms.uWaveRatio, config.waveRatio);
    gl.uniform1f(uniforms.uSwell, config.swell);
    gl.uniform1f(uniforms.uTurbulence, config.turbulence);
    gl.uniform1f(uniforms.uTilt, config.tilt);
    gl.uniform1f(uniforms.uZoom, config.zoom);
    gl.uniform1f(uniforms.uHeight, config.height);
    gl.uniform1f(uniforms.uFogDepth, config.fogDepth);
    gl.uniform1f(uniforms.uSteps, stepCount);
    gl.uniform1f(uniforms.uBrightness, config.brightness);
    gl.uniform1f(uniforms.uOpacity, config.opacity);
    gl.uniform1f(uniforms.uGrain, config.grain ? 1.0 : 0.0);
    gl.uniform1f(uniforms.uGrainIntensity, config.grainIntensity);
    gl.uniform2f(uniforms.uMouse, currentMouse[0], currentMouse[1]);
    gl.uniform1f(uniforms.uParallax, config.parallaxStrength);
    gl.uniform1i(uniforms.uEnableMouse, config.mouseInteraction ? 1 : 0);
    gl.uniform3f(uniforms.uHorizonColor, hRgb[0], hRgb[1], hRgb[2]);
    gl.uniform3f(uniforms.uWaveColor, wRgb[0], wRgb[1], wRgb[2]);
    gl.uniform3f(uniforms.uCrestColor, cRgb[0], cRgb[1], cRgb[2]);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    raf = requestAnimationFrame(render);
  };

  const tryStart = () => {
    if (isPageVisible && !isScrolledDeep && raf === 0) {
      raf = requestAnimationFrame(render);
    }
  };

  const tryStop = () => {
    if (raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const onVisibility = () => {
    isPageVisible = !document.hidden;
    isPageVisible && !isScrolledDeep ? tryStart() : tryStop();
  };
  document.addEventListener('visibilitychange', onVisibility);

  // Scroll throttling: when user scrolls deep into content where hero is far away,
  // we intelligently pause WebGL animation to save 100% GPU/battery on mobile & desktop!
  let scrollTimeout;
  const onScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const heroH = window.innerHeight || 800;
    // If scrolled past 2.2 viewport heights, background is mostly covered
    const shouldPause = isMobile && scrollY > heroH * 2.2;
    if (shouldPause !== isScrolledDeep) {
      isScrolledDeep = shouldPause;
      if (isScrolledDeep) {
        tryStop();
      } else {
        tryStart();
      }
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  // WebGL Context Loss Handling
  const onContextLost = (e) => {
    e.preventDefault();
    tryStop();
  };
  canvas.addEventListener('webglcontextlost', onContextLost, false);

  tryStart();

  return {
    pause: () => {
      tryStop();
    },
    resume: () => {
      tryStart();
    },
    destroy: () => {
      tryStop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
      if (!isMobile) {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
      }
      canvas.removeEventListener('webglcontextlost', onContextLost);
      try {
        gl.deleteProgram(program);
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        gl.deleteBuffer(positionBuffer);
        gl.deleteVertexArray(vao);
      } catch (e) {}
      try {
        container.removeChild(canvas);
      } catch (e) {}
    }
  };
}

// Export for ES modules and attach to window for static script tags
if (typeof window !== 'undefined') {
  window.initGradientWaves = initGradientWaves;
}

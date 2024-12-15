precision mediump float;

uniform vec2 uResolution;
uniform float uGridSize;
uniform float uGridLineWidth;
uniform float uGlowIntensity;
uniform float uTime;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;

void main() {
    vec2 uv = vUv;

    // Grid lines
    float gridX = abs(fract(uv.x * uGridSize) - 0.5);
    float gridY = abs(fract(uv.y * uGridSize) - 0.5);
    float gridMask = step(uGridLineWidth, min(gridX, gridY));

    // Depth-based glow effect
    float glowFactor = 1.0 - smoothstep(0.0, uGlowIntensity, gridX) * smoothstep(0.0, uGlowIntensity, gridY);
    glowFactor *= pow(max(0.0, dot(vViewDirection, vec3(0.0, 1.0, 0.0))), 2.0);

    // Final color
    vec3 color = vec3(0.2, 0.8, 0.8) * gridMask * glowFactor;

    gl_FragColor = vec4(color, 1.0);
}

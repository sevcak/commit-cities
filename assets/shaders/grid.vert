precision highp float;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform vec2 uResolution;
uniform float uGridSize;
uniform float uGridLineWidth;
uniform float uGlowIntensity;
uniform float uTime;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vViewDirection;

void main() {
    vUv = aTexCoord;
    vWorldPosition = (uModelViewMatrix * vec4(aPosition, 1.0)).xyz;
    vViewDirection = normalize(-vWorldPosition);

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}

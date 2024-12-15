precision mediump float;

uniform mat4 uModelViewProjectionMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat3 uNormalMatrix;
uniform float uTime;
uniform float uGlitchSpeed;
uniform float uGlitchIntensity;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 vVertexWorldPos;
varying vec3 vVertexModelPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec2 vTexCoord;

void main() {
    vec4 modelSpacePos = vec4(aPosition, 1.0);

    vVertexWorldPos = (uModelMatrix * modelSpacePos).xyz;
    vVertexModelPos = modelSpacePos.xyz;
    vTexCoord = aTexCoord;
    vWorldNormal = normalize(uNormalMatrix * aNormal);
    vViewDir = normalize(-(uViewMatrix * modelSpacePos).xyz);

    vec3 outPosition = (uModelMatrix * modelSpacePos).xyz;

    // Glitch effect
    outPosition.x += uGlitchIntensity * 
        step(0.5, sin(uTime * 2.0 + aPosition.y * 1.0)) * 
        step(0.99, sin(uTime * uGlitchSpeed * 0.5));

    gl_Position = uModelViewProjectionMatrix * modelSpacePos;
}

precision mediump float;

uniform float uTime;
uniform vec4 uMainColor;
uniform sampler2D uMainTexture;
uniform float uBarSpeed;
uniform float uBarDistance;
uniform float uAlpha;
uniform float uFlickerSpeed;
uniform vec4 uRimColor;
uniform float uRimPower;
uniform float uGlowSpeed;
uniform float uGlowDistance;

varying vec3 vVertexWorldPos;
varying vec3 vVertexModelPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
varying vec2 vTexCoord;

float rand(float n){
    return fract(sin(n) * 43758.5453123);
}

float noise(float p){
    float fl = floor(p);
    float fc = fract(p);
    return mix(rand(fl), rand(fl + 1.0), fc);
}

void main() {
    // Texture
    vec4 texColor = vec4(1.0);
    #ifdef ISTEXTURED
        texColor = texture2D(uMainTexture, vTexCoord);
    #endif

    // Scan effect
    float bars = 0.0;
    bars = step(fract(uTime * uBarSpeed + vVertexWorldPos.y * uBarDistance), 0.5) * 0.65;

    // Alpha
    float alpha = uAlpha;

    // Flickering
    float flicker = clamp(noise(uTime * uFlickerSpeed), 0.65, 1.0);

    // Rim lighting
    float rim = 1.0 - clamp(dot(vViewDir, vWorldNormal), 0.0, 1.0);
    vec4 rimColor = uRimColor * pow(rim, uRimPower);

    // Glow
    float tempGlow = vVertexWorldPos.y * uGlowDistance - uTime * uGlowSpeed;
    float glow = fract(tempGlow);
    
    vec4 color = texColor * uMainColor + rimColor + (glow * 0.35 * uMainColor);
    color.a = texColor.a * alpha * (bars + rim + glow) * flicker;
    
    gl_FragColor = color;
}

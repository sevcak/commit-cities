#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uTexture;
varying vec2 vTexCoord;

void main() {
    // Sample the texture color
    vec4 texColor = texture2D(uTexture, vTexCoord);

    // Output the texture color as the emission
    gl_FragColor = texColor;
}

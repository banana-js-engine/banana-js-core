#version 300 es

in vec4 a_Position;
in vec2 a_FragCoord;
in vec4 a_Color;
in float a_Thickness;
in float a_Fade;

out vec2 v_FragCoord;
out vec4 v_Color;
out float v_Thickness;
out float v_Fade;

uniform mat4 u_ViewProjectionMatrix;

void main() {
    v_FragCoord = a_FragCoord;
    v_Color = a_Color;
    v_Thickness = a_Thickness;
    v_Fade = a_Fade;

    gl_Position = u_ViewProjectionMatrix * a_Position;
}

$#version 300 es

precision mediump float;

in vec2 v_FragCoord;
in vec4 v_Color;
in float v_Thickness;
in float v_Fade;

out vec4 fragColor;

void main() {
    float distance = 1.0 - length(v_FragCoord);
    float circle = smoothstep(0.0, v_Fade, distance);
    circle *= smoothstep(v_Thickness + v_Fade, v_Thickness, distance);

    if (circle == 0.0) {
        discard;
    }

    fragColor = v_Color;
    fragColor.a *= circle;
}
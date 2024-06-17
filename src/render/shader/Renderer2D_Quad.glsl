#version 300 es

in vec4 a_Position;
in vec2 a_TexCoord;
in float a_TexIndex;
in vec4 a_Color;

out vec2 v_TexCoord;
out float v_TexIndex;
out vec4 v_Color;

uniform mat4 u_ViewProjectionMatrix;

void main() {
    v_TexCoord = a_TexCoord;
    v_TexIndex = a_TexIndex;
    v_Color = a_Color;

    gl_Position = u_ViewProjectionMatrix * a_Position; 
}

$#version 300 es

precision mediump float;

in vec2 v_TexCoord;
in float v_TexIndex;
in vec4 v_Color;

uniform sampler2D u_Textures[16];

out vec4 fragColor;

void main() {
    vec4 l_Texture;
    int l_TexIndex = int(v_TexIndex);

    switch (l_TexIndex) {
        case 0:  l_Texture = texture(u_Textures[0],  v_TexCoord); break;
        case 1:  l_Texture = texture(u_Textures[1],  v_TexCoord); break;
        case 2:  l_Texture = texture(u_Textures[2],  v_TexCoord); break;
        case 3:  l_Texture = texture(u_Textures[3],  v_TexCoord); break;
        case 4:  l_Texture = texture(u_Textures[4],  v_TexCoord); break;
        case 5:  l_Texture = texture(u_Textures[5],  v_TexCoord); break;
        case 6:  l_Texture = texture(u_Textures[6],  v_TexCoord); break;
        case 7:  l_Texture = texture(u_Textures[7],  v_TexCoord); break;
        case 8:  l_Texture = texture(u_Textures[8],  v_TexCoord); break;
        case 9:  l_Texture = texture(u_Textures[9],  v_TexCoord); break;
        case 10: l_Texture = texture(u_Textures[10], v_TexCoord); break;
        case 11: l_Texture = texture(u_Textures[11], v_TexCoord); break;
        case 12: l_Texture = texture(u_Textures[12], v_TexCoord); break;
        case 13: l_Texture = texture(u_Textures[13], v_TexCoord); break;
        case 14: l_Texture = texture(u_Textures[14], v_TexCoord); break;
        case 15: l_Texture = texture(u_Textures[15], v_TexCoord); break;
    }

    fragColor = l_Texture * v_Color;
}
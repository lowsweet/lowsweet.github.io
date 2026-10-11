// Direct GLSL port of Kamera/UI/LUTThermalBackground.swift.
// Heatmap source: int-termal.learnframer.site (Framer University),
// originally linked to 21st.dev/community/components/aliimam/thermal-shader/default.
// Preserve the capsule mask, three shadow phases, noise, palette and 0.5 speed.
// Metal's top-left fragment coordinates are explicitly converted from WebGL's bottom-left.
export const KAMERA_THERMAL_PALETTE = new Float32Array([
  0, 0, 0,
  0, .66, .91,
  .69, .88, .97,
  1, .87, .51,
  1, .40, .05,
  .94, .44, .88,
  1, 1, 1,
]);

export const THERMAL_VERTEX_SHADER = `#version 300 es
const vec2 positions[3] = vec2[3](vec2(-1., -1.), vec2(3., -1.), vec2(-1., 3.));
void main() { gl_Position = vec4(positions[gl_VertexID], 0., 1.); }
`;

export const THERMAL_FRAGMENT_SHADER = `#version 300 es
precision highp float;
uniform vec4 u_params;
uniform vec3 u_palette[7];
out vec4 outColor;
#define TWO_PI 6.28318530718

float circle(vec2 uv, vec2 c, vec2 r) {
    float t = clamp((length(uv - c) - r[0]) / (r[1] - r[0]), 0.0, 1.0);
    return 1.0 - t * t * (3.0 - 2.0 * t);
}

float lst(float edge0, float edge1, float x) {
    return clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
}

float sst(float edge0, float edge1, float x) {
    float t = lst(edge0, edge1, x);
    return t * t * (3.0 - 2.0 * t);
}

float shadowShape(vec2 uv, float t, float contour) {
    vec2 scaledUV = uv;
    float posY = mix(-1., 2., t);

    scaledUV.y -= .5;
    float mainCircleScale = sst(0., .8, posY) * lst(1.4, .9, posY);
    scaledUV *= vec2(1., 1. + 1.5 * mainCircleScale);
    scaledUV.y += .5;

    float innerR = .4;
    float outerR = 1. - .3 * (sst(.1, .2, t) * (1. - sst(.2, .5, t)));
    float s = circle(scaledUV, vec2(.5, posY - .2), vec2(innerR, outerR));
    s = pow(s, 1.4);
    s *= 1.2;

    float topFlattener = 0.;
    {
        float pos = posY - uv.y;
        float edge = 1.2;
        topFlattener = lst(-.4, 0., pos) * (1. - sst(.0, edge, pos));
        topFlattener = pow(topFlattener, 3.);
        float topFlattenerMixer = (1. - sst(.0, .3, pos));
        s = mix(topFlattener, s, topFlattenerMixer);
    }

    {
        float visibility = sst(.6, .7, t) * (1. - sst(.8, .9, t));
        float angle = -2. - t * TWO_PI;
        float rightCircle = circle(uv, vec2(.95 - .2 * cos(angle), .4 - .1 * sin(angle)), vec2(.15, .3));
        rightCircle *= visibility;
        s = mix(s, 0., rightCircle);
    }

    {
        float topCircle = circle(uv, vec2(.5, .19), vec2(.05, .25));
        topCircle += 2. * contour * circle(uv, vec2(.5, .19), vec2(.2, .5));
        float visibility = .55 * sst(.2, .3, t) * (1. - sst(.3, .45, t));
        topCircle *= visibility;
        s = mix(s, 0., topCircle);
    }

    float leafMask = circle(uv, vec2(.53, .13), vec2(.08, .19));
    leafMask = mix(leafMask, 0., 1. - sst(.4, .54, uv.x));
    leafMask = mix(0., leafMask, sst(.0, .2, uv.y));
    leafMask *= (sst(.5, 1.1, posY) * sst(1.5, 1.3, posY));
    s += leafMask;

    {
        float visibility = sst(.0, .4, t) * (1. - sst(.6, .8, t));
        s = mix(s, 0., visibility * circle(uv, vec2(.52, .92), vec2(.09, .25)));
    }

    {
        float pos = sst(.0, .6, t) * (1. - sst(.6, 1., t));
        s = mix(s, .5, circle(uv, vec2(.0, 1.2 - .5 * pos), vec2(.1, .3)));
        s = mix(s, .0, circle(uv, vec2(1., .5 + .5 * pos), vec2(.1, .3)));

        s = mix(s, 1., circle(uv, vec2(.95, .2 + .2 * sst(.3, .4, t) * sst(.7, .5, t)), vec2(.07, .22)));
        s = mix(s, 1., circle(uv, vec2(.95, .2 + .2 * sst(.3, .4, t) * (1. - sst(.5, .7, t))), vec2(.07, .22)));
        s /= max(1e-4, sst(1., .85, uv.y));
    }

    s = clamp(s, 0., 1.);
    return s;
}

void main() {
    vec2 size = u_params.xy;
    vec2 uv = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y) / size;
    if (u_params.w > 0.5 && size.y > size.x) { uv = uv.yx; size = size.yx; }
    vec2 p = uv * size - size * 0.5;
    float radius = size.y * 0.5;
    vec2 q = vec2(max(abs(p.x) - (size.x - size.y) * 0.5, 0.0), p.y);
    float distance = length(q) - radius;
    // Analytic equivalents of the site's blurred black-on-white source mask.
    float innerBlur = 0.5 * exp(min(distance, 0.0) / (size.y * 0.15));
    float contour = 0.5 * exp(min(distance, 0.0) / (size.y * 0.018));
    float t = u_params.z * 0.1 - 0.3;
    float shadow = shadowShape(uv, fract(t), innerBlur);
    float shadowCopy = shadowShape(uv, fract(t + 1.0 / 3.0), innerBlur);
    float shadowCopy2 = shadowShape(uv, fract(t + 2.0 / 3.0), innerBlur);
    float inner = 0.8 + 0.8 * innerBlur;
    inner = mix(inner, 0.0, shadow);
    inner = mix(inner, 0.0, shadowCopy);
    inner = mix(inner, 0.0, shadowCopy2);
    inner += 0.8 * contour;
    float heat = pow(min(1.0, inner), 1.2);
    heat += 0.0225 * (fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);
    float mixer = clamp(heat, 0.0, 1.0) * 7.0;
    vec3 gradient = u_palette[0].rgb;
    for (int i = 1; i <= 7; i++) {
        gradient = mix(gradient, u_palette[i - 1].rgb, clamp(mixer - float(i - 1), 0.0, 1.0));
    }
    vec3 color = mix(u_palette[0].rgb, gradient, clamp(mixer, 0.0, 1.0));
    color += 0.02 * (fract(sin(dot(uv + 1.0, vec2(12.9898, 78.233))) * 43758.5453123) - 0.5);
    outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
`;

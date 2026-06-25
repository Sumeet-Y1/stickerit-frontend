import { useEffect } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const vertexShaderSource = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShaderSource = `
varying vec2 vUv;
uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform sampler2D u_displacement;
uniform float u_progress;
uniform float u_time;
uniform float uIntensity;
uniform float u_random;

float cubicInOut(float value) {
  return value < 0.5
    ? 4.0 * value * value * value
    : 1.0 - pow(-2.0 * value + 2.0, 3.0) / 2.0;
}

void main() {
  vec3 displacementTexRGB = texture2D(u_displacement, vUv).rgb;
  vec3 displacementTex = displacementTexRGB * 2.0 - 1.0;

  float progress = clamp(u_progress, 0.0, 1.0);
  float easedProgress = cubicInOut(progress);

  float displFactor = uIntensity * (1.0 - progress);
  vec2 displ_vec = vec2(displacementTex.x, displacementTex.y);

  vec2 uv1 = vUv + (displ_vec * easedProgress * displFactor);
  vec2 uv2 = vUv - (displ_vec * (1.0 - easedProgress) * displFactor);

  vec3 tex1 = texture2D(u_texture1, uv1).rgb;
  vec3 tex2 = texture2D(u_texture2, uv2).rgb;

  vec3 color = tex1.rgb * (1.0 - progress) + tex2.rgb * progress;
  gl_FragColor = vec4(color, 1.0);
}
`;

function createSolidColorTexture(color: string): THREE.CanvasTexture {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = 2;
  tempCanvas.height = 2;
  const ctx = tempCanvas.getContext('2d')!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 2, 2);
  return new THREE.CanvasTexture(tempCanvas);
}

function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(url, (tex) => resolve(tex));
  });
}

export function useScrollTransition(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    const width = canvas.parentElement?.clientWidth || window.innerWidth;
    const height = canvas.parentElement?.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    let material: THREE.ShaderMaterial | null = null;
    let geometry: THREE.PlaneGeometry | null = null;
    let scrollTrigger: ScrollTrigger | null = null;
    let animationId: number = 0;

    const init = async () => {
      try {
        const [heroTexture, displacementTexture] = await Promise.all([
          loadTexture('/images/hero-pixel.jpg'),
          loadTexture('/images/displacement-map.jpg'),
        ]);

        heroTexture.wrapS = THREE.RepeatWrapping;
        heroTexture.wrapT = THREE.RepeatWrapping;
        displacementTexture.wrapS = THREE.RepeatWrapping;
        displacementTexture.wrapT = THREE.RepeatWrapping;

        material = new THREE.ShaderMaterial({
          vertexShader: vertexShaderSource,
          fragmentShader: fragmentShaderSource,
          transparent: true,
          uniforms: {
            u_texture1: { value: heroTexture },
            u_texture2: { value: createSolidColorTexture('#B5CEBC') },
            u_displacement: { value: displacementTexture },
            u_progress: { value: 0.0 },
            u_time: { value: 0.0 },
            uIntensity: { value: 0.35 },
            u_random: { value: 0.0 },
          },
        });

        geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const clock = new THREE.Clock();

        scrollTrigger = ScrollTrigger.create({
          trigger: canvas.parentElement,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate(self) {
            if (material) {
              material.uniforms.u_progress.value = self.progress;
            }
          },
        });

        const animate = () => {
          animationId = requestAnimationFrame(animate);
          if (material) {
            material.uniforms.u_time.value = clock.getElapsedTime();
          }
          renderer.render(scene, camera);
        };

        animate();
      } catch (err) {
        console.error('Failed to load textures:', err);
      }
    };

    init();

    const onResize = () => {
      const w = canvas.parentElement?.clientWidth || window.innerWidth;
      const h = canvas.parentElement?.clientHeight || window.innerHeight;
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      if (scrollTrigger) scrollTrigger.kill();
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (geometry) geometry.dispose();
      if (material) material.dispose();
    };
  }, [canvasRef]);
}

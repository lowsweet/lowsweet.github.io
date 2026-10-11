'use client';

import { useEffect, useRef } from 'react';
import { KAMERA_THERMAL_PALETTE, THERMAL_FRAGMENT_SHADER, THERMAL_VERTEX_SHADER } from '@/lib/shaders/kamera-thermal';
import './thermal-claim-fill.css';

/** Visual fill only: the parent link owns focus, text, sizing and interaction. */
export function ThermalClaimFill() {
  const fillRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    const canvas = canvasRef.current;
    if (!fill || !canvas) return;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
    if (!gl) { fill.dataset.renderMode = 'fallback'; return; }

    function compile(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        fill!.dataset.shaderError = gl!.getShaderInfoLog(shader) ?? 'Shader compilation failed';
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }
    const vertex = compile(gl.VERTEX_SHADER, THERMAL_VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, THERMAL_FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) {
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
      if (program) gl.deleteProgram(program);
      fill.dataset.renderMode = 'fallback';
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      fill.dataset.shaderError = gl.getProgramInfoLog(program) ?? 'Shader linking failed';
      gl.deleteProgram(program);
      fill.dataset.renderMode = 'fallback';
      return;
    }

    const params = gl.getUniformLocation(program, 'u_params');
    gl.useProgram(program);
    gl.uniform3fv(gl.getUniformLocation(program, 'u_palette[0]'), KAMERA_THERMAL_PALETTE);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedStatic = new URLSearchParams(window.location.search).get('motion') === 'static';
    const started = performance.now();
    let raf = 0;
    let lastDraw = -Infinity;
    let visible = true;
    let lost = false;
    let disposed = false;

    const phase = () => motion.matches || forcedStatic ? 8 : (performance.now() - started) / 1000 * .5 + 8;
    const draw = () => {
      if (lost || disposed) return;
      gl.useProgram(program);
      gl.uniform4f(params, canvas.width, canvas.height, phase(), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      canvas.style.opacity = '1';
    };
    const tick = (now: number) => {
      raf = 0;
      if (lost || disposed || document.hidden || !visible || motion.matches || forcedStatic) return;
      if (now - lastDraw >= 1000 / 24) {
        const elapsed = now - lastDraw;
        lastDraw = Number.isFinite(lastDraw) ? now - elapsed % (1000 / 24) : now;
        draw();
      }
      raf = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (disposed) return;
      if (lost) { fill.dataset.renderMode = 'fallback'; return; }
      draw();
      if (motion.matches || forcedStatic) fill.dataset.renderMode = 'still';
      else if (!document.hidden && visible) {
        fill.dataset.renderMode = 'animated';
        lastDraw = -Infinity;
        raf = requestAnimationFrame(tick);
      } else fill.dataset.renderMode = 'paused';
    };
    const resize = () => {
      const rect = fill.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      cancelAnimationFrame(raf);
      canvas.style.opacity = '0';
      fill.dataset.renderMode = 'fallback';
    };
    const sizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync(); });
    sizeObserver.observe(fill);
    visibilityObserver.observe(fill);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('resize', resize);
    motion.addEventListener('change', sync);
    canvas.addEventListener('webglcontextlost', onLost);
    resize();
    sync();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      sizeObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', resize);
      motion.removeEventListener('change', sync);
      canvas.removeEventListener('webglcontextlost', onLost);
      gl.useProgram(null);
      gl.deleteProgram(program);
    };
  }, []);

  return <span ref={fillRef} className="landing-thermal-fill" aria-hidden="true" data-render-mode="fallback"><canvas ref={canvasRef} /></span>;
}

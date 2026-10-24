"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Fundo 3D: um D20 grande e dados flutuando, nas cores do tema.
// É só decoração: não recebe cliques e fica escondido dos leitores de tela.
export default function Scene3D({ dim = false }: { dim?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return; // sem WebGL o site funciona normal, só sem o fundo
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 14);
    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(5, 8, 6);
    scene.add(sun);

    // Cores vindas das variáveis CSS do tema (atualizam quando o tema muda).
    const css = getComputedStyle(document.documentElement);
    const bodyMat = new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.55, metalness: 0.15 });
    const accentLine = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 });
    const cyanLine = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.8 });
    const applyTheme = () => {
      const v = (name: string) => css.getPropertyValue(name).trim();
      bodyMat.color.set(v("--surface-2"));
      accentLine.color.set(v("--accent"));
      cyanLine.color.set(v("--cyan"));
    };
    applyTheme();

    // D20 grande
    const d20Geo = new THREE.IcosahedronGeometry(3.2, 0);
    const hero = new THREE.Mesh(d20Geo, bodyMat);
    const heroEdges = new THREE.EdgesGeometry(d20Geo);
    hero.add(new THREE.LineSegments(heroEdges, accentLine));
    scene.add(hero);

    // Dados pequenos
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const count = window.innerWidth < 640 ? 7 : 14;
    const dice = Array.from({ length: count }, (_, i) => {
      const die = new THREE.Mesh(boxGeo, bodyMat);
      die.add(new THREE.LineSegments(boxEdges, i % 3 === 0 ? cyanLine : accentLine));
      die.scale.setScalar(0.5 + Math.random() * 0.9);
      die.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 14, -8 + Math.random() * 7);
      die.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      die.userData = {
        vx: (Math.random() - 0.5) * 0.006,
        vy: (Math.random() - 0.5) * 0.008,
        f: 0.3 + Math.random() * 0.5,
        p: Math.random() * 6,
        y: die.position.y,
      };
      scene.add(die);
      return die;
    });

    let heroY = 0;
    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const wide = w / h > 1;
      heroY = wide ? 0 : 5;
      hero.position.set(wide ? 6.5 : 0, heroY, -3);
      hero.scale.setScalar(wide ? 1 : 0.75);
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mx = 0;
    let my = 0;
    const clock = new THREE.Clock();
    let raf = 0;

    const draw = (t: number) => {
      hero.rotation.set(t * 0.1, t * 0.22, 0);
      hero.position.y = heroY + Math.sin(t * 0.6) * 0.3;
      for (const die of dice) {
        die.rotation.x += die.userData.vx;
        die.rotation.y += die.userData.vy;
        die.position.y = die.userData.y + Math.sin(t * die.userData.f + die.userData.p) * 0.4;
      }
      camera.position.x += (mx * 2 - camera.position.x) * 0.03;
      camera.position.y += (-my * 1.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    const loop = () => {
      draw(clock.getElapsedTime());
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !reduce) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      layout();
      if (reduce) draw(0);
    };
    const observer = new MutationObserver(() => {
      applyTheme();
      if (reduce) draw(0);
    });

    layout();
    draw(0);
    start(); // com "reduzir movimento" ligado, fica só o quadro parado
    window.addEventListener("resize", onResize);
    if (!reduce) window.addEventListener("pointermove", onMove);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
      d20Geo.dispose();
      heroEdges.dispose();
      boxGeo.dispose();
      boxEdges.dispose();
      bodyMat.dispose();
      accentLine.dispose();
      cyanLine.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 size-full transition-opacity duration-700 ${
        dim ? "opacity-25" : "opacity-85"
      }`}
    />
  );
}
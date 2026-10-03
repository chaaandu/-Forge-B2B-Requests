"use client";

import Link from "@/components/link";
import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Roll } from "@/components/layout/header";

/**
 * Idea 3 — "Printed, not rendered."
 *
 * The whole brand is paper: warm stock, two inks, drawings that look
 * stamped. So the line is printed on an actual sheet, lit from the upper
 * left, and the sheet behaves like paper — it breathes in a draught, and
 * your pointer presses into it and lets it spring back.
 *
 * three.js, a single plane, one shader. The ink is drawn to a canvas at
 * load so the type is the real Fraunces, not an approximation.
 */

const VERT = `
uniform float uTime;
uniform vec2  uPress;
uniform float uPressAmt;
varying vec2  vUv;
varying vec3  vNormal;
varying float vLift;

// How far the sheet stands off its flat plane at p.
float lift(vec2 p, float t) {
  float w = sin(p.x * 2.1 + t * 0.62) * 0.052
          + sin(p.y * 2.7 - t * 0.48) * 0.042
          + sin((p.x + p.y) * 1.6 + t * 0.81) * 0.028;
  // The corners are freer than the middle, the way a held sheet behaves.
  w *= 0.45 + length(p) * 0.55;
  // And the pointer presses a dent into it.
  float d = length(p - uPress);
  w -= exp(-d * d * 2.2) * uPressAmt * 0.3;
  return w;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  float h = lift(pos.xy, uTime);
  pos.z += h;
  vLift = h;

  // Normals from the surface itself, so the light reads the real shape.
  float e = 0.06;
  vec3 dx = vec3(e * 2.0, 0.0, lift(pos.xy + vec2(e, 0.0), uTime) - lift(pos.xy - vec2(e, 0.0), uTime));
  vec3 dy = vec3(0.0, e * 2.0, lift(pos.xy + vec2(0.0, e), uTime) - lift(pos.xy - vec2(0.0, e), uTime));
  vNormal = normalize(cross(dx, dy));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

const FRAG = `
uniform sampler2D uInk;
varying vec2  vUv;
varying vec3  vNormal;
varying float vLift;

void main() {
  vec4 ink = texture2D(uInk, vUv);

  // Warm key from the upper left, cool bounce from below right.
  vec3 key  = normalize(vec3(-0.42, 0.68, 0.70));
  vec3 fill = normalize(vec3(0.55, -0.45, 0.60));
  float d1 = clamp(dot(vNormal, key), 0.0, 1.0);
  float d2 = clamp(dot(vNormal, fill), 0.0, 1.0);
  float shade = 0.83 + d1 * 0.20 + d2 * 0.05;

  // Paper has a faint sheen where it turns towards you.
  float sheen = pow(clamp(vNormal.z, 0.0, 1.0), 9.0) * 0.035;

  // Stock takes the light; ink sits in it and barely shines.
  vec3 col = ink.rgb * shade + sheen * (1.0 - ink.a * 0.85);

  // The folds themselves darken a touch, like a crease catching.
  col *= 1.0 - clamp(-vLift, 0.0, 1.0) * 0.10;

  gl_FragColor = vec4(col, 1.0);
}`;

/** The line, printed: real Fraunces, drawn once at the size the sheet needs. */
function drawInk(w: number, h: number, family: string) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#f3ede3";
  g.fillRect(0, 0, w, h);

  const lines: { text: string; italic: boolean }[] = [
    { text: "Every gift here", italic: false },
    { text: "is someone’s", italic: false },
    { text: "first company.", italic: true },
  ];
  const size = Math.round(Math.min(h * 0.17, w * 0.085));
  const leading = size * 0.9;
  const top = h / 2 - leading;

  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((line, i) => {
    g.font = `${line.italic ? "italic " : ""}600 ${size}px ${family}`;
    g.fillStyle = line.italic ? "#452a74" : "#1b1421";
    g.fillText(line.text, w / 2, top + i * leading);
  });

  // The hand-drawn rule under the last line.
  const m = g.measureText("first company.");
  const y = top + 2 * leading + size * 0.44;
  g.strokeStyle = "#e4a7f3";
  g.lineWidth = Math.max(4, size * 0.045);
  g.lineCap = "round";
  g.beginPath();
  const x0 = w / 2 - m.width / 2;
  const x1 = w / 2 + m.width / 2;
  g.moveTo(x0, y);
  g.bezierCurveTo(x0 + (x1 - x0) * 0.3, y - size * 0.05, x0 + (x1 - x0) * 0.6, y + size * 0.05, x1, y - size * 0.01);
  g.stroke();
  return c;
}

export function PaperHero({ founders, brands }: { founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    const section = root.current;
    if (!host || !section) return;
    let stop = () => {};
    let live = true;

    (async () => {
      const THREE = await import("three");
      await document.fonts.ready;
      if (!live) return;

      const family = getComputedStyle(section.querySelector("[data-face]")!).fontFamily || "serif";
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.setSize(host.clientWidth, host.clientHeight);
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      let ink = new THREE.CanvasTexture(drawInk(2560, 1280, family));
      ink.colorSpace = THREE.SRGBColorSpace;
      ink.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const uniforms = {
        uTime: { value: 0 },
        uInk: { value: ink },
        uPress: { value: new THREE.Vector2(9, 9) },
        uPressAmt: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms });
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 150, 100), material);
      scene.add(sheet);

      let plane = { w: 1, h: 1 };
      const size = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        // Make the sheet a little larger than the view, so no edge shows and
        // the paper reads as the surface of the page.
        const vh = 2 * Math.tan(((camera.fov / 2) * Math.PI) / 180) * camera.position.z;
        const vw = vh * camera.aspect;
        plane = { w: vw * 1.18, h: vh * 1.18 };
        sheet.geometry.dispose();
        sheet.geometry = new THREE.PlaneGeometry(plane.w, plane.h, 150, 100);
        // Reprint the ink at the surface's own shape, so type never stretches.
        const tw = 2800;
        const th = Math.round((tw * plane.h) / plane.w);
        ink.dispose();
        ink = new THREE.CanvasTexture(drawInk(tw, th, family));
        ink.colorSpace = THREE.SRGBColorSpace;
        ink.anisotropy = renderer.capabilities.getMaxAnisotropy();
        uniforms.uInk.value = ink;
      };
      size();

      const aim = { x: 0, y: 0, press: 0 };
      const now = { x: 0, y: 0, press: 0 };
      const onMove = (e: PointerEvent) => {
        const r = host.getBoundingClientRect();
        aim.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        aim.y = -((e.clientY - r.top) / r.height - 0.5) * 2;
        aim.press = 1;
      };
      const onLeave = () => (aim.press = 0);
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);

      const still = reducedMotion();
      const t0 = performance.now();
      let seen = true;
      const io = new IntersectionObserver(([e]) => void (seen = e.isIntersecting));
      io.observe(host);

      const tick = () => {
        if (!seen) return;
        now.x += (aim.x - now.x) * 0.07;
        now.y += (aim.y - now.y) * 0.07;
        now.press += (aim.press - now.press) * 0.06;
        uniforms.uTime.value = still ? 1.2 : (performance.now() - t0) / 1000;
        uniforms.uPress.value.set((now.x * plane.w) / 2, (now.y * plane.h) / 2);
        uniforms.uPressAmt.value = now.press;
        // The sheet turns a little towards you, as if held.
        sheet.rotation.y = now.x * 0.045;
        sheet.rotation.x = now.y * 0.035;
        renderer.render(scene, camera);
      };
      if (still) {
        tick();
      } else {
        gsap.ticker.add(tick);
      }
      window.addEventListener("resize", size);

      stop = () => {
        gsap.ticker.remove(tick);
        io.disconnect();
        window.removeEventListener("resize", size);
        section.removeEventListener("pointermove", onMove);
        section.removeEventListener("pointerleave", onLeave);
        ink.dispose();
        sheet.geometry.dispose();
        (sheet.material as { dispose(): void }).dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      live = false;
      stop();
    };
  }, []);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const el = root.current!;
      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(el.querySelector("[data-sheet]"), { opacity: 0, scale: 0.94, y: 30, duration: 1.6 })
          .from(el.querySelectorAll("[data-foot] > *"), { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.5);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate hidden min-h-[calc(100svh-4rem)] overflow-hidden bg-paper md:block">
      {/* The real line, for readers and for search; the sheet is the picture of it. */}
      <h1 data-face className="font-display sr-only">
        Every gift here is someone’s first company.
      </h1>

      <div data-sheet ref={mount} aria-hidden className="absolute inset-0 [&>canvas]:!h-full [&>canvas]:!w-full" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1500px] flex-col justify-end px-8 pb-10 pt-4">
        <div data-foot className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-sm text-lg leading-snug text-ink/70">
            {founders}&nbsp;student founders. {brands}&nbsp;brands. Printed, not stocked.
          </p>
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group inline-flex items-center gap-3 justify-self-center rounded-full bg-aubergine px-8 py-5 text-base font-semibold text-paper transition-colors hover:bg-violet"
          >
            <Roll>Start gifting</Roll>
          </Link>
          <a
            href="#founders"
            onClick={(e) => {
              const lenis = getLenis();
              if (!lenis) return;
              e.preventDefault();
              lenis.scrollTo("#founders", { offset: -40, duration: 1.6 });
            }}
            className="group inline-flex items-center gap-2 justify-self-center text-sm font-semibold text-ink/70 hover:text-ink md:justify-self-end"
          >
            <Roll>Meet the founders</Roll>
            <span className="grid size-10 place-items-center rounded-full border border-ink/20 transition group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
              <ArrowDown className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

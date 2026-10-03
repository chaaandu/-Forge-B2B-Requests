"use client";

import Link from "@/components/link";
import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap, reducedMotion, useGSAP } from "@/components/motion/gsap";
import { INTRO_DONE } from "@/components/motion/preloader";
import { getLenis } from "@/components/motion/smooth-scroll";
import { Roll } from "@/components/layout/header";
import { buildCollage } from "./collage";

/**
 * Idea 2 — "Reach in."
 *
 * The cohort fills the screen as one dark, slow-moving surface, and the
 * pointer pushes through it like a hand through water: the faces under
 * your cursor swell and separate, the colour splits a little at the edge
 * of the ripple, and it heals behind you.
 *
 * Hand-written WebGL2: one quad, one texture, one pass. No library, and
 * the whole effect is a dozen lines of shader, so it holds 60fps on a
 * laptop and stands down for reduced motion.
 */

const VERT = `#version 300 es
in vec2 p;
out vec2 vUv;
void main() {
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;

uniform sampler2D uTex;
uniform vec2  uCover;   // scale that makes the band cover the viewport
uniform vec2  uMouse;   // pointer, 0..1, y up
uniform float uTime;
uniform float uHover;   // 0 when the pointer has left, 1 when it is in
uniform float uAspect;

const vec3 INK      = vec3(0.106, 0.063, 0.129);
const vec3 AUBE     = vec3(0.165, 0.094, 0.286);
const vec3 ORCHID   = vec3(0.894, 0.655, 0.953);

void main() {
  // Cover-fit, then walk the band slowly sideways for ever.
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  uv.x += uTime * 0.006;

  // A breathing swell, so the surface is never dead even without a pointer.
  uv.x += sin(uv.y * 7.0 + uTime * 0.30) * 0.0035;
  uv.y += cos(uv.x * 6.0 + uTime * 0.24) * 0.0030;

  // The pointer pushes the surface away from itself and it heals behind.
  vec2 toM = (uv - uMouse) * vec2(uAspect, 1.0);
  float dist = length(toM);
  float ripple = exp(-dist * 5.5) * uHover;
  float wave = sin(dist * 26.0 - uTime * 2.6) * 0.5 + 0.5;
  uv += normalize(toM + 1e-6) * ripple * (0.035 + wave * 0.012);

  // Colour splits a touch at the ripple's edge, the way a lens would.
  float ca = ripple * 0.0075;
  vec3 col = vec3(
    texture(uTex, uv + vec2(ca, 0.0)).r,
    texture(uTex, uv).g,
    texture(uTex, uv - vec2(ca, 0.0)).b
  );

  // Sink it into the brand: aubergine ground, orchid where the ripple lifts.
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(AUBE * (0.45 + lum * 1.25), col, 0.42);
  col = mix(col, ORCHID, ripple * 0.30);
  col += ripple * 0.06;

  // Hold the middle back so the line stays readable, and close the corners.
  float toCentre = length((vUv - 0.5) * vec2(uAspect, 1.0));
  col = mix(col, INK, smoothstep(0.95, 0.15, toCentre) * 0.55);
  col = mix(INK, col, smoothstep(1.45, 0.25, toCentre));

  outColor = vec4(col, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("[hero] shader failed:", gl.getShaderInfoLog(sh) || "(no log; context may be lost)");
    return null;
  }
  return sh;
}

export function RippleHero({ photos, founders, brands }: { photos: string[]; founders: number; brands: number }) {
  const root = useRef<HTMLElement>(null);
  const mount = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = mount.current;
    if (!host) return;
    // Built here, not in the markup: the cleanup below loses the context for
    // good, so a remount has to start from a canvas that never had one.
    const canvas = document.createElement("canvas");
    canvas.className = "size-full";
    host.appendChild(canvas);
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return void canvas.remove(); // the aubergine ground is the fallback

    const prog = gl.createProgram()!;
    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "p");
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const u = {
      tex: gl.getUniformLocation(prog, "uTex"),
      cover: gl.getUniformLocation(prog, "uCover"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      time: gl.getUniformLocation(prog, "uTime"),
      hover: gl.getUniformLocation(prog, "uHover"),
      aspect: gl.getUniformLocation(prog, "uAspect"),
    };

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(u.tex, 0);

    let texW = 2048;
    let texH = 1024;
    let ready = false;
    let live = true;

    buildCollage(photos, { width: texW, height: texH, columns: 11, rows: 6, ground: "#1d1033" }).then((c) => {
      if (!c || !live || !gl) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      texW = c.width;
      texH = c.height;
      ready = true;
      size();
    });

    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(u.aspect, w / h);
      // Cover: show less of whichever axis would otherwise stretch.
      const view = w / h;
      const band = texW / texH;
      gl.uniform2f(u.cover, view > band ? 1 : view / band, view > band ? band / view : 1);
    };
    size();

    const mouse = { x: 0.5, y: 0.5, hover: 0 };
    const target = { x: 0.5, y: 0.5, hover: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      target.hover = 1;
    };
    const onLeave = () => (target.hover = 0);
    const section = root.current!;
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);

    const still = reducedMotion();
    const t0 = performance.now();
    let seen = true;
    const io = new IntersectionObserver(([e]) => void (seen = e.isIntersecting));
    io.observe(canvas);

    const frame = () => {
      if (!ready) return;
      mouse.x += (target.x - mouse.x) * 0.08;
      mouse.y += (target.y - mouse.y) * 0.08;
      mouse.hover += (target.hover - mouse.hover) * 0.06;
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.hover, mouse.hover);
      gl.uniform1f(u.time, still ? 0 : (performance.now() - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const tick = () => void (seen && frame());
    if (still) {
      // One frame, held: no loop, no pointer life.
      const once = setInterval(() => ready && (frame(), clearInterval(once)), 60);
    } else {
      gsap.ticker.add(tick);
    }

    const onResize = () => size();
    window.addEventListener("resize", onResize);
    return () => {
      live = false;
      gsap.ticker.remove(tick);
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [photos]);

  useGSAP(
    () => {
      if (reducedMotion()) return;
      const el = root.current!;
      const play = () =>
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(el.querySelectorAll("[data-line]"), { yPercent: 110, duration: 1.4, stagger: 0.1 })
          .from(el.querySelector("[data-veil]"), { opacity: 0, duration: 1.6 }, 0)
          .from(el.querySelectorAll("[data-foot] > *"), { y: 26, opacity: 0, duration: 1, stagger: 0.08 }, 0.6);
      if (document.documentElement.classList.contains("intro")) window.addEventListener(INTRO_DONE, play, { once: true });
      else play();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate hidden min-h-[calc(100svh-4rem)] overflow-hidden bg-aubergine-2 text-paper md:block">
      <div ref={mount} aria-hidden className="absolute inset-0 size-full" />
      <div data-veil aria-hidden className="pointer-events-none absolute inset-0 bg-aubergine-2/20" />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1500px] flex-col justify-between px-8 pb-10 pt-4">
        <div className="flex flex-1 items-center">
          <h1 className="font-display w-full text-center text-[clamp(3.6rem,10.4vw,11rem)] leading-[0.9] text-paper [text-shadow:0_6px_40px_rgb(29_16_51/0.55)]">
            <span className="block overflow-hidden">
              <span data-line className="block">
                Every gift here
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-line className="block">
                is someone’s
              </span>
            </span>
            <span className="block overflow-hidden">
              <span data-line className="block italic text-orchid">
                first company.
              </span>
            </span>
          </h1>
        </div>

        <div data-foot className="grid items-end gap-8 md:grid-cols-[1fr_auto_1fr]">
          <p className="max-w-sm text-lg leading-snug text-paper/70">
            {founders}&nbsp;student founders. {brands}&nbsp;brands. Reach in.
          </p>
          <Link
            href="/catalogue"
            data-cursor="Go"
            className="group inline-flex items-center gap-3 justify-self-center rounded-full bg-orchid px-8 py-5 text-base font-semibold text-aubergine transition-colors hover:bg-paper"
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
            className="group inline-flex items-center gap-2 justify-self-center text-sm font-semibold text-paper/70 hover:text-paper md:justify-self-end"
          >
            <Roll>Meet the founders</Roll>
            <span className="grid size-10 place-items-center rounded-full border border-paper/25 transition group-hover:border-paper group-hover:bg-paper group-hover:text-aubergine">
              <ArrowDown className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

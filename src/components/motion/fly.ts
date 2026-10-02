"use client";

import { gsap, reducedMotion } from "./gsap";

/**
 * The quick-commerce "it went in" moment: the product's photo lifts off the
 * page and arcs into the header's gift-list pill.
 *
 * It flies a copy of a photo that is already on screen (the gallery image or
 * the card), so it is in the browser's cache and never shows up blank. It
 * leaves from wherever that photo is, or from the button when it isn't
 * visible, and it waits for the image to be decoded before taking off.
 */
export async function flyToList(from: Element | null, image: string | null) {
  const target = document.getElementById("gift-list-button");
  if (!from || !target || reducedMotion()) return;

  const onScreen = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  // A photo of this product that's loaded and visible right now.
  const key = image ? encodeURIComponent(image) : null;
  // The biggest copy on screen (the gallery over its own thumbnail), so the
  // flight starts from the photo the buyer is actually looking at.
  const area = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height;
  };
  const source = key
    ? [...document.querySelectorAll<HTMLImageElement>("img")]
        .filter(
          (img) =>
            img.complete &&
            img.naturalWidth > 0 &&
            img.getAttribute("aria-hidden") !== "true" && // not FitImage's blurred backdrop
            (img.currentSrc.includes(key) || img.src.includes(key)) &&
            onScreen(img),
        )
        .sort((a, b) => area(b) - area(a))[0]
    : undefined;

  const start = (source ?? from).getBoundingClientRect();
  const size = Math.min(source ? Math.min(start.width, start.height) : 64, 220);
  const fly = document.createElement("div");
  Object.assign(fly.style, {
    position: "fixed",
    left: `${start.left + start.width / 2 - size / 2}px`,
    top: `${start.top + start.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "28px",
    overflow: "hidden",
    zIndex: "85",
    pointerEvents: "none",
    background: "#e4a7f3",
    boxShadow: "0 18px 40px -12px rgb(42 24 73 / .55), 0 0 0 4px #f3ede3",
  });
  if (source) {
    const img = document.createElement("img");
    img.src = source.currentSrc || source.src;
    img.alt = "";
    Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover", display: "block" });
    fly.appendChild(img);
    await img.decode().catch(() => {});
  }
  document.body.appendChild(fly);

  const end = target.getBoundingClientRect();
  const dx = end.left + end.width / 2 - (start.left + start.width / 2);
  const dy = end.top + end.height / 2 - (start.top + start.height / 2);
  const scaleEnd = 28 / size;

  gsap
    .timeline({ onComplete: () => fly.remove() })
    .from(fly, { scale: source ? 1 : 0, duration: source ? 0 : 0.25, ease: "back.out(3)" })
    .to(fly, { borderRadius: "999px", scale: 0.55, duration: 0.25, ease: "power2.out" })
    .to(fly, {
      motionPath: {
        path: [
          { x: 0, y: 0 },
          { x: dx * 0.4, y: Math.min(dy, 0) - 160 },
          { x: dx, y: dy },
        ],
        curviness: 1.25,
      },
      scale: scaleEnd,
      rotate: 200,
      duration: 0.8,
      ease: "power2.inOut",
    })
    .to(fly, { opacity: 0, duration: 0.12 }, "-=0.08");
}

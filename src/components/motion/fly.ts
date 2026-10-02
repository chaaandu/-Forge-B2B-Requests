"use client";

import { gsap, reducedMotion } from "./gsap";

/** Fired on `window` as the photo lands, so the list button can bump. */
export const LANDED = "gift-list:landed";

/**
 * Where the photo lands: the phone's bottom bar, aimed at where the bar comes
 * to rest (it may still be rising into view with the first product), or the
 * header's gift-list pill on anything wider.
 */
function landingSpot(): { x: number; y: number } | null {
  const dock = document.getElementById("gift-list-dock");
  const icon = dock?.querySelector("[data-fly-target]");
  const bar = icon?.closest("button");
  if (dock && icon && bar && dock.getClientRects().length) {
    const a = dock.getBoundingClientRect();
    const b = bar.getBoundingClientRect();
    const i = icon.getBoundingClientRect();
    return { x: a.left + (i.left - b.left) + i.width / 2, y: a.top + (i.top - b.top) + i.height / 2 };
  }
  const pill = document.getElementById("gift-list-button");
  if (pill && pill.getClientRects().length) {
    const r = pill.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return null;
}

/**
 * The quick-commerce "it went in" moment: the product's photo lifts off the
 * page and arcs into the gift list (the pill up top, or the bar at the bottom
 * of a phone).
 *
 * It flies a copy of a photo that is already on screen (the gallery image or
 * the card), so it is in the browser's cache and never shows up blank. It
 * leaves from wherever that photo is, or from the button when it isn't
 * visible, and it waits for the image to be decoded before taking off.
 */
export async function flyToList(from: Element | null, images: (string | null | undefined)[]) {
  const landed = () => window.dispatchEvent(new Event(LANDED));
  if (!from || reducedMotion() || !landingSpot()) return landed();

  const onScreen = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const area = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height;
  };
  // Copies of this product's photos already loaded on the page: its own
  // photo first, else any of the listing's (the one the sheet is showing).
  const loaded = [...document.querySelectorAll<HTMLImageElement>("img")].filter(
    (img) => img.complete && img.naturalWidth > 0 && img.getAttribute("aria-hidden") !== "true", // not FitImage's blurred backdrop
  );
  const copies = images
    .filter((i): i is string => Boolean(i))
    .map((i) => encodeURIComponent(i))
    .flatMap((key) => loaded.filter((img) => img.currentSrc.includes(key) || img.src.includes(key)).sort((a, b) => area(b) - area(a)));
  // It takes off from the biggest copy on screen (the photo the buyer is
  // looking at), or from the button with a loaded copy aboard when the photo
  // has scrolled away. Never an empty bubble.
  const source = copies.find(onScreen);
  const photo = source ?? copies[0];

  const start = (source ?? from).getBoundingClientRect();
  const size = Math.min(source ? Math.min(start.width, start.height) : 72, 220);
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
  if (photo) {
    const img = document.createElement("img");
    img.src = photo.currentSrc || photo.src;
    img.alt = "";
    Object.assign(img.style, { width: "100%", height: "100%", objectFit: "cover", display: "block" });
    fly.appendChild(img);
    await img.decode().catch(() => {});
  }
  document.body.appendChild(fly);

  // Measured after the decode wait, so it's where the target is now.
  const end = landingSpot() ?? { x: innerWidth / 2, y: innerHeight - 40 };
  const dx = end.x - (start.left + start.width / 2);
  const dy = end.y - (start.top + start.height / 2);
  const scaleEnd = 28 / size;

  gsap
    .timeline({
      onComplete: () => {
        fly.remove();
        landed();
      },
    })
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

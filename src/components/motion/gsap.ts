"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, MotionPathPlugin, DrawSVGPlugin, Physics2DPlugin, useGSAP);
}

/*
 * No `once: true` on scroll triggers in this codebase. A trigger that plays
 * its animation on enter already plays it only once (the default
 * toggleActions never reverse), and `once` makes a trigger kill itself
 * mid-refresh: on touch screens in Safari, several doing that in the same
 * refresh pass broke ScrollTrigger's loop and took the home page down.
 */
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches;

export { gsap, ScrollTrigger, SplitText, Draggable, useGSAP };

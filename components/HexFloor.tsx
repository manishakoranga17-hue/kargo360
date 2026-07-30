"use client";

import { useMemo, useRef } from "react";
import { useAnimGate } from "@/lib/useAnimGate";

/**
 * 3D honeycomb floor — filled extruded tiles floating at different heights,
 * with red light drifting across the faces. Pure CSS 3D (no WebGL).
 */

// deterministic pseudo-random (same on server & client → no hydration diffs)
const rnd = (i: number, salt: number) => (((i + 7) * 2654435761 + salt * 97911) % 1000) / 1000;

const W = 170; // flat-top hex width
const H = 147; // hex height
const STEP_X = W * 0.75;
const COLS = 18;
const ROWS = 10;
const CANVAS_W = COLS * STEP_X + W * 0.25;
const CANVAS_H = ROWS * H + H / 2;

export default function HexFloor() {
  const root = useRef<HTMLDivElement>(null);
  useAnimGate(root);
  const tiles = useMemo(() => {
    const out: {
      left: number; top: number; kind: "hot" | "tint" | "base";
      tzb: number; tza: number; dur: number; delay: number;
    }[] = [];
    let i = 0;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        i++;
        const left = c * STEP_X;
        const top = r * H + (c % 2 ? H / 2 : 0);
        const roll = rnd(i, 1);
        const kind = roll > 0.94 ? "hot" : roll > 0.72 ? "tint" : "base";
        out.push({
          left,
          top,
          kind,
          tzb: Math.round(rnd(i, 2) * 26),          // resting height 0–26px
          tza: Math.round(10 + rnd(i, 3) * 22),     // float amplitude 10–32px
          dur: Math.round((6 + rnd(i, 4) * 6) * 10) / 10,   // 6–12s
          delay: Math.round(rnd(i, 5) * -80) / 10,  // negative → desynced from load
        });
      }
    }
    return out;
  }, []);

  const face = (kind: "hot" | "tint" | "base") =>
    kind === "hot"
      ? "linear-gradient(160deg, #ff2f45 0%, #c8001b 55%, #7a0012 100%)"
      : kind === "tint"
        ? "linear-gradient(160deg, #2a1216 0%, #16090b 60%, #0e0e11 100%)"
        : "linear-gradient(160deg, #1d1d22 0%, #121216 55%, #0c0c0e 100%)";

  return (
    <div ref={root} className="hex-tilt absolute -left-[15%] top-0 h-[135%] w-[130%]">
      {/* tile canvas, centered */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: "translate(-50%, -50%)",
          transformStyle: "preserve-3d",
        }}
      >
        {tiles.map((t, i) => (
          <div
            key={i}
            className="hex-tile"
            style={{
              left: t.left,
              top: t.top,
              width: W,
              height: H,
              "--tzb": `${t.tzb}px`,
              "--tza": `${t.tza}px`,
              "--dur": `${t.dur}s`,
              "--delay": `${t.delay}s`,
              filter: "drop-shadow(0 18px 16px rgba(0,0,0,0.55))",
              background:
                t.kind === "hot" ? "rgba(255,47,69,0.55)" : "rgba(255,255,255,0.09)",
            } as React.CSSProperties}
          >
            <div className="hex-tile-face" style={{ background: face(t.kind) }} />
            {/* top-light sheen */}
            <div
              className="hex-tile-face"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 42%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* red light drifting over the faces */}
      <div
        className="absolute inset-0"
        style={{ transform: "translateZ(40px)", mixBlendMode: "screen", opacity: 0.55 }}
      >
        <div className="hex-blob hex-blob-a" />
        <div className="hex-blob hex-blob-b" />
        <div className="hex-blob hex-blob-c" style={{ filter: "blur(110px)" }} />
      </div>
    </div>
  );
}

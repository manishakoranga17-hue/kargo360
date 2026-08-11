"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { registerGsap, gsap, ScrollTrigger } from "@/lib/gsap";

const INK = 0x0b0b10;
const SHELL = 0x14161d;
const RED = 0xff2f45;

/* ---------- material / geometry helpers ---------- */

function shellMat(color = SHELL) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.55, roughness: 0.42 });
}

function redGlowMat(intensity = 1.6) {
  return new THREE.MeshStandardMaterial({
    color: 0x2a070c,
    emissive: RED,
    emissiveIntensity: intensity,
    metalness: 0.2,
    roughness: 0.5,
  });
}

/** white blueprint edge lines for a mesh */
function addEdges(mesh: THREE.Mesh, opacity = 0.4) {
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry as THREE.BufferGeometry),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity })
  );
  mesh.add(lines);
  return lines;
}

function box(w: number, h: number, d: number, mat?: THREE.Material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat ?? shellMat());
  addEdges(m);
  return m;
}

type Cluster = {
  group: THREE.Group;
  chaosPos: THREE.Vector3;
  orderPos: THREE.Vector3;
  chaosRot: THREE.Euler;
  /** red error bits that dissolve as the cluster is fixed */
  errorBits: THREE.Object3D[];
  /** parts revealed once fixed */
  fixedBits: THREE.Object3D[];
  /** per-frame idle animation; p = 0 chaotic → 1 fixed */
  tick: (time: number, p: number) => void;
  p: number;
};

/* ---------- the ten challenge stations ---------- */

// 1 · Managing multiple airline contracts — fanned contract docs with seals
function makeContracts(): Cluster {
  const g = new THREE.Group();
  const docs: THREE.Mesh[] = [];
  const chaos: { pos: THREE.Vector3; rot: THREE.Euler }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.02, 0.56), shellMat(i === 2 ? 0x3a2026 : 0x262933));
    addEdges(d, 0.25);
    chaos.push({
      pos: new THREE.Vector3(Math.sin(i * 2.2) * 0.6, 0.3 + (i % 3) * 0.34, Math.cos(i * 1.5) * 0.45),
      rot: new THREE.Euler(Math.sin(i * 3) * 0.45, i * 0.9, Math.cos(i * 2) * 0.4),
    });
    g.add(d);
    docs.push(d);
  }
  const seals: THREE.Mesh[] = [];
  for (let i = 0; i < 2; i++) {
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.025, 12), redGlowMat(1.1));
    g.add(seal);
    seals.push(seal);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(7.4, 1.4, 3.4),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0, 0.5, 0),
    errorBits: [],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      docs.forEach((d, i) => {
        const c = chaos[i];
        const stackY = 0.1 + i * 0.04;
        d.position.set(
          c.pos.x * (1 - p) + Math.sin(t * 0.9 + i) * 0.06 * (1 - p),
          c.pos.y * (1 - p) + stackY * p,
          c.pos.z * (1 - p)
        );
        d.rotation.set(c.rot.x * (1 - p), c.rot.y * (1 - p), c.rot.z * (1 - p));
      });
      seals.forEach((seal, i) => {
        const d = docs[i * 2 + 1];
        seal.position.set(d.position.x + 0.12, d.position.y + 0.03, d.position.z + 0.14);
        seal.rotation.copy(d.rotation);
      });
    },
  };
}

// 2 · Handling multiple customer quotations — quote slips swirling in the air
function makeQuotes(): Cluster {
  const g = new THREE.Group();
  const slips: THREE.Group[] = [];
  for (let i = 0; i < 5; i++) {
    const slip = new THREE.Group();
    const env = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.03, 0.3), shellMat(0x262933));
    addEdges(env, 0.3);
    slip.add(env);
    const flap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.015, 0.18), shellMat(i === 0 ? 0x3a2026 : 0x1d2029));
    flap.position.set(0, 0.025, -0.04);
    flap.rotation.x = 0.5;
    slip.add(flap);
    g.add(slip);
    slips.push(slip);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(6.2, 0.7, 5.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.1, -0.4, 0),
    errorBits: [],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      slips.forEach((slip, i) => {
        const a = t * 0.7 + (i * Math.PI * 2) / 5;
        // swirl in a loose cyclone → settle into a tidy tray stack
        slip.position.set(
          Math.cos(a) * 0.75 * (1 - p),
          (0.4 + i * 0.22 + Math.sin(a * 1.3) * 0.15) * (1 - p) + (0.1 + i * 0.05) * p,
          Math.sin(a) * 0.55 * (1 - p)
        );
        slip.rotation.set(
          Math.sin(a) * 0.4 * (1 - p),
          a * (1 - p),
          Math.cos(a * 0.8) * 0.3 * (1 - p)
        );
      });
    },
  };
}

// 3 · Revenue limited by manual operations — grinding gears, jerky and sparking
function makeGears(): Cluster {
  const g = new THREE.Group();
  const mk = (r: number, x: number, y: number) => {
    const gear = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.13, 9), shellMat(0x1b1e27));
    addEdges(gear, 0.45);
    gear.rotation.x = Math.PI / 2;
    gear.position.set(x, y, 0);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.16, 9), shellMat(0x2a2d38));
    hub.rotation.x = Math.PI / 2;
    hub.position.copy(gear.position);
    g.add(gear, hub);
    return gear;
  };
  const g1 = mk(0.48, -0.35, 0.55);
  const g2 = mk(0.34, 0.42, 0.82);
  const g3 = mk(0.27, 0.5, 0.22);
  const sparks: THREE.Line[] = [];
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.02 + i * 0.05, 0.62, 0.1),
      new THREE.Vector3(0.16 + i * 0.06, 0.75 + i * 0.08, 0.12),
    ]);
    const l = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: 0.9 }));
    g.add(l);
    sparks.push(l);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(4.4, 1.3, 3.0),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.15, 0.6, -0.05),
    errorBits: sparks,
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      // jerky stalls before, smooth spin after
      const jerky = Math.floor(t * 1.6) / 1.6;
      const rot = jerky * (1 - p) + t * 1.1 * p;
      g1.rotation.y = rot;
      g2.rotation.y = -rot * 1.4;
      g3.rotation.y = rot * 1.75;
      sparks.forEach((l, i) => {
        (l.material as THREE.LineBasicMaterial).opacity =
          (Math.sin(t * 9 + i * 2) > 0.55 ? 0.9 : 0) * (1 - p);
      });
    },
  };
}

// 4 · Difficulty scaling operations — a toppled stack that rebuilds into a pyramid
function makeScaling(): Cluster {
  const g = new THREE.Group();
  const cubes: THREE.Mesh[] = [];
  const chaos: { pos: THREE.Vector3; rot: THREE.Euler }[] = [
    { pos: new THREE.Vector3(0, 0.17, 0), rot: new THREE.Euler(0, 0.3, 0) },
    { pos: new THREE.Vector3(0.55, 0.17, 0.35), rot: new THREE.Euler(0, 0.8, 0.4) },
    { pos: new THREE.Vector3(-0.6, 0.17, 0.25), rot: new THREE.Euler(0.5, 0.2, 0) },
    { pos: new THREE.Vector3(0.18, 0.5, 0.02), rot: new THREE.Euler(0, 0.6, 0.25) },
    { pos: new THREE.Vector3(0.95, 0.17, -0.25), rot: new THREE.Euler(0.4, 0, 0.9) },
    { pos: new THREE.Vector3(-0.3, 0.17, -0.55), rot: new THREE.Euler(0, 1.1, 0.5) },
  ];
  const order = [
    new THREE.Vector3(-0.4, 0.17, 0),
    new THREE.Vector3(0, 0.17, 0),
    new THREE.Vector3(0.4, 0.17, 0),
    new THREE.Vector3(-0.2, 0.51, 0),
    new THREE.Vector3(0.2, 0.51, 0),
    new THREE.Vector3(0, 0.85, 0),
  ];
  for (let i = 0; i < 6; i++) {
    const c = box(0.34, 0.34, 0.34, shellMat(i === 5 ? 0x3a2026 : 0x22252f));
    g.add(c);
    cubes.push(c);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(3.2, 0.3, 5.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0, -0.5, 0),
    errorBits: [],
    fixedBits: [],
    p: 0,
    tick: (_t, p) => {
      cubes.forEach((c, i) => {
        c.position.lerpVectors(chaos[i].pos, order[i], p);
        c.rotation.set(chaos[i].rot.x * (1 - p), chaos[i].rot.y * (1 - p), chaos[i].rot.z * (1 - p));
      });
    },
  };
}

// 5 · Limited visibility into performance — a dead dashboard flatlining
function makeVisibility(): Cluster {
  const g = new THREE.Group();
  const panel = box(1.2, 0.82, 0.09, shellMat(0x121319));
  panel.position.y = 0.95;
  g.add(panel);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.55, 8), shellMat(0x2a2d38));
  stand.position.y = 0.28;
  g.add(stand);
  const flat = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.028, 0.02), redGlowMat(1.5));
  flat.position.set(0, 0.95, 0.06);
  g.add(flat);
  const bars: THREE.Mesh[] = [];
  const hs = [0.16, 0.28, 0.22, 0.38, 0.5];
  hs.forEach((h, i) => {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, h, 0.03),
      i === 3 ? redGlowMat(1.2) : shellMat(0x3a3f4d)
    );
    b.position.set(-0.4 + i * 0.2, 0, 0.06);
    g.add(b);
    bars.push(b);
  });
  return {
    group: g,
    chaosPos: new THREE.Vector3(1.4, 1.7, 3.4),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(-0.12, 0.4, 0.1),
    errorBits: [flat],
    fixedBits: bars,
    p: 0,
    tick: (t, p) => {
      (flat.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (1.1 + Math.sin(t * 2.4) * 0.5) * (1 - p);
      flat.scale.setScalar(Math.max(0.001, 1 - p));
      bars.forEach((b, i) => {
        const grow = Math.max(0.001, p * (0.75 + Math.sin(t * 1.4 + i) * 0.25));
        b.scale.y = grow;
        const h = (b.geometry as THREE.BoxGeometry).parameters.height;
        b.position.y = 0.62 + (h * grow) / 2;
      });
    },
  };
}

// 6 · Uncertainty in profitability — a balance that can't stop tipping
function makeBalance(): Cluster {
  const g = new THREE.Group();
  const wedge = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.3, 0.42, 4), shellMat(0x22252f));
  wedge.position.y = 0.21;
  addEdges(wedge, 0.4);
  g.add(wedge);
  const plankG = new THREE.Group();
  plankG.position.y = 0.44;
  const plank = box(1.5, 0.05, 0.3, shellMat(0x2a2d38));
  plankG.add(plank);
  const w1 = box(0.24, 0.24, 0.24, shellMat(0x22252f));
  w1.position.set(-0.6, 0.15, 0);
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), redGlowMat(0.9));
  w2.position.set(0.62, 0.13, 0);
  plankG.add(w1, w2);
  g.add(plankG);
  return {
    group: g,
    chaosPos: new THREE.Vector3(-0.4, 0.4, 5.8),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0, 0.7, 0),
    errorBits: [],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      plankG.rotation.z = Math.sin(t * 1.7) * 0.24 * (1 - p);
    },
  };
}

// 7 · Underutilized flight capacity — a half-empty ghost ULD that fills solid
function makeCapacity(): Cluster {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-0.55, 0);
  shape.lineTo(0.55, 0);
  shape.lineTo(0.55, 0.8);
  shape.lineTo(-0.25, 0.8);
  shape.lineTo(-0.55, 0.5);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.62, bevelEnabled: false });
  const fillMat = new THREE.MeshStandardMaterial({
    color: SHELL,
    metalness: 0.5,
    roughness: 0.45,
    transparent: true,
    opacity: 0.14,
  });
  const uld = new THREE.Mesh(geo, fillMat);
  uld.position.z = -0.31;
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
  );
  uld.add(lines);
  g.add(uld);
  // load meter
  const meterBg = box(0.09, 0.8, 0.06, shellMat(0x191b22));
  meterBg.position.set(0.78, 0.4, 0);
  g.add(meterBg);
  const meterFill = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.8, 0.05), redGlowMat(1.2));
  g.add(meterFill);
  return {
    group: g,
    chaosPos: new THREE.Vector3(-2.4, 0.9, 3.2),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.1, 0.8, 0),
    errorBits: [],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      fillMat.opacity = 0.14 + 0.72 * p;
      const load = 0.42 + 0.58 * p;
      meterFill.scale.y = load;
      meterFill.position.set(0.78, 0.4 * load, 0);
    },
  };
}

// 8 · Slow customer response — the phone ringing off the hook
function makePhone(): Cluster {
  const g = new THREE.Group();
  const body = box(1.1, 0.36, 0.65);
  body.position.y = 0.18;
  g.add(body);
  const handset = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.08, 10, 24, Math.PI), shellMat(0x1b1d26));
  handset.position.set(0, 0.44, 0);
  g.add(handset);
  const earL = box(0.22, 0.16, 0.26, shellMat(0x1b1d26));
  earL.position.set(-0.46, 0.46, 0);
  const earR = box(0.22, 0.16, 0.26, shellMat(0x1b1d26));
  earR.position.set(0.46, 0.46, 0);
  g.add(earL, earR);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(0.34 + i * 0.2, 0.018, 8, 40),
      new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.6 })
    );
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.78 + i * 0.24;
    g.add(r);
    rings.push(r);
  }
  // instant-response panel, revealed when fixed
  const chat = box(0.6, 0.42, 0.06, shellMat(0x191b22));
  chat.position.y = 0.95;
  chat.scale.setScalar(0.001);
  const tick = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 30), redGlowMat(1.4));
  tick.position.z = 0.05;
  chat.add(tick);
  g.add(chat);
  return {
    group: g,
    chaosPos: new THREE.Vector3(-4.4, 0.7, 5.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.2, -0.6, -0.1),
    errorBits: rings,
    fixedBits: [chat],
    p: 0,
    tick: (t, p) => {
      rings.forEach((r, i) => {
        const ph = (t * 0.9 + i * 0.33) % 1;
        r.scale.setScalar(0.7 + ph * 0.7);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.6 * (1 - p);
      });
      handset.position.y = 0.44 + Math.sin(t * 14) * 0.02 * (1 - p);
      chat.scale.setScalar(Math.max(0.001, p));
    },
  };
}

// 9 · High technology investment — a server rack burning through coins
function makeTechCost(): Cluster {
  const g = new THREE.Group();
  const rack = box(0.7, 1.35, 0.6, shellMat(0x191b22));
  rack.position.y = 0.68;
  g.add(rack);
  const leds: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.02), redGlowMat(1.4));
    led.position.set(0, 0.35 + i * 0.35, 0.32);
    g.add(led);
    leds.push(led);
  }
  const coins: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16), shellMat(0x3a3d48));
    addEdges(coin, 0.3);
    coin.position.set(0.62, 0.03 + i * 0.055, 0.15);
    if (i === 3) coin.rotation.z = 0.4;
    g.add(coin);
    coins.push(coin);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(-6.0, 0.3, 3.2),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0, 0.9, 0),
    errorBits: [...leds, ...coins],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      leds.forEach((led, i) => {
        (led.material as THREE.MeshStandardMaterial).emissiveIntensity =
          (0.5 + Math.abs(Math.sin(t * 6 + i * 1.3))) * (1 - p) + 0.5 * p;
      });
      coins.forEach((coin, i) => {
        coin.scale.setScalar(Math.max(0.001, 1 - p));
      });
    },
  };
}

// 10 · Disconnected cargo ecosystem — silos with broken links, then one network
function makeSilos(): Cluster {
  const g = new THREE.Group();
  const a = box(0.85, 1.05, 0.5);
  const b = box(0.85, 1.3, 0.5);
  const c = box(0.85, 0.85, 0.5);
  a.position.set(-1.1, 0.52, 0.35);
  b.position.set(0.15, 0.65, -0.4);
  c.position.set(1.25, 0.42, 0.3);
  g.add(a, b, c);
  const linkMat = new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: 0.9 });
  const links: THREE.Line[] = [];
  const mk = (pts: number[][]) => {
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(...p)));
    const l = new THREE.Line(geo, linkMat.clone());
    links.push(l);
    g.add(l);
  };
  mk([
    [-0.65, 0.75, 0.3],
    [-0.4, 0.9, 0.1],
  ]);
  mk([
    [-0.05, 1.0, -0.1],
    [-0.28, 0.95, 0.02],
  ]);
  mk([
    [0.62, 0.7, -0.2],
    [0.85, 0.6, 0.05],
  ]);
  const cleanMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
  const clean: THREE.Line[] = [];
  const mkClean = (from: number[], to: number[]) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...from),
      new THREE.Vector3(...to),
    ]);
    const l = new THREE.Line(geo, cleanMat.clone());
    clean.push(l);
    g.add(l);
  };
  mkClean([-1.1, 0.6, 0.35], [0.15, 0.75, -0.4]);
  mkClean([0.15, 0.75, -0.4], [1.25, 0.5, 0.3]);
  return {
    group: g,
    chaosPos: new THREE.Vector3(-7.4, 0.6, 5.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.1, 0.35, -0.08),
    errorBits: links,
    fixedBits: clean,
    p: 0,
    tick: (t, p) => {
      links.forEach((l, i) => {
        (l.material as THREE.LineBasicMaterial).opacity =
          (0.4 + 0.6 * Math.abs(Math.sin(t * 5 + i * 1.7))) * (1 - p);
      });
      clean.forEach((l) => {
        (l.material as THREE.LineBasicMaterial).opacity = 0.55 * p;
      });
    },
  };
}

/* ---------- component ---------- */

export default function GsaStory3D({
  faults,
  cures,
  beforeCaption,
  afterCaption,
}: {
  faults: string[];
  cures: string[];
  beforeCaption: string;
  afterCaption: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chipRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const beforeHeadRef = useRef<HTMLDivElement>(null);
  const afterHeadRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    /* --- renderer / scene --- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setClearColor(INK);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(INK, 0.038);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.42;
    const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 80);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.42, 0.8, 0.24);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* --- lights --- */
    scene.add(new THREE.AmbientLight(0x2a2c38, 2.1));
    scene.add(new THREE.HemisphereLight(0x8a8fa8, 0x0b0b10, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 8);
    scene.add(key);
    const redLight = new THREE.PointLight(RED, 20, 30, 1.8);
    redLight.position.set(1, 3.5, 5);
    scene.add(redLight);
    const coreLight = new THREE.PointLight(0xfff0ee, 0, 24, 1.6);
    coreLight.position.set(0, 2.2, 0);
    scene.add(coreLight);

    /* --- floor grid --- */
    const grid = new THREE.GridHelper(70, 70, 0x2a2a32, 0x16161c);
    grid.position.y = -1.6;
    scene.add(grid);

    /* --- clusters --- */
    const clusters: Cluster[] = [
      makeContracts(),
      makeQuotes(),
      makeGears(),
      makeScaling(),
      makeVisibility(),
      makeBalance(),
      makeCapacity(),
      makePhone(),
      makeTechCost(),
      makeSilos(),
    ];
    // ordered ring positions around the core
    clusters.forEach((c, i) => {
      const a = (-90 - (i * 360) / clusters.length) * (Math.PI / 180);
      c.orderPos.set(Math.cos(a) * 5.5, -0.4, Math.sin(a) * 5.5 * 0.82);
      c.group.position.copy(c.chaosPos);
      c.group.rotation.copy(c.chaosRot);
      c.group.scale.setScalar(0.82);
      scene.add(c.group);
    });

    /* --- the 360 core --- */
    const core = new THREE.Group();
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.5, 6), shellMat(0x181a22));
    addEdges(hex, 0.6);
    core.add(hex);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.54, 6), redGlowMat(1.5));
    core.add(plate);
    const haloMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.55 });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.03, 10, 60), haloMat);
    halo.rotation.x = Math.PI / 2;
    core.add(halo);
    core.position.y = -0.4;
    core.scale.setScalar(0.001);
    scene.add(core);

    /* --- beams from each station to the core (appear at the end) --- */
    const beams: { tube: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; pulse: THREE.Mesh }[] = [];
    clusters.forEach((c) => {
      const from = c.orderPos.clone().add(new THREE.Vector3(0, 0.5, 0));
      const to = new THREE.Vector3(0, 0.35, 0);
      const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 1.4, 0));
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.018, 6),
        new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0 })
      );
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd8d4, transparent: true, opacity: 0 })
      );
      scene.add(tube, pulse);
      beams.push({ tube, curve, pulse });
    });

    /* --- camera path --- */
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(12.0, 2.8, 13.8),
      new THREE.Vector3(8.2, 2.5, 11.0),
      new THREE.Vector3(2.8, 2.2, 10.4),
      new THREE.Vector3(-3.6, 2.6, 10.6),
      new THREE.Vector3(-7.4, 3.4, 11.0),
      new THREE.Vector3(-3.2, 5.8, 13.4),
      new THREE.Vector3(0, 6.2, 13.8),
    ]);
    const lookChaos = new THREE.Vector3(0.5, 1.15, 2.6);
    const lookCore = new THREE.Vector3(0, 0.4, 0);
    const look = new THREE.Vector3();

    /* --- scroll progress --- */
    let progress = 0;
    let active = true;
    const st = ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate: (self) => {
        progress = self.progress;
      },
    });
    const vis = ScrollTrigger.create({
      trigger: wrap,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        active = self.isActive;
      },
    });

    /* --- labels / chips DOM sync --- */
    const labels = labelRefs.current;
    const chips = chipRefs.current;
    const smooth = (a: number, b: number, x: number) => {
      const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return k * k * (3 - 2 * k);
    };
    const anchor = new THREE.Vector3();

    /* --- frame loop --- */
    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!active) return;
      const t = clock.getElapsedTime();

      // camera along path
      const camT = smooth(0, 1, progress);
      camera.position.copy(path.getPoint(camT));
      look.lerpVectors(lookChaos, lookCore, smooth(0.3, 0.72, progress));
      camera.lookAt(look);

      // convergence with per-cluster stagger
      const orderStart = 0.4;
      const stepP = 0.28 / clusters.length;
      clusters.forEach((c, i) => {
        const p = smooth(orderStart + i * stepP, orderStart + i * stepP + 0.18, progress);
        c.p = p;
        c.group.position.lerpVectors(c.chaosPos, c.orderPos, p);
        c.group.rotation.set(
          c.chaosRot.x * (1 - p),
          c.chaosRot.y * (1 - p) + Math.PI * p,
          c.chaosRot.z * (1 - p)
        );
        c.tick(t, p);
      });
      const avgP = clusters.reduce((s, c) => s + c.p, 0) / clusters.length;

      // core awakens
      const coreP = smooth(0.55, 0.8, progress);
      core.scale.setScalar(Math.max(0.001, coreP));
      core.rotation.y = t * 0.25;
      halo.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
      haloMat.opacity = 0.55 * coreP;
      coreLight.intensity = 26 * coreP;
      redLight.intensity = 20 * (1 - avgP * 0.75) * (0.82 + Math.sin(t * 7) * 0.18 * (1 - avgP));

      // beams + traveling pulses
      const beamP = smooth(0.78, 0.95, progress);
      beams.forEach((b, i) => {
        (b.tube.material as THREE.MeshBasicMaterial).opacity = 0.5 * beamP;
        const pm = b.pulse.material as THREE.MeshBasicMaterial;
        pm.opacity = beamP;
        if (beamP > 0.01) b.pulse.position.copy(b.curve.getPoint((t * 0.35 + i / 6) % 1));
      });

      // DOM labels track their stations
      clusters.forEach((c, i) => {
        const el = labels[i];
        if (!el) return;
        anchor.copy(c.group.position).add(new THREE.Vector3(0, 1.75 + (i % 3) * 0.42, 0));
        anchor.project(camera);
        const behind = anchor.z > 1;
        const x = (anchor.x * 0.5 + 0.5) * canvas.clientWidth;
        const y = (-anchor.y * 0.5 + 0.5) * canvas.clientHeight;
        el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const clipped = behind || y < 310 || y > h - 170 || x < 70 || x > w - 70;
        el.style.opacity = clipped ? "0" : "1";
        el.dataset.fixed = c.p > 0.6 ? "1" : "0";
        const chip = chips[i];
        if (chip) chip.dataset.fixed = c.p > 0.6 ? "1" : "0";
      });

      // headline swap + progress rail
      const after = progress > 0.62;
      if (beforeHeadRef.current) beforeHeadRef.current.style.opacity = after ? "0" : "1";
      if (afterHeadRef.current) afterHeadRef.current.style.opacity = after ? "1" : "0";
      if (progressRef.current) progressRef.current.style.width = `${(progress * 100).toFixed(1)}%`;

      composer.render();
    };
    frame();

    /* --- sizing --- */
    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      bloom.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      st.kill();
      vis.kill();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((mm) => mm.dispose());
        }
      });
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[560vh] bg-ink-950">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* station labels */}
        <div className="pointer-events-none absolute inset-0">
          {faults.map((f, i) => (
            <div
              key={f}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              data-fixed="0"
              className="group absolute left-0 top-0 opacity-0 transition-opacity duration-300 will-change-transform"
            >
              <div className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-[0.62rem] uppercase tracking-widest backdrop-blur-sm transition-colors duration-500 group-data-[fixed=0]:border-signal-red/50 group-data-[fixed=0]:bg-signal-red/10 group-data-[fixed=0]:text-white/85 group-data-[fixed=1]:border-white/25 group-data-[fixed=1]:bg-white/[0.06] group-data-[fixed=1]:text-white/85">
                <span className="text-signal-crimson group-data-[fixed=1]:hidden">✕</span>
                <span className="hidden text-signal-crimson group-data-[fixed=1]:inline">✓</span>
                <span className="group-data-[fixed=1]:hidden">{f}</span>
                <span className="hidden group-data-[fixed=1]:inline">{cures[i]}</span>
              </div>
              <div className="mx-auto h-5 w-px bg-white/25" />
            </div>
          ))}
        </div>

        {/* headline overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-24 flex flex-col items-center text-center md:top-28">
          <div className="relative h-24 w-full">
            <div
              ref={beforeHeadRef}
              className="absolute inset-x-0 transition-opacity duration-700"
              style={{ opacity: 1 }}
            >
              <div className="eyebrow mb-3 justify-center">// Scene 01 — Before Kargo360</div>
              <h3 className="heading-glow text-3xl sm:text-4xl md:text-5xl">
                <span className="heading-shine">The Way It Breaks.</span>
              </h3>
              <p className="mx-auto mt-3 max-w-xl px-6 text-sm leading-relaxed text-mist md:text-base">
                {beforeCaption}
              </p>
            </div>
            <div
              ref={afterHeadRef}
              className="absolute inset-x-0 transition-opacity duration-700"
              style={{ opacity: 0 }}
            >
              <div className="eyebrow mb-3 justify-center">// Scene 02 — After Kargo360</div>
              <h3 className="text-signal-glow text-3xl sm:text-4xl md:text-5xl">
                <span className="text-signal">One Platform. In Orbit.</span>
              </h3>
              <p className="mx-auto mt-3 max-w-xl px-6 text-sm leading-relaxed text-mist md:text-base">
                {afterCaption}
              </p>
            </div>
          </div>
        </div>

        {/* chip rail */}
        <div className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 px-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {faults.map((f, i) => (
              <span
                key={f}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                data-fixed="0"
                className="group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-widest transition-colors duration-500 data-[fixed=0]:border-signal-red/40 data-[fixed=0]:bg-signal-red/[0.07] data-[fixed=0]:text-mist-bright data-[fixed=1]:border-white/25 data-[fixed=1]:bg-white/[0.05] data-[fixed=1]:text-white"
              >
                <span className="text-signal-crimson group-data-[fixed=1]:hidden">✕</span>
                <span className="hidden text-signal-crimson group-data-[fixed=1]:inline">✓</span>
                {f}
              </span>
            ))}
          </div>
          {/* scroll progress */}
          <div className="relative h-px w-64 bg-white/15">
            <div ref={progressRef} className="absolute inset-y-0 left-0 bg-signal-red" style={{ width: "0%" }} />
          </div>
          <div className="font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
            Scroll to run the transformation
          </div>
        </div>
      </div>
    </div>
  );
}

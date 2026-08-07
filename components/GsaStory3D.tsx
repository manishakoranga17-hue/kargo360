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

/* ---------- the six problem stations ---------- */

function makePhone(): Cluster {
  const g = new THREE.Group();
  const body = box(1.25, 0.4, 0.75);
  body.position.y = 0.2;
  g.add(body);
  const handset = new THREE.Mesh(
    new THREE.TorusGeometry(0.52, 0.09, 10, 24, Math.PI),
    shellMat(0x1b1d26)
  );
  handset.position.set(0, 0.48, 0);
  g.add(handset);
  const earL = box(0.26, 0.18, 0.3, shellMat(0x1b1d26));
  earL.position.set(-0.52, 0.5, 0);
  const earR = box(0.26, 0.18, 0.3, shellMat(0x1b1d26));
  earR.position.set(0.52, 0.5, 0);
  g.add(earL, earR);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(0.36 + i * 0.22, 0.02, 8, 40),
      new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.8 })
    );
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.85 + i * 0.28;
    g.add(r);
    rings.push(r);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(6.8, 0.7, 3.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.24, -0.7, -0.14),
    errorBits: rings,
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      rings.forEach((r, i) => {
        const ph = (t * 0.9 + i * 0.33) % 1;
        r.scale.setScalar(0.7 + ph * 0.7);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.6 * (1 - p);
      });
      handset.position.y = 0.48 + Math.sin(t * 14) * 0.02 * (1 - p);
    },
  };
}

function makeClock(): Cluster {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.16, 32), shellMat());
  face.rotation.x = Math.PI / 2;
  face.position.y = 0.9;
  addEdges(face, 0.3);
  g.add(face);
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.05), redGlowMat(1.8));
  hand.position.set(0, 1.1, 0.11);
  g.add(hand);
  const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.04), shellMat(0x3a3d48));
  hand2.position.set(0.1, 1.0, 0.12);
  hand2.rotation.z = -1.1;
  g.add(hand2);
  const cal = box(0.72, 0.85, 0.16);
  cal.position.set(1.05, 0.42, 0);
  g.add(cal);
  const band = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.16, 0.17), redGlowMat(0.9));
  band.position.set(1.05, 0.77, 0);
  g.add(band);
  return {
    group: g,
    chaosPos: new THREE.Vector3(3.4, 1.6, 5.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(-0.18, 0.55, 0.2),
    errorBits: [band],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      // hand spins wildly before, sweeps calmly after
      hand.rotation.z = -t * (6 - 5.7 * p);
      hand.position.x = Math.sin(hand.rotation.z) * -0.26;
      hand.position.y = 0.9 + Math.cos(hand.rotation.z) * 0.26;
    },
  };
}

function makeSilos(): Cluster {
  const g = new THREE.Group();
  const a = box(0.85, 1.05, 0.5);
  const b = box(0.85, 1.3, 0.5);
  const c = box(0.85, 0.85, 0.5);
  a.position.set(-1.1, 0.52, 0.35);
  b.position.set(0.15, 0.65, -0.4);
  c.position.set(1.25, 0.42, 0.3);
  g.add(a, b, c);
  // broken red links between the silos
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
  // clean white links once unified
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
    chaosPos: new THREE.Vector3(-0.5, 0.4, 5.4),
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

function makePapers(): Cluster {
  const g = new THREE.Group();
  const sheets: THREE.Mesh[] = [];
  const chaos: { pos: THREE.Vector3; rot: THREE.Euler }[] = [];
  for (let i = 0; i < 8; i++) {
    const s = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.02, 0.52),
      shellMat(i === 3 ? 0x3a2026 : 0x262933)
    );
    addEdges(s, 0.25);
    chaos.push({
      pos: new THREE.Vector3(
        Math.sin(i * 2.4) * 0.65,
        0.3 + (i % 4) * 0.32,
        Math.cos(i * 1.7) * 0.5
      ),
      rot: new THREE.Euler(Math.sin(i * 3) * 0.5, i * 0.8, Math.cos(i * 2) * 0.45),
    });
    g.add(s);
    sheets.push(s);
  }
  return {
    group: g,
    chaosPos: new THREE.Vector3(-4.2, 1.1, 4.8),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0, 0.4, 0),
    errorBits: [],
    fixedBits: [],
    p: 0,
    tick: (t, p) => {
      sheets.forEach((s, i) => {
        const c = chaos[i];
        // chaotic float → tidy stack
        const stackY = 0.12 + i * 0.045;
        s.position.set(
          c.pos.x * (1 - p) + Math.sin(t * 0.8 + i) * 0.08 * (1 - p),
          c.pos.y * (1 - p) + stackY * p + Math.sin(t * 1.1 + i * 2) * 0.06 * (1 - p),
          c.pos.z * (1 - p)
        );
        s.rotation.set(c.rot.x * (1 - p), c.rot.y * (1 - p), c.rot.z * (1 - p));
      });
    },
  };
}

function makeLeak(): Cluster {
  const g = new THREE.Group();
  const vault = box(1.0, 0.95, 0.85);
  vault.position.y = 0.85;
  g.add(vault);
  const drops: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), redGlowMat(1.4));
    g.add(d);
    drops.push(d);
  }
  const seal = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.05, 10, 40), redGlowMat(1.2));
  seal.rotation.x = Math.PI / 2;
  seal.position.y = 0.85;
  seal.scale.setScalar(0.001);
  g.add(seal);
  return {
    group: g,
    chaosPos: new THREE.Vector3(-6.7, 0.25, 3.6),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(0.12, 0.9, 0.1),
    errorBits: drops,
    fixedBits: [seal],
    p: 0,
    tick: (t, p) => {
      drops.forEach((d, i) => {
        const ph = (t * 0.55 + i * 0.2) % 1;
        d.position.set(Math.sin(i * 2.1) * 0.3, 0.35 - ph * 1.1, Math.cos(i * 1.3) * 0.25);
        d.scale.setScalar(Math.max(0.001, (1 - ph) * (1 - p)));
      });
      seal.scale.setScalar(Math.max(0.001, p));
      seal.rotation.z = t * 0.4;
    },
  };
}

function makeBubbles(): Cluster {
  const g = new THREE.Group();
  const bubbles: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const b = new THREE.Mesh(
      new THREE.SphereGeometry(0.26, 20, 16),
      i === 1 ? redGlowMat(1.1) : shellMat(0x232630)
    );
    b.scale.set(1.45, 1, 1.1);
    g.add(b);
    bubbles.push(b);
  }
  // self-serve terminal, revealed when fixed
  const tablet = box(0.62, 0.9, 0.09);
  tablet.position.y = 0.55;
  tablet.scale.setScalar(0.001);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 30), redGlowMat(1.4));
  ring.position.set(0, 0.62, 0.08);
  tablet.add(ring);
  g.add(tablet);
  return {
    group: g,
    chaosPos: new THREE.Vector3(-6.0, 1.9, -0.4),
    orderPos: new THREE.Vector3(0, 0, 0),
    chaosRot: new THREE.Euler(-0.1, 1.2, 0.16),
    errorBits: bubbles,
    fixedBits: [tablet],
    p: 0,
    tick: (t, p) => {
      bubbles.forEach((b, i) => {
        const ph = (t * 0.4 + i * 0.33) % 1;
        b.position.set(Math.sin(i * 2.4) * 0.35, 0.2 + ph * 1.5, 0);
        const s = Math.max(0.001, (0.6 + ph * 0.5) * (1 - p));
        b.scale.set(1.45 * s, s, 1.1 * s);
      });
      tablet.scale.setScalar(Math.max(0.001, p));
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
      makePhone(),
      makeClock(),
      makeSilos(),
      makePapers(),
      makeLeak(),
      makeBubbles(),
    ];
    // ordered ring positions around the core
    clusters.forEach((c, i) => {
      const a = (-90 - i * 60) * (Math.PI / 180);
      c.orderPos.set(Math.cos(a) * 4.6, -0.4, Math.sin(a) * 4.6 * 0.82);
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
      new THREE.Vector3(-3.2, 5.4, 12.4),
      new THREE.Vector3(0, 5.6, 12.6),
    ]);
    const lookChaos = new THREE.Vector3(0.8, 0.35, 3.0);
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
      clusters.forEach((c, i) => {
        const p = smooth(orderStart + i * 0.045, orderStart + i * 0.045 + 0.2, progress);
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
    <div ref={wrapRef} className="relative h-[420vh] bg-ink-950">
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
                className="group inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.6rem] uppercase tracking-widest transition-colors duration-500 data-[fixed=0]:border-signal-red/40 data-[fixed=0]:bg-signal-red/[0.07] data-[fixed=0]:text-mist-bright data-[fixed=1]:border-white/25 data-[fixed=1]:bg-white/[0.05] data-[fixed=1]:text-white"
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

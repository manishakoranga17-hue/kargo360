"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { registerGsap, ScrollTrigger } from "@/lib/gsap";

const INK = 0x0a0a0c;
const SHELL = 0x14161d;
const RED = 0xff2f45;

/* ---------- helpers ---------- */

function shellMat(color = SHELL) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.45 });
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

function capsule(r: number, len: number, mat: THREE.Material) {
  return new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 10), mat);
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/* ---------- a seated operator ---------- */

type Person = {
  group: THREE.Group;
  /** relax: 0 stressed → 1 at ease */
  setPose: (t: number, relax: number, faceYaw: number) => void;
};

/**
 * variant 0: both hands hammering the keyboard
 * variant 1: one hand pressed to the head
 * variant 2: phone clamped to the ear
 */
function makePerson(variant: number, seed: number): Person {
  const g = new THREE.Group();
  // visible, warm figure: lit skin + colored shirt so it never sinks into the dark
  const SKIN = 0xd9a887;
  const skinMat = new THREE.MeshStandardMaterial({
    color: SKIN,
    emissive: SKIN,
    emissiveIntensity: 0.22,
    metalness: 0.05,
    roughness: 0.6,
  });
  const shirtColor = [0x51607a, 0x6a4f5c, 0x4f6a5e][variant % 3];
  const shirtMat = new THREE.MeshStandardMaterial({
    color: shirtColor,
    emissive: shirtColor,
    emissiveIntensity: 0.16,
    metalness: 0.1,
    roughness: 0.6,
  });
  const hairMat = shellMat(0x23262e);
  const darkMat = shellMat(0x1a1d26);

  // chair
  const seat = box(0.52, 0.06, 0.5, darkMat);
  seat.position.y = 0.6;
  const back = box(0.5, 0.6, 0.06, darkMat);
  back.position.set(0, 0.95, -0.27);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8), darkMat);
  stem.position.y = 0.44;
  g.add(seat, back, stem);

  // legs
  const thigh = capsule(0.075, 0.26, shirtMat);
  thigh.rotation.x = Math.PI / 2;
  thigh.position.set(0.09, 0.68, 0.18);
  const thigh2 = thigh.clone();
  thigh2.position.x = -0.09;
  const shin = capsule(0.065, 0.28, darkMat);
  shin.position.set(0.09, 0.5, 0.32);
  const shin2 = shin.clone();
  shin2.position.x = -0.09;
  g.add(thigh, thigh2, shin, shin2);

  // torso pivots at the hips — taller so the head clears the monitor
  const torsoG = new THREE.Group();
  torsoG.position.set(0, 0.68, -0.02);
  g.add(torsoG);
  const torso = capsule(0.18, 0.52, shirtMat);
  torso.position.y = 0.4;
  torsoG.add(torso);
  // red lanyard accent
  const lanyard = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.02), redGlowMat(0.7));
  lanyard.position.set(0, 0.5, 0.175);
  torsoG.add(lanyard);

  // head with a face
  const headG = new THREE.Group();
  headG.position.set(0, 0.82, 0.02);
  torsoG.add(headG);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 20, 16), skinMat);
  head.position.y = 0.12;
  headG.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.176, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    hairMat
  );
  hair.position.set(0, 0.135, -0.025);
  hair.rotation.x = -0.38;
  headG.add(hair);
  if (variant === 1) {
    const bun = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), hairMat);
    bun.position.set(0, 0.26, -0.14);
    headG.add(bun);
  }
  // eyes
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x14161d });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeMat);
  eyeL.position.set(-0.062, 0.135, 0.155);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.062;
  headG.add(eyeL, eyeR);
  // brows: angled in when strained, raised when easy
  const browGeo = new THREE.BoxGeometry(0.055, 0.012, 0.012);
  const browMat = new THREE.MeshBasicMaterial({ color: 0x23262e });
  const browL = new THREE.Mesh(browGeo, browMat);
  browL.position.set(-0.062, 0.175, 0.155);
  const browR = new THREE.Mesh(browGeo, browMat);
  browR.position.set(0.062, 0.175, 0.155);
  headG.add(browL, browR);
  // mouth: frown ∩ crossfades to smile ∪
  const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8a4a44 });
  const frown = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 8, 16, Math.PI), mouthMat);
  frown.position.set(0, 0.045, 0.152);
  const smile = frown.clone();
  smile.rotation.z = Math.PI;
  smile.position.y = 0.075;
  headG.add(frown, smile);

  // arms: shoulder → elbow → forearm → hand
  const mkArm = (side: 1 | -1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(0.23 * side, 0.62, 0.03);
    torsoG.add(shoulder);
    const upper = capsule(0.055, 0.24, shirtMat);
    upper.position.y = -0.15;
    shoulder.add(upper);
    const elbow = new THREE.Group();
    elbow.position.y = -0.3;
    shoulder.add(elbow);
    const fore = capsule(0.05, 0.22, skinMat);
    fore.position.y = -0.14;
    elbow.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), skinMat);
    hand.position.y = -0.29;
    elbow.add(hand);
    return { shoulder, elbow };
  };
  const armL = mkArm(-1);
  const armR = mkArm(1);

  if (variant === 2) {
    const phone = box(0.07, 0.16, 0.03, darkMat);
    phone.position.set(0, -0.3, 0.03);
    armR.elbow.add(phone);
  }

  // stress mark → calm ring
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.05), redGlowMat(1.6));
  mark.position.set(0.18, 1.98, 0);
  const dot = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), redGlowMat(1.6));
  dot.position.set(0.18, 1.84, 0);
  const calmMat = new THREE.MeshBasicMaterial({ color: 0xfff0ee, transparent: true, opacity: 0 });
  const calmRing = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.014, 8, 24), calmMat);
  calmRing.position.set(0, 2.0, 0);
  g.add(mark, dot, calmRing);

  const setPose = (t: number, relax: number, faceYaw: number) => {
    const r = relax;
    const sIdle = 1 - r;
    torsoG.rotation.x =
      lerp(0.42, -0.16, r) + Math.sin(t * (7 + seed)) * 0.012 * sIdle + Math.sin(t * 1.1 + seed) * 0.02 * r;
    headG.rotation.x = lerp(0.28, -0.1, r);
    // stressed: head shakes at the screen — relaxed: turns to face the room/camera
    headG.rotation.y =
      Math.sin(t * (4.5 + seed)) * 0.09 * sIdle + faceYaw * r + Math.sin(t * 0.7 + seed) * 0.04 * r;

    if (variant === 0) {
      armL.shoulder.rotation.x = lerp(-1.05, -0.35, r);
      armR.shoulder.rotation.x = lerp(-1.12, -0.35, r);
      armL.elbow.rotation.x = lerp(-0.55, -0.3, r) + Math.sin(t * 11 + seed) * 0.1 * sIdle;
      armR.elbow.rotation.x = lerp(-0.5, -0.3, r) + Math.cos(t * 12 + seed) * 0.1 * sIdle;
    } else if (variant === 1) {
      armL.shoulder.rotation.x = lerp(-1.05, -0.35, r);
      armL.elbow.rotation.x = lerp(-0.5, -0.3, r) + Math.sin(t * 10 + seed) * 0.09 * sIdle;
      armR.shoulder.rotation.x = lerp(-2.15, -0.4, r);
      armR.shoulder.rotation.z = lerp(-0.55, -0.05, r);
      armR.elbow.rotation.x = lerp(-1.95, -0.35, r);
    } else {
      armL.shoulder.rotation.x = lerp(-1.0, -0.35, r);
      armL.elbow.rotation.x = lerp(-0.5, -0.3, r);
      armR.shoulder.rotation.x = lerp(-2.3, -0.45, r);
      armR.shoulder.rotation.z = lerp(-0.3, -0.05, r);
      armR.elbow.rotation.x = lerp(-2.05, -0.4, r);
    }

    // expression morph
    const browTilt = lerp(0.45, -0.14, r);
    browL.rotation.z = -browTilt;
    browR.rotation.z = browTilt;
    eyeL.scale.y = eyeR.scale.y = lerp(0.55, 1, r);
    frown.scale.setScalar(Math.max(0.001, 1 - r));
    smile.scale.setScalar(Math.max(0.001, r));

    // stress mark blinks away; calm ring settles in
    const blink = (0.8 + Math.sin(t * 6 + seed) * 0.5) * sIdle;
    (mark.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6 * blink;
    (dot.material as THREE.MeshStandardMaterial).emissiveIntensity = 1.6 * blink;
    mark.visible = dot.visible = sIdle > 0.03;
    calmMat.opacity = 0.75 * r;
    calmRing.rotation.y = t * 0.8;
  };

  return { group: g, setPose };
}

/* ---------- problem props (resolve in place; p: 0 broken → 1 solved) ---------- */

type Prop = { group: THREE.Group; tick: (t: number, p: number) => void };

// contracts fanned mid-air with a red seal → neat stack
function makeContracts(): Prop {
  const g = new THREE.Group();
  const docs: THREE.Mesh[] = [];
  const chaos: { pos: THREE.Vector3; rot: THREE.Euler }[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.016, 0.44),
      shellMat(i === 2 ? 0x3a2026 : 0x262933)
    );
    addEdges(d, 0.3);
    chaos.push({
      pos: new THREE.Vector3(Math.sin(i * 2.2) * 0.35, 0.2 + (i % 3) * 0.24, Math.cos(i * 1.5) * 0.3),
      rot: new THREE.Euler(Math.sin(i * 3) * 0.4, i * 0.9, Math.cos(i * 2) * 0.35),
    });
    g.add(d);
    docs.push(d);
  }
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), redGlowMat(1.1));
  g.add(seal);
  return {
    group: g,
    tick: (t, p) => {
      docs.forEach((d, i) => {
        const c = chaos[i];
        d.position.set(
          c.pos.x * (1 - p) + Math.sin(t * 0.9 + i) * 0.04 * (1 - p),
          c.pos.y * (1 - p) + (0.05 + i * 0.03) * p,
          c.pos.z * (1 - p)
        );
        d.rotation.set(c.rot.x * (1 - p), c.rot.y * (1 - p), c.rot.z * (1 - p));
      });
      seal.position.set(docs[3].position.x + 0.08, docs[3].position.y + 0.025, docs[3].position.z + 0.1);
      seal.rotation.copy(docs[3].rotation);
    },
  };
}

// quotation slips swirling → tidy tray
function makeQuotes(): Prop {
  const g = new THREE.Group();
  const slips: THREE.Group[] = [];
  for (let i = 0; i < 4; i++) {
    const slip = new THREE.Group();
    const env = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.2), shellMat(0x262933));
    addEdges(env, 0.35);
    slip.add(env);
    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.012, 0.12),
      shellMat(i === 0 ? 0x3a2026 : 0x1d2029)
    );
    flap.position.set(0, 0.018, -0.03);
    flap.rotation.x = 0.5;
    slip.add(flap);
    g.add(slip);
    slips.push(slip);
  }
  return {
    group: g,
    tick: (t, p) => {
      slips.forEach((slip, i) => {
        const a = t * 0.8 + (i * Math.PI * 2) / 4;
        slip.position.set(
          Math.cos(a) * 0.3 * (1 - p),
          (0.3 + i * 0.16 + Math.sin(a * 1.3) * 0.1) * (1 - p) + (0.05 + i * 0.035) * p,
          Math.sin(a) * 0.24 * (1 - p)
        );
        slip.rotation.set(Math.sin(a) * 0.35 * (1 - p), a * (1 - p), Math.cos(a * 0.8) * 0.25 * (1 - p));
      });
    },
  };
}

// jerky sparking gears → smooth spin
function makeGears(): Prop {
  const g = new THREE.Group();
  const mk = (r: number, x: number, y: number) => {
    const gear = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.09, 9), shellMat(0x1b1e27));
    addEdges(gear, 0.45);
    gear.rotation.x = Math.PI / 2;
    gear.position.set(x, y, 0);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.3, r * 0.3, 0.12, 9), shellMat(0x2a2d38));
    hub.rotation.x = Math.PI / 2;
    hub.position.copy(gear.position);
    g.add(gear, hub);
    return gear;
  };
  const g1 = mk(0.3, -0.22, 0.34);
  const g2 = mk(0.21, 0.27, 0.5);
  const g3 = mk(0.17, 0.32, 0.14);
  const sparks: THREE.Line[] = [];
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.02 + i * 0.03, 0.4, 0.06),
      new THREE.Vector3(0.11 + i * 0.04, 0.5 + i * 0.05, 0.08),
    ]);
    const l = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({ color: RED, transparent: true, opacity: 0.9 })
    );
    g.add(l);
    sparks.push(l);
  }
  return {
    group: g,
    tick: (t, p) => {
      const jerky = Math.floor(t * 1.6) / 1.6;
      const rot = jerky * (1 - p) + t * 1.1 * p;
      g1.rotation.y = rot;
      g2.rotation.y = -rot * 1.45;
      g3.rotation.y = rot * 1.8;
      sparks.forEach((l, i) => {
        (l.material as THREE.LineBasicMaterial).opacity =
          (Math.sin(t * 9 + i * 2) > 0.55 ? 0.9 : 0) * (1 - p);
      });
    },
  };
}

// toppled boxes → tidy pyramid
function makeScaling(): Prop {
  const g = new THREE.Group();
  const cubes: THREE.Mesh[] = [];
  const chaos = [
    { pos: new THREE.Vector3(0, 0.11, 0), rot: new THREE.Euler(0, 0.3, 0) },
    { pos: new THREE.Vector3(0.36, 0.11, 0.24), rot: new THREE.Euler(0, 0.8, 0.4) },
    { pos: new THREE.Vector3(-0.4, 0.11, 0.16), rot: new THREE.Euler(0.5, 0.2, 0) },
    { pos: new THREE.Vector3(0.12, 0.33, 0.02), rot: new THREE.Euler(0, 0.6, 0.25) },
    { pos: new THREE.Vector3(0.62, 0.11, -0.16), rot: new THREE.Euler(0.4, 0, 0.9) },
    { pos: new THREE.Vector3(-0.2, 0.11, -0.36), rot: new THREE.Euler(0, 1.1, 0.5) },
  ];
  const order = [
    new THREE.Vector3(-0.26, 0.11, 0),
    new THREE.Vector3(0, 0.11, 0),
    new THREE.Vector3(0.26, 0.11, 0),
    new THREE.Vector3(-0.13, 0.33, 0),
    new THREE.Vector3(0.13, 0.33, 0),
    new THREE.Vector3(0, 0.55, 0),
  ];
  for (let i = 0; i < 6; i++) {
    const c = box(0.22, 0.22, 0.22, shellMat(i === 5 ? 0x3a2026 : 0x22252f));
    g.add(c);
    cubes.push(c);
  }
  return {
    group: g,
    tick: (_t, p) => {
      cubes.forEach((c, i) => {
        c.position.lerpVectors(chaos[i].pos, order[i], p);
        c.rotation.set(chaos[i].rot.x * (1 - p), chaos[i].rot.y * (1 - p), chaos[i].rot.z * (1 - p));
      });
    },
  };
}

// flatlined performance display → live rising bars
function makeVisibility(): Prop {
  const g = new THREE.Group();
  const panel = box(1.05, 0.72, 0.07, shellMat(0x121319));
  panel.position.y = 1.35;
  g.add(panel);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), shellMat(0x2a2d38));
  stand.position.y = 0.5;
  g.add(stand);
  const foot = box(0.5, 0.04, 0.3, shellMat(0x1a1d26));
  foot.position.y = 0.02;
  g.add(foot);
  const flat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.024, 0.02), redGlowMat(1.5));
  flat.position.set(0, 1.35, 0.05);
  g.add(flat);
  const bars: THREE.Mesh[] = [];
  const hs = [0.14, 0.24, 0.19, 0.32, 0.42];
  hs.forEach((h, i) => {
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, h, 0.03),
      i === 3 ? redGlowMat(1.2) : shellMat(0x3a3f4d)
    );
    b.position.set(-0.34 + i * 0.17, 0, 0.05);
    g.add(b);
    bars.push(b);
  });
  return {
    group: g,
    tick: (t, p) => {
      (flat.material as THREE.MeshStandardMaterial).emissiveIntensity =
        (1.1 + Math.sin(t * 2.4) * 0.5) * (1 - p);
      flat.scale.setScalar(Math.max(0.001, 1 - p));
      bars.forEach((b, i) => {
        const grow = Math.max(0.001, p * (0.75 + Math.sin(t * 1.4 + i) * 0.25));
        b.scale.y = grow;
        const h = (b.geometry as THREE.BoxGeometry).parameters.height;
        b.position.y = 1.06 + (h * grow) / 2;
      });
    },
  };
}

// tipping balance → level
function makeBalance(): Prop {
  const g = new THREE.Group();
  const wedge = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.2, 0.28, 4), shellMat(0x22252f));
  wedge.position.y = 0.14;
  addEdges(wedge, 0.4);
  g.add(wedge);
  const plankG = new THREE.Group();
  plankG.position.y = 0.3;
  const plank = box(1.0, 0.035, 0.2, shellMat(0x2a2d38));
  plankG.add(plank);
  const w1 = box(0.16, 0.16, 0.16, shellMat(0x22252f));
  w1.position.set(-0.4, 0.1, 0);
  const w2 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.13), redGlowMat(0.9));
  w2.position.set(0.41, 0.09, 0);
  plankG.add(w1, w2);
  g.add(plankG);
  return {
    group: g,
    tick: (t, p) => {
      plankG.rotation.z = Math.sin(t * 1.7) * 0.24 * (1 - p);
    },
  };
}

// ghost ULD, meter at 42% → solid, 100%
function makeCapacity(): Prop {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-0.42, 0);
  shape.lineTo(0.42, 0);
  shape.lineTo(0.42, 0.62);
  shape.lineTo(-0.19, 0.62);
  shape.lineTo(-0.42, 0.38);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.48, bevelEnabled: false });
  const fillMat = new THREE.MeshStandardMaterial({
    color: SHELL,
    metalness: 0.5,
    roughness: 0.45,
    transparent: true,
    opacity: 0.14,
  });
  const uld = new THREE.Mesh(geo, fillMat);
  uld.position.z = -0.24;
  const lines = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
  );
  uld.add(lines);
  g.add(uld);
  const meterBg = box(0.07, 0.62, 0.05, shellMat(0x191b22));
  meterBg.position.set(0.6, 0.31, 0);
  g.add(meterBg);
  const meterFill = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.62, 0.04), redGlowMat(1.2));
  g.add(meterFill);
  return {
    group: g,
    tick: (_t, p) => {
      fillMat.opacity = 0.14 + 0.72 * p;
      const load = 0.42 + 0.58 * p;
      meterFill.scale.y = load;
      meterFill.position.set(0.6, 0.31 * load, 0);
    },
  };
}

// desk phone ringing off the hook → quiet, checked
function makePhoneProp(): Prop {
  const g = new THREE.Group();
  const body = box(0.5, 0.16, 0.3);
  body.position.y = 0.08;
  g.add(body);
  const handset = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.04, 8, 20, Math.PI),
    shellMat(0x1b1d26)
  );
  handset.position.set(0, 0.2, 0);
  g.add(handset);
  const rings: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(
      new THREE.TorusGeometry(0.16 + i * 0.1, 0.01, 8, 32),
      new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.6 })
    );
    r.rotation.x = Math.PI / 2;
    r.position.y = 0.36 + i * 0.12;
    g.add(r);
    rings.push(r);
  }
  const tickMesh = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 8, 24), redGlowMat(1.4));
  tickMesh.position.y = 0.42;
  tickMesh.scale.setScalar(0.001);
  g.add(tickMesh);
  return {
    group: g,
    tick: (t, p) => {
      rings.forEach((r, i) => {
        const ph = (t * 0.9 + i * 0.33) % 1;
        r.scale.setScalar(0.7 + ph * 0.7);
        (r.material as THREE.MeshBasicMaterial).opacity = (1 - ph) * 0.6 * (1 - p);
      });
      handset.position.y = 0.2 + Math.sin(t * 14) * 0.012 * (1 - p);
      tickMesh.scale.setScalar(Math.max(0.001, p));
      tickMesh.rotation.y = t * 0.6;
    },
  };
}

// server rack burning coins → lean and steady
function makeTechCost(): Prop {
  const g = new THREE.Group();
  const rack = box(0.5, 1.0, 0.45, shellMat(0x191b22));
  rack.position.y = 0.5;
  g.add(rack);
  const leds: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const led = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.02), redGlowMat(1.4));
    led.position.set(0, 0.26 + i * 0.26, 0.24);
    g.add(led);
    leds.push(led);
  }
  const coins: THREE.Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 14), shellMat(0x3a3d48));
    addEdges(coin, 0.3);
    coin.position.set(0.42, 0.02 + i * 0.04, 0.1);
    if (i === 3) coin.rotation.z = 0.4;
    g.add(coin);
    coins.push(coin);
  }
  return {
    group: g,
    tick: (t, p) => {
      leds.forEach((led, i) => {
        (led.material as THREE.MeshStandardMaterial).emissiveIntensity =
          (0.5 + Math.abs(Math.sin(t * 6 + i * 1.3))) * (1 - p) + 0.5 * p;
      });
      coins.forEach((coin) => coin.scale.setScalar(Math.max(0.001, 1 - p)));
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
    renderer.toneMappingExposure = 1.0;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(INK, 0.04);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.32;
    const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 80);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.8, 0.24);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* --- lights --- */
    scene.add(new THREE.AmbientLight(0x2a2a2e, 2.0));
    scene.add(new THREE.HemisphereLight(0x9a9aa0, 0x0a0a0c, 0.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(6, 10, 8);
    scene.add(key);
    const redLight = new THREE.PointLight(RED, 16, 26, 1.8);
    redLight.position.set(0, 3.2, 2);
    scene.add(redLight);
    const coreLight = new THREE.PointLight(0xfff0ee, 0, 24, 1.6);
    coreLight.position.set(0, 3.0, -3.4);
    scene.add(coreLight);

    /* --- floor --- */
    const grid = new THREE.GridHelper(70, 70, 0x1b1b1f, 0x111114);
    grid.position.y = 0;
    scene.add(grid);

    /* --- the ops room: three desks, three people --- */
    const DESKS = [
      { pos: new THREE.Vector3(-4.6, 0, 0.2), rotY: 0.42 },
      { pos: new THREE.Vector3(0, 0, -1.0), rotY: -0.06 },
      { pos: new THREE.Vector3(4.6, 0, 0.2), rotY: -0.42 },
    ];
    const people: Person[] = [];
    const deskMonitors: THREE.Vector3[] = [];
    DESKS.forEach((d, i) => {
      const dg = new THREE.Group();
      dg.position.copy(d.pos);
      dg.rotation.y = d.rotY;
      scene.add(dg);
      // desk
      const top = box(2.5, 0.07, 1.05, shellMat(0x1a1d26));
      top.position.y = 1.0;
      dg.add(top);
      const legL = box(0.07, 1.0, 0.9, shellMat(0x14161d));
      legL.position.set(-1.15, 0.5, 0);
      const legR = box(0.07, 1.0, 0.9, shellMat(0x14161d));
      legR.position.set(1.15, 0.5, 0);
      dg.add(legL, legR);
      // monitor + keyboard
      const mon = box(0.85, 0.5, 0.05, shellMat(0x121319));
      mon.position.set(0.5, 1.5, 0.12);
      mon.rotation.y = -0.2;
      dg.add(mon);
      const monStand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.25, 8),
        shellMat(0x2a2d38)
      );
      monStand.position.set(0.5, 1.14, 0.12);
      dg.add(monStand);
      const kb = box(0.6, 0.03, 0.2, shellMat(0x22252f));
      kb.position.set(-0.3, 1.06, -0.25);
      dg.add(kb);
      // screen glow toward the operator
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.48),
        new THREE.MeshBasicMaterial({
          color: 0x3a1216,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        })
      );
      glow.position.set(0.5, 1.5, 0.085);
      glow.rotation.y = -0.2;
      dg.add(glow);
      // operator
      const person = makePerson(i, i * 2.1);
      person.group.position.set(-0.3, 0, -0.95);
      dg.add(person.group);
      people.push(person);
      // soft ground shadow
      const sh = new THREE.Mesh(
        new THREE.CircleGeometry(1.9, 24),
        new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
      );
      sh.rotation.x = -Math.PI / 2;
      sh.position.set(d.pos.x, 0.01, d.pos.z - 0.2);
      scene.add(sh);
      deskMonitors.push(new THREE.Vector3(d.pos.x, 1.8, d.pos.z));
    });

    /* --- props placed around the desks (indices match the faults array) --- */
    const place = (prop: Prop, x: number, y: number, z: number, ry = 0) => {
      prop.group.position.set(x, y, z);
      prop.group.rotation.y = ry;
      scene.add(prop.group);
      return prop;
    };
    const props: Prop[] = [
      place(makeContracts(), -6.1, 1.05, 0.9, 0.3), // 0 contracts — left of desk 1
      place(makeQuotes(), -4.3, 1.5, 0.85, 0), // 1 quotations — swirling over desk 1
      place(makeGears(), -1.9, 1.02, 0.4, 0.35), // 2 manual ops — beside desk 2
      place(makeScaling(), 1.9, 0, 1.1, -0.3), // 3 scaling — floor by desk 2
      place(makeVisibility(), 7.0, 0, -0.3, -0.7), // 4 visibility — display right of desk 3
      place(makeBalance(), 5.7, 1.05, 0.75, -0.4), // 5 profitability — on desk 3
      place(makeCapacity(), 3.0, 0, 2.0, 0.5), // 6 capacity — floor front of desk 3
      place(makePhoneProp(), -3.7, 1.05, 0.7, 0.2), // 7 response — phone on desk 1
      place(makeTechCost(), 0.3, 0, -3.4, 0.2), // 8 tech cost — rack behind desk 2
      { group: new THREE.Group(), tick: () => {} }, // 9 ecosystem — links, built below
    ];

    // 9 · broken red links floating between the desks → clean white connections
    {
      const g = new THREE.Group();
      const redLinks: THREE.Line[] = [];
      const whiteLinks: THREE.Line[] = [];
      const mkSeg = (pts: THREE.Vector3[], color: number, list: THREE.Line[], op: number) => {
        const l = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(pts),
          new THREE.LineBasicMaterial({ color, transparent: true, opacity: op })
        );
        list.push(l);
        g.add(l);
      };
      mkSeg([new THREE.Vector3(-3.3, 1.55, -0.2), new THREE.Vector3(-2.5, 1.68, -0.5)], RED, redLinks, 0.9);
      mkSeg([new THREE.Vector3(-2.0, 1.72, -0.6), new THREE.Vector3(-1.4, 1.65, -0.7)], RED, redLinks, 0.9);
      mkSeg([new THREE.Vector3(1.4, 1.65, -0.7), new THREE.Vector3(2.1, 1.72, -0.5)], RED, redLinks, 0.9);
      mkSeg([new THREE.Vector3(2.6, 1.68, -0.4), new THREE.Vector3(3.3, 1.55, -0.2)], RED, redLinks, 0.9);
      mkSeg([deskMonitors[0], deskMonitors[1]], 0xffffff, whiteLinks, 0);
      mkSeg([deskMonitors[1], deskMonitors[2]], 0xffffff, whiteLinks, 0);
      scene.add(g);
      props[9] = {
        group: g,
        tick: (t, p) => {
          redLinks.forEach((l, i) => {
            (l.material as THREE.LineBasicMaterial).opacity =
              (0.4 + 0.6 * Math.abs(Math.sin(t * 5 + i * 1.7))) * (1 - p);
          });
          whiteLinks.forEach((l) => {
            (l.material as THREE.LineBasicMaterial).opacity = 0.5 * p;
          });
        },
      };
    }

    /* --- the 360 core rising behind the room --- */
    const core = new THREE.Group();
    const hex = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.42, 6), shellMat(0x181a22));
    addEdges(hex, 0.6);
    core.add(hex);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.46, 6), redGlowMat(1.5));
    core.add(plate);
    const haloMat = new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.55 });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.025, 10, 60), haloMat);
    halo.rotation.x = Math.PI / 2;
    core.add(halo);
    core.position.set(0, 3.0, -4.2);
    core.scale.setScalar(0.001);
    scene.add(core);

    // "Kargo360" wordmark floating above the core
    const brandCanvas = document.createElement("canvas");
    brandCanvas.width = 1024;
    brandCanvas.height = 224;
    const bctx = brandCanvas.getContext("2d")!;
    bctx.textAlign = "left";
    bctx.textBaseline = "middle";
    bctx.font = "700 120px system-ui, -apple-system, sans-serif";
    const wKargo = bctx.measureText("Kargo").width;
    const wAll = wKargo + bctx.measureText("360").width;
    const x0 = (brandCanvas.width - wAll) / 2;
    bctx.shadowColor = "rgba(255,47,69,0.55)";
    bctx.shadowBlur = 28;
    bctx.fillStyle = "#ffffff";
    bctx.fillText("Kargo", x0, 118);
    bctx.fillStyle = "#ff2f45";
    bctx.fillText("360", x0 + wKargo, 118);
    const brandTex = new THREE.CanvasTexture(brandCanvas);
    brandTex.colorSpace = THREE.SRGBColorSpace;
    const brandMat = new THREE.SpriteMaterial({ map: brandTex, transparent: true, opacity: 0, depthWrite: false });
    const brand = new THREE.Sprite(brandMat);
    brand.scale.set(4.0, 0.875, 1);
    brand.position.set(0, 4.55, -4.2);
    scene.add(brand);

    /* --- beams: each desk plugs into the core --- */
    const beams: { tube: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; pulse: THREE.Mesh }[] = [];
    deskMonitors.forEach((from) => {
      const to = core.position.clone();
      const mid = from.clone().lerp(to, 0.5).add(new THREE.Vector3(0, 1.1, 0));
      const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 24, 0.016, 6),
        new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0 })
      );
      const pulse = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 10, 8),
        new THREE.MeshBasicMaterial({ color: 0xffd8d4, transparent: true, opacity: 0 })
      );
      scene.add(tube, pulse);
      beams.push({ tube, curve, pulse });
    });

    /* --- camera: sweep across the desks, then pull back --- */
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-9.2, 2.1, 8.6),
      new THREE.Vector3(-5.8, 1.9, 5.8),
      new THREE.Vector3(-0.6, 1.9, 5.4),
      new THREE.Vector3(4.4, 2.0, 5.8),
      new THREE.Vector3(7.4, 2.6, 7.6),
      new THREE.Vector3(0, 4.8, 12.4),
    ]);
    const targetPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.6, 1.3, 0.4),
      new THREE.Vector3(-2.4, 1.4, 0.1),
      new THREE.Vector3(0, 1.4, -0.4),
      new THREE.Vector3(2.6, 1.4, 0.1),
      new THREE.Vector3(4.6, 1.5, 0.4),
      new THREE.Vector3(0, 2.2, -2.6),
    ]);
    const look = new THREE.Vector3();

    /* --- pill reveal windows + vertical lanes (readable, no overlap) --- */
    const WINDOWS: [number, number][] = [
      [0.02, 0.26], // contracts — desk 1
      [0.06, 0.3], // quotations — desk 1
      [0.2, 0.42], // manual ops — desk 2
      [0.26, 0.48], // scaling — desk 2
      [0.46, 0.68], // visibility — desk 3
      [0.5, 0.7], // profitability — desk 3
      [0.54, 0.72], // capacity — desk 3
      [0.1, 0.34], // response — desk 1
      [0.38, 0.58], // tech cost — behind desk 2
      [0.32, 0.52], // ecosystem — between desks
    ];
    const LANES = [0.4, 1.7, 0.55, 1.3, 0.75, 0.5, 0.6, 0.45, 1.5, 1.35];
    const ANCHORS: THREE.Vector3[] = [
      new THREE.Vector3(-6.1, 1.35, 0.9),
      new THREE.Vector3(-4.3, 1.95, 0.85),
      new THREE.Vector3(-1.9, 1.6, 0.4),
      new THREE.Vector3(1.9, 0.75, 1.1),
      new THREE.Vector3(7.0, 2.15, -0.3),
      new THREE.Vector3(5.7, 1.5, 0.75),
      new THREE.Vector3(3.0, 0.8, 2.0),
      new THREE.Vector3(-3.7, 1.55, 0.7),
      new THREE.Vector3(0.3, 1.2, -3.4),
      new THREE.Vector3(-2.9, 1.6, -0.5),
    ];

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

    const labels = labelRefs.current;
    const chips = chipRefs.current;
    const anchor = new THREE.Vector3();

    /* --- frame loop --- */
    const clock = new THREE.Clock();
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!active) return;
      const t = clock.getElapsedTime();

      // camera sweep
      const camT = smooth(0, 1, progress);
      camera.position.copy(path.getPoint(camT));
      look.copy(targetPath.getPoint(camT));
      camera.lookAt(look);

      // props resolve in place, staggered
      const propPs: number[] = [];
      props.forEach((p, i) => {
        const pi = smooth(0.55 + i * 0.02, 0.71 + i * 0.02, progress);
        propPs.push(pi);
        p.tick(t, pi);
      });
      const avgP = propPs.reduce((s, x) => s + x, 0) / propPs.length;

      // people unwind
      const relax = smooth(0.6, 0.85, progress);
      people.forEach((person, i) => person.setPose(t, relax, -DESKS[i].rotY));

      // core awakens
      const coreP = smooth(0.62, 0.82, progress);
      core.scale.setScalar(Math.max(0.001, coreP));
      core.rotation.y = t * 0.25;
      halo.scale.setScalar(1 + Math.sin(t * 1.4) * 0.04);
      haloMat.opacity = 0.55 * coreP;
      brandMat.opacity = coreP;
      brand.position.y = 4.55 + Math.sin(t * 1.2) * 0.06;
      coreLight.intensity = 24 * coreP;
      redLight.intensity = 16 * (1 - avgP * 0.7) * (0.82 + Math.sin(t * 7) * 0.18 * (1 - avgP));

      // beams + pulses
      const beamP = smooth(0.78, 0.94, progress);
      beams.forEach((b, i) => {
        (b.tube.material as THREE.MeshBasicMaterial).opacity = 0.5 * beamP;
        const pm = b.pulse.material as THREE.MeshBasicMaterial;
        pm.opacity = beamP;
        if (beamP > 0.01) b.pulse.position.copy(b.curve.getPoint((t * 0.35 + i / 3) % 1));
      });

      // pills: sequential reveal per desk, all solutions in the finale
      const finale = progress > 0.8;
      props.forEach((_, i) => {
        const el = labels[i];
        if (!el) return;
        anchor.copy(ANCHORS[i]);
        anchor.y += LANES[i] * 0.55;
        anchor.project(camera);
        const behind = anchor.z > 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const x = (anchor.x * 0.5 + 0.5) * w;
        const y = (-anchor.y * 0.5 + 0.5) * h;
        el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
        const inWindow = progress >= WINDOWS[i][0] && progress <= WINDOWS[i][1];
        const clipped = behind || y < 300 || y > h - 170 || x < 90 || x > w - 90;
        el.style.opacity = !clipped && (inWindow || finale) ? "1" : "0";
        el.dataset.fixed = propPs[i] > 0.6 ? "1" : "0";
        const chip = chips[i];
        if (chip) chip.dataset.fixed = propPs[i] > 0.6 ? "1" : "0";
      });

      // headline + progress rail
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
      brandTex.dispose();
      composer.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[560vh] bg-ink-950">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink-950 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent"
        />

        {/* problem / solution pills */}
        <div className="pointer-events-none absolute inset-0">
          {faults.map((f, i) => (
            <div
              key={f}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              data-fixed="0"
              className="group absolute left-0 top-0 opacity-0 transition-opacity duration-500 will-change-transform"
            >
              <div className="flex items-center gap-2.5 rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-widest shadow-[0_10px_30px_-8px_rgba(0,0,0,0.8)] backdrop-blur-md transition-colors duration-500 group-data-[fixed=0]:border-signal-red/60 group-data-[fixed=0]:bg-ink-950/85 group-data-[fixed=0]:text-white group-data-[fixed=1]:border-white/30 group-data-[fixed=1]:bg-ink-950/85 group-data-[fixed=1]:text-white">
                <span className="text-signal-crimson group-data-[fixed=1]:hidden">✕</span>
                <span className="hidden text-signal-crimson group-data-[fixed=1]:inline">✓</span>
                <span className="group-data-[fixed=1]:hidden">{f}</span>
                <span className="hidden group-data-[fixed=1]:inline">{cures[i]}</span>
              </div>
              <div className="mx-auto h-6 w-px bg-white/30" />
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
                <span className="heading-shine">A Team Under Pressure.</span>
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
                <span className="text-signal">The Same Team, At Ease.</span>
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

'use client';

import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

useGLTF.setDecoderPath('/draco/');

export const BUDS_URL = '/model/buds.glb';

export type BudsColor = { id: string; name: string; swatch: string };

export const BUDS_COLORS: BudsColor[] = [
  { id: 'white', name: 'White', swatch: '#eceef0' },
  { id: 'black', name: 'Black', swatch: '#3a3c41' },
  { id: 'pink-gold', name: 'Pink Gold', swatch: '#efd3c8' },
];

export type BudsRig = {
  root: THREE.Group;
  lid: THREE.Group;
  budL: THREE.Group;
  budR: THREE.Group;
  budHome: { L: THREE.Vector3; R: THREE.Vector3 };
  budBox: THREE.Box3;
  materials: Map<string, THREE.MeshStandardMaterial>;
  height: number;
};

const PALETTE: Record<string, Record<string, { color: number; metalness: number; roughness: number }>> = {
  white: {
    Case: { color: 0xeceef0, metalness: 0, roughness: 0.4 },
    'Case.002': { color: 0xc3c6cb, metalness: 0.88, roughness: 0.3 },
    'Case.001': { color: 0xa5a8ad, metalness: 0.1, roughness: 0.35 },
  },
  black: {
    Case: { color: 0x2c2e33, metalness: 0.05, roughness: 0.42 },
    'Case.002': { color: 0x8a8d93, metalness: 0.9, roughness: 0.3 },
    'Case.001': { color: 0x4a4c51, metalness: 0.1, roughness: 0.4 },
  },
  'pink-gold': {
    Case: { color: 0xecc3b4, metalness: 0, roughness: 0.4 },
    'Case.002': { color: 0xd3a08f, metalness: 0.88, roughness: 0.3 },
    'Case.001': { color: 0xc9a59a, metalness: 0.1, roughness: 0.35 },
  },
};

export function applyBudsColor(rig: BudsRig, id: string) {
  const p = PALETTE[id] ?? PALETTE.white;
  for (const [name, v] of Object.entries(p)) {
    const m = rig.materials.get(name);
    if (!m) continue;
    m.color.setHex(v.color);
    m.metalness = v.metalness;
    m.roughness = v.roughness;
  }
}

export type RigPose = {
  x: number;
  y: number;
  s: number;
  rx: number;
  ry: number;
  lid: number;
  lift: number;
  spread: number;
  bx: number;
  by: number;
  led: number;
};

export function poseRig(rig: BudsRig, p: RigPose, sway = 0) {
  rig.root.position.set(p.x, p.y, 0);
  rig.root.scale.setScalar(p.s);
  rig.root.rotation.set(p.rx, p.ry, 0);
  rig.lid.rotation.x = -p.lid;
  rig.budL.position.set(rig.budHome.L.x - p.spread, rig.budHome.L.y + p.lift, rig.budHome.L.z);
  rig.budR.position.set(rig.budHome.R.x + p.spread, rig.budHome.R.y + p.lift, rig.budHome.R.z);
  rig.budL.rotation.set(p.bx, -p.by + sway, 0);
  rig.budR.rotation.set(p.bx, p.by - sway, 0);
  const led = rig.materials.get('Light');
  if (led) led.emissiveIntensity = p.led;
}

function pivotAround(parent: THREE.Object3D, child: THREE.Object3D, at: THREE.Vector3) {
  const g = new THREE.Group();
  g.position.copy(at);
  parent.add(g);
  g.updateMatrixWorld(true);
  g.attach(child);
  return g;
}

export function useBudsRig(color = 'white'): BudsRig {
  const { scene } = useGLTF(BUDS_URL);
  return useMemo(() => {
    const model = scene.clone(true);
    const materials = new Map<string, THREE.MeshStandardMaterial>();
    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const swap = (src: THREE.Material) => {
        const name = src.name;
        if (!materials.has(name)) {
          let mat: THREE.MeshStandardMaterial;
          if (name === 'Case_transparent_plastic') {
            mat = new THREE.MeshPhysicalMaterial({
              name,
              color: 0xffffff,
              metalness: 0,
              roughness: 0.04,
              transparent: true,
              opacity: 0.16,
              clearcoat: 1,
              clearcoatRoughness: 0.05,
              envMapIntensity: 1.6,
              depthWrite: false,
              side: THREE.DoubleSide,
            });
          } else if (name === 'Light') {
            mat = new THREE.MeshStandardMaterial({ name, color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 2.2 });
          } else {
            mat = (src as THREE.MeshStandardMaterial).clone();
          }
          materials.set(name, mat);
        }
        return materials.get(name)!;
      };
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
      if ((Array.isArray(mesh.material) ? mesh.material : [mesh.material]).some((m) => m.transparent)) mesh.renderOrder = 2;
    });

    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const find = (n: string) => model.getObjectByName(n)!;
    const base = find('CaseBase');
    const baseBox = new THREE.Box3().setFromObject(base);

    const lid = pivotAround(model, find('Lid'), new THREE.Vector3(center.x, baseBox.max.y, box.min.z));
    const budPivot = (n: string) => {
      const o = find(n);
      const c = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
      return pivotAround(model, o, c);
    };
    const budL = budPivot('BudL');
    const budR = budPivot('BudR');
    const budBox = new THREE.Box3().setFromObject(budR.children[0]).translate(budR.position.clone().negate());

    const holder = new THREE.Group();
    model.position.copy(center).negate();
    holder.add(model);
    const root = new THREE.Group();
    root.add(holder);
    holder.scale.setScalar(1 / size.x);

    const rig: BudsRig = {
      root,
      lid,
      budL,
      budR,
      budHome: { L: budL.position.clone(), R: budR.position.clone() },
      budBox,
      materials,
      height: size.y / size.x,
    };
    applyBudsColor(rig, color);
    return rig;
  }, [scene, color]);
}

useGLTF.preload(BUDS_URL);

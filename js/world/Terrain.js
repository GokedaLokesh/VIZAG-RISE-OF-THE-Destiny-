import * as THREE from "three";

export class Terrain {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.makeGround();
    this.makeBeach();
    this.makeHills();
    this.makePromenade();
    this.makePalmTrees();
    this.makeBeachFurniture();
  }

  makeGround() {
    const g = new THREE.PlaneGeometry(1100, 1100, 90, 90);
    const m = new THREE.MeshStandardMaterial({ color: 0x536451, roughness: 1 });
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1;
    mesh.receiveShadow = true;
    this.group.add(mesh);
  }

  makeBeach() {
    const sand = new THREE.MeshStandardMaterial({ color: 0xc8ad78, roughness: .96 });
    const beach = new THREE.Mesh(new THREE.PlaneGeometry(760, 150, 24, 6), sand);
    beach.rotation.x = -Math.PI / 2;
    beach.position.set(0, -.62, -55);
    beach.receiveShadow = true;
    this.group.add(beach);

    const wet = new THREE.MeshStandardMaterial({ color: 0x8f9a86, roughness: .42, metalness: .05 });
    const wetSand = new THREE.Mesh(new THREE.PlaneGeometry(720, 25), wet);
    wetSand.rotation.x = -Math.PI / 2;
    wetSand.position.set(0, -.57, -120);
    this.group.add(wetSand);
  }

  makeHills() {
    // Kailasagiri-inspired hill zone, intentionally fictionalized.
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x405d49, roughness: 1 });
    for (let i = 0; i < 14; i++) {
      const h = 25 + Math.random() * 85;
      const r = 30 + Math.random() * 55;
      const hill = new THREE.Mesh(new THREE.ConeGeometry(r, h, 16), hillMat);
      hill.position.set(-255 + Math.random() * 120, h / 2 - 1, -20 + Math.random() * 260);
      hill.rotation.y = Math.random() * Math.PI;
      hill.castShadow = true;
      this.group.add(hill);
    }
  }

  makePromenade() {
    const curb = new THREE.MeshStandardMaterial({ color: 0x8d9188, roughness: .8 });
    const p = new THREE.Mesh(new THREE.BoxGeometry(760, .35, 10), curb);
    p.position.set(0, -.15, -137);
    p.receiveShadow = true;
    this.group.add(p);

    const railingMat = new THREE.MeshStandardMaterial({ color: 0x9aa3a4, roughness: .4, metalness: .65 });
    for (let x = -365; x <= 365; x += 12) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.5, 8), railingMat);
      post.position.set(x, .55, -140);
      this.group.add(post);
      if (x < 365) {
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, 12, 8), railingMat);
        rail.rotation.z = Math.PI / 2;
        rail.position.set(x + 6, 1.05, -140);
        this.group.add(rail);
      }
    }
  }

  makePalmTrees() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x765337, roughness: .9 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2f6845, roughness: .9 });
    for (let i = 0; i < 42; i++) {
      const x = -360 + Math.random() * 720;
      const z = -15 + Math.random() * 110;
      if (Math.abs(x) < 35 && z < 25) continue;

      const h = 5 + Math.random() * 5;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.16, .28, h, 8), trunkMat);
      trunk.position.set(x, h / 2 - .5, z);
      trunk.rotation.z = (Math.random() - .5) * .12;
      trunk.castShadow = true;
      this.group.add(trunk);

      for (let j = 0; j < 7; j++) {
        const leaf = new THREE.Mesh(new THREE.BoxGeometry(.12, .12, 3.4), leafMat);
        leaf.position.set(x, h - .4, z);
        leaf.rotation.y = j * Math.PI * 2 / 7;
        leaf.rotation.x = -.25;
        this.group.add(leaf);
      }
    }
  }

  makeBeachFurniture() {
    const wood = new THREE.MeshStandardMaterial({ color: 0x76553c, roughness: .95 });
    const metal = new THREE.MeshStandardMaterial({ color: 0x555e5f, roughness: .5, metalness: .5 });

    for (let i = 0; i < 18; i++) {
      const x = -330 + Math.random() * 660;
      const z = 5 + Math.random() * 95;
      const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, .18, .65), wood);
      bench.position.set(x, .25, z);
      this.group.add(bench);

      for (const dx of [-.9, .9]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(.12, .7, .12), metal);
        leg.position.set(x + dx, -.1, z);
        this.group.add(leg);
      }
    }
  }
}

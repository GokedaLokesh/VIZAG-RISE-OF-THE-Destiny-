import * as THREE from "three";

export class Buildings {
  constructor(scene) {
    this.group = new THREE.Group();
    scene.add(this.group);
    this.make();
    this.makeLandmark("RK Beach Promenade Hub", 55, -95, 24, 5, 12);
    this.makeLandmark("Kailasagiri Viewpoint", -190, 40, 12, 8, 12);
    this.makeLandmark("Coastal Market", 170, 100, 35, 7, 20);
  }

  make() {
    const mats = [0xb8a995,0x9aabb0,0xd1c4a8,0x8c9b88,0xb6a3a1,0x7d8d9a];
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0x9bc5cf, roughness: .18, metalness: .15,
      emissive: 0x19353b, emissiveIntensity: .08
    });

    for (let i = 0; i < 190; i++) {
      const x = -440 + Math.random() * 880;
      const z = 25 + Math.random() * 570;
      if (Math.abs(x) < 330 && z < 80) continue;
      if (Math.random() < .18) continue;

      const w = 9 + Math.random() * 25;
      const d = 9 + Math.random() * 22;
      const h = 6 + Math.random() * 40;
      const m = new THREE.MeshStandardMaterial({ color: mats[i % mats.length], roughness: .78 });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      b.position.set(x, h / 2 - .5, z);
      b.castShadow = true;
      b.receiveShadow = true;
      this.group.add(b);

      if (Math.random() < .42) this.addWindows(b, w, h, d, windowMat);
      if (Math.random() < .16) this.addShopfront(b, w, d);
    }
  }

  addWindows(b, w, h, d, mat) {
    const floors = Math.max(1, Math.floor(h / 4.5));
    for (let floor = 0; floor < floors; floor++) {
      for (let x = -w / 2 + 2.2; x < w / 2 - 1; x += 4.2) {
        const q = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.1), mat);
        q.position.set(x, 2.3 + floor * 4.2, d / 2 + .012);
        b.add(q);
      }
    }
  }

  addShopfront(b, w, d) {
    const signMat = new THREE.MeshBasicMaterial({ color: 0xd7bd68 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * .75, 13), 1.2, .08), signMat);
    sign.position.set(0, 2.4, d / 2 + .08);
    b.add(sign);
  }

  makeLandmark(name, x, z, w, h, d) {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8b938f, roughness: .62 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    base.position.set(x, h / 2, z);
    base.castShadow = true;
    this.group.add(base);

    const roof = new THREE.Mesh(
      new THREE.CylinderGeometry(w * .45, w * .65, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x586d70, roughness: .5, metalness: .2 })
    );
    roof.position.set(x, h + 1, z);
    this.group.add(roof);
  }
}

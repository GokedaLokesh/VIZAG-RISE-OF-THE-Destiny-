import * as THREE from "three";

export class Roads {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    scene.add(this.group);
    this.roads = [];
    this.buildNetwork();
    this.addStreetLights();
    this.addSignals();
  }

  road(x, z, w, d, rot = 0, name = "road") {
    const g = new THREE.PlaneGeometry(w, d);
    const m = new THREE.MeshStandardMaterial({ color: 0x202529, roughness: .94 });
    const o = new THREE.Mesh(g, m);
    o.rotation.x = -Math.PI / 2;
    o.rotation.z = rot;
    o.position.set(x, -.48, z);
    o.receiveShadow = true;
    this.group.add(o);
    this.roads.push({ x, z, w, d, rot, name });

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xd8d1ad });
    const length = Math.max(w, d);
    for (let i = -length / 2 + 12; i < length / 2; i += 28) {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.2), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.rotation.z = rot;
      line.position.set(
        x + i * Math.cos(rot),
        -.44,
        z + i * Math.sin(rot)
      );
      this.group.add(line);
    }
  }

  buildNetwork() {
    // Beach Road / central corridors / access roads.
    this.road(0, 170, 820, 34, 0, "Beach Road");
    this.road(120, 265, 900, 30, 0, "Central Corridor");
    this.road(-80, 355, 760, 28, 0, "North Corridor");
    this.road(250, 20, 30, 820, Math.PI / 2, "East Connector");
    this.road(-185, 115, 26, 720, Math.PI / 2, "Hill Connector");
    this.road(25, 330, 32, 850, Math.PI / 2, "City Avenue");
    this.road(120, -35, 880, 28, 0, "Coastal Connector");
    this.road(-300, 250, 25, 470, Math.PI / 2, "West Connector");
  }

  addStreetLights() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3e484b, roughness: .55, metalness: .45 });
    const lampMat = new THREE.MeshStandardMaterial({ color: 0xffdf9a, emissive: 0xffa83d, emissiveIntensity: .7 });
    for (let x = -380; x <= 380; x += 32) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.08, .12, 6, 8), poleMat);
      pole.position.set(x, 2.5, -132);
      this.group.add(pole);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 8), lampMat);
      lamp.position.set(x, 5.45, -132);
      this.group.add(lamp);
    }
  }

  addSignals() {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x343b3d, roughness: .6, metalness: .5 });
    const lightMat = new THREE.MeshStandardMaterial({ color: 0x4d2424, emissive: 0xff1919, emissiveIntensity: .4 });
    for (const [x, z] of [[120, 170], [25, 330], [250, 20], [-185, 115]]) {
      const pole = new THREE.Mesh(new THREE.BoxGeometry(.18, 6, .18), poleMat);
      pole.position.set(x + 7, 2.5, z + 7);
      this.group.add(pole);
      const head = new THREE.Mesh(new THREE.BoxGeometry(.55, 1.6, .4), poleMat);
      head.position.set(x + 7, 5, z + 7);
      this.group.add(head);
      const light = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 8), lightMat);
      light.position.set(x + 7, 5.35, z + 7);
      this.group.add(light);
    }
  }
}

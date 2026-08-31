
import * as THREE from "three";

export class Vehicle {
  constructor(scene, def, pos, options = {}) {
    this.def = def;
    this.position = new THREE.Vector3(...pos);
    this.velocity = new THREE.Vector3();
    this.speed = options.speed ?? 0;
    this.heading = options.heading ?? 0;
    this.fuel = 100;
    this.health = 100;
    this.throttle = 0;
    this.steer = 0;
    this.brake = 0;
    this.isAI = !!options.isAI;
    this.upgrades = options.upgrades || {};
    this.laneIndex = options.laneIndex ?? 0;
    this.laneOffset = options.laneOffset ?? 0;
    this.targetSpeed = options.targetSpeed ?? Math.min(def.speed, 42);
    this.group = new THREE.Group();
    scene.add(this.group);
    this.build();
    this.syncTransform();
  }

  build() {
    const colors = [0x1c6478,0x8a3f3f,0x6b746d,0xc3a45b,0x394b72,0x7d5b91,0xd2d2d2];
    const bodyMat = new THREE.MeshStandardMaterial({
      color: colors[Math.floor(Math.random()*colors.length)],
      roughness: .42, metalness: .18
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x18252c, roughness: .18, metalness: .15
    });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.1,.75,4.1), bodyMat);
    body.position.y = .8;
    body.castShadow = true;
    this.group.add(body);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.65,.55,1.9), glassMat);
    roof.position.y = 1.38;
    roof.castShadow = true;
    this.group.add(roof);

    const wheelMat = new THREE.MeshStandardMaterial({color:0x101214,roughness:1});
    for (const x of [-.92,.92]) for (const z of [-1.35,1.35]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.22,12), wheelMat);
      w.rotation.z = Math.PI/2;
      w.position.set(x,.4,z);
      w.castShadow = true;
      this.group.add(w);
    }

    const lightMat = new THREE.MeshStandardMaterial({
      color: 0xd9e6d9, emissive: 0xffffff, emissiveIntensity: .3
    });
    const rearMat = new THREE.MeshStandardMaterial({
      color: 0x4b1010, emissive: 0xff1515, emissiveIntensity: .5
    });
    for (const x of [-.7,.7]) {
      const head = new THREE.Mesh(new THREE.BoxGeometry(.32,.18,.08), lightMat);
      head.position.set(x,.78,2.06);
      this.group.add(head);
      const rear = new THREE.Mesh(new THREE.BoxGeometry(.32,.18,.08), rearMat);
      rear.position.set(x,.78,-2.06);
      this.group.add(rear);
    }
  }

  setInput(input = {}) {
    this.throttle = THREE.MathUtils.clamp(input.throttle ?? 0, -1, 1);
    this.steer = THREE.MathUtils.clamp(input.steer ?? 0, -1, 1);
    this.brake = THREE.MathUtils.clamp(input.brake ?? 0, 0, 1);
  }

  update(dt, input = null) {
    if (input) this.setInput(input);
    const maxSpeed = this.def.speed || 32;
    const accel = this.def.accel || 9;
    const handling = this.def.handling || 2;

    // Arcade-realistic longitudinal model: engine force + rolling resistance + braking.
    if (!this.isAI) {
      if (this.fuel <= 0) this.throttle = Math.min(0, this.throttle);
      this.speed += this.throttle * accel * dt;
      if (Math.abs(this.throttle) < .05) {
        this.speed *= Math.pow(.35, dt);
      }
      if (this.brake > 0) {
        this.speed = THREE.MathUtils.damp(this.speed, 0, 7 + this.brake * 9, dt);
      }
      this.speed = THREE.MathUtils.clamp(this.speed, -maxSpeed * .35, maxSpeed);
    } else {
      const desired = THREE.MathUtils.clamp(this.targetSpeed, 0, maxSpeed);
      this.speed = THREE.MathUtils.damp(this.speed, desired, 2.8, dt);
    }

    const speedFactor = THREE.MathUtils.clamp(Math.abs(this.speed) / Math.max(12,maxSpeed), 0, 1);
    this.heading += this.steer * handling * speedFactor * dt * (this.speed >= 0 ? 1 : -1);

    const forward = new THREE.Vector3(Math.sin(this.heading),0,Math.cos(this.heading));
    this.velocity.copy(forward).multiplyScalar(this.speed);
    this.position.addScaledVector(this.velocity, dt);
    this.fuel = Math.max(0, this.fuel - Math.abs(this.speed) * dt * .0018);

    this.syncTransform();
  }

  syncTransform() {
    this.group.position.copy(this.position);
    this.group.rotation.y = this.heading;
  }

  damage(amount) {
    this.health = Math.max(0, this.health - Math.max(0, amount));
    return this.health;
  }
}

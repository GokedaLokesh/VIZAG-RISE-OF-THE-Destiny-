
import * as THREE from "three";
import {Vehicle} from "./Vehicle.js";

export class TrafficAI {
  constructor(scene, defs) {
    this.scene = scene;
    this.defs = defs;
    this.cars = [];
    this.timer = 0;
    this.lanes = [
      {x:0,z:145,axis:"x",dir:1,length:820,name:"Beach Road East"},
      {x:0,z:145,axis:"x",dir:-1,length:820,name:"Beach Road West"},
      {x:-40,z:235,axis:"x",dir:1,length:900,name:"MVP–Siripuram East"},
      {x:-40,z:235,axis:"x",dir:-1,length:900,name:"MVP–Siripuram West"},
      {x:20,z:360,axis:"x",dir:1,length:900,name:"Maddilapalem–NAD East"},
      {x:20,z:360,axis:"x",dir:-1,length:900,name:"Maddilapalem–NAD West"},
      {x:300,z:410,axis:"z",dir:1,length:600,name:"NAD North"},
      {x:300,z:410,axis:"z",dir:-1,length:600,name:"NAD South"},
      {x:480,z:235,axis:"z",dir:1,length:700,name:"Gajuwaka North"},
      {x:480,z:235,axis:"z",dir:-1,length:700,name:"Gajuwaka South"},
      {x:-390,z:10,axis:"z",dir:1,length:380,name:"Rushikonda Link"},
      {x:-210,z:40,axis:"z",dir:1,length:500,name:"Kailasagiri Link"},
      {x:95,z:515,axis:"x",dir:1,length:420,name:"Simhachalam Road"},
      {x:490,z:-60,axis:"z",dir:1,length:430,name:"Port Road"}
    ];
  }

  spawn(density=65) {
    const lane = this.lanes[Math.floor(Math.random()*this.lanes.length)];
    const def = this.defs[Math.floor(Math.random()*this.defs.length)];
    const laneOffset = lane.axis === "x" ? (lane.dir > 0 ? -5 : 5) : (lane.dir > 0 ? 5 : -5);
    const t = -lane.length/2 + Math.random()*lane.length;

    let x = lane.x, z = lane.z;
    if (lane.axis === "x") x += t;
    else z += t;

    if (lane.axis === "x") z += laneOffset;
    else x += laneOffset;

    const v = new Vehicle(this.scene, def, [x,0,z], {
      isAI:true,
      heading: lane.axis === "x"
        ? (lane.dir > 0 ? Math.PI/2 : -Math.PI/2)
        : (lane.dir > 0 ? 0 : Math.PI),
      laneIndex: this.lanes.indexOf(lane),
      targetSpeed: Math.min(def.speed || 35, 18 + Math.random()*13 + density*.04)
    });
    v.group.scale.setScalar(.78);
    v.lane = lane;
    this.cars.push(v);
  }

  getNearbyAhead(v) {
    let best = null;
    let bestDistance = Infinity;
    const lane = v.lane;
    const forward = new THREE.Vector3(Math.sin(v.heading),0,Math.cos(v.heading));

    for (const other of this.cars) {
      if (other === v || other.laneIndex !== v.laneIndex) continue;
      const delta = other.position.clone().sub(v.position);
      const ahead = delta.dot(forward);
      if (ahead > 0 && ahead < 28 && delta.length() < bestDistance) {
        best = other;
        bestDistance = delta.length();
      }
    }
    return best;
  }

  update(dt, density=65) {
    this.timer -= dt;
    const target = Math.floor(4 + density * .18);

    if (this.timer <= 0 && this.cars.length < target) {
      this.spawn(density);
      this.timer = Math.max(.25, 1.1 - density*.005);
    }

    for (let i=this.cars.length-1;i>=0;i--) {
      const v = this.cars[i];
      const ahead = this.getNearbyAhead(v);

      if (ahead) {
        const gap = v.position.distanceTo(ahead.position);
        v.targetSpeed = THREE.MathUtils.clamp((gap-5)*1.2, 4, (v.def.speed||35)*.6);
      } else {
        v.targetSpeed = Math.min(v.def.speed||35, 18 + density*.04);
      }

      // Soft traffic-signal behavior at major junctions.
      const nearSignal = (
        Math.abs(v.position.x-120)<10 && Math.abs(v.position.z-170)<9
      );
      if (nearSignal && Math.floor(performance.now()/7000)%3===0) {
        v.targetSpeed = 0;
      }

      v.update(dt);

      const lane = v.lane;
      const maxT = lane.length/2 + 70;
      const t = lane.axis === "x"
        ? v.position.x - lane.x
        : v.position.z - lane.z;

      if (Math.abs(t) > maxT) {
        this.scene.remove(v.group);
        this.cars.splice(i,1);
      }
    }
  }
}

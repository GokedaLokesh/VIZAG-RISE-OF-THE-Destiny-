import * as THREE from "three";
import {Vehicle} from "../vehicles/Vehicle.js";

export class EmergencySystem {
  constructor(scene,vehicleDefs,game){this.scene=scene;this.vehicleDefs=vehicleDefs;this.game=game;this.units=[];this.timer=12;}
  spawn(kind,playerPosition){
    const pattern=kind==="ambulance"?/ambulance|van/i:/fire|truck/i;
    const def=this.vehicleDefs.find(v=>pattern.test(v.name||v.type||""))||this.vehicleDefs.find(v=>/van|truck|suv/i.test(v.name||v.type||""))||this.vehicleDefs[0];if(!def)return;
    const a=Math.random()*Math.PI*2,d=100+Math.random()*140;
    const v=new Vehicle(this.scene,def,[playerPosition.x+Math.cos(a)*d,0,playerPosition.z+Math.sin(a)*d],{isAI:true,targetSpeed:25});
    v.group.scale.setScalar(.82);v.emergency=true;
    const mat=new THREE.MeshStandardMaterial({color:kind==="ambulance"?0xffffff:0xd16b32,emissive:kind==="ambulance"?0x223344:0x331100,emissiveIntensity:.25});
    const box=new THREE.Mesh(new THREE.BoxGeometry(.65,.16,.3),mat);box.position.y=1.72;v.group.add(box);
    this.units.push({vehicle:v,kind,life:32,phase:Math.random()*10});
  }
  update(dt,playerPosition,wanted=0){
    this.timer-=dt;
    if(this.timer<=0&&this.units.length<2&&(wanted>=2||Math.random()<.12)){this.spawn(Math.random()<.55?"ambulance":"fire",playerPosition);this.timer=22+Math.random()*20;}
    for(let i=this.units.length-1;i>=0;i--){const u=this.units[i],v=u.vehicle;u.life-=dt;const dx=playerPosition.x-v.position.x,dz=playerPosition.z-v.position.z,dist=Math.hypot(dx,dz);const targetHeading=Math.atan2(dx,dz);let delta=((targetHeading-v.heading+Math.PI*3)%(Math.PI*2))-Math.PI;v.heading+=delta*Math.min(1,dt*1.2);v.targetSpeed=dist<18?8:26;v.update(dt);if(u.life<=0||dist>420){this.scene.remove(v.group);this.units.splice(i,1);}}
  }
}

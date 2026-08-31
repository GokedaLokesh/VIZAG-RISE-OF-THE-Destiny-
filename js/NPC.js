import * as THREE from "three";
import {NPCBehavior} from "./NPCBehavior.js";

export class NPC {
  constructor(scene, def, pos, options={}) {
    this.def=def;
    this.position=new THREE.Vector3(...pos);
    this.home={x:this.position.x+(Math.random()-.5)*130,z:this.position.z+(Math.random()-.5)*130};
    this.work={x:(Math.random()-.5)*420,z:90+Math.random()*390};
    this.socialTarget=null;
    this.heading=Math.random()*Math.PI*2;
    this.target=null;
    this.animTime=0;
    this.group=new THREE.Group();
    this.group.userData.npc=this;
    scene.add(this.group);
    this.behavior=new NPCBehavior(this);
    this.build();
  }

  build(){
    const skin=[0xc78b64,0xa96948,0x8f593e,0xd19a76][Math.floor(Math.random()*4)];
    const clothes=[0x34516d,0x76523d,0x6d6b3f,0x8a3944,0x475b4e,0x704f8c,0x2f6b63][Math.floor(Math.random()*7)];
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.28,.34,.95,8),new THREE.MeshStandardMaterial({color:clothes,roughness:.9}));
    body.position.y=.65; body.castShadow=true; this.group.add(body); this.body=body;
    const head=new THREE.Mesh(new THREE.SphereGeometry(.23,10,8),new THREE.MeshStandardMaterial({color:skin,roughness:.9}));
    head.position.y=1.35; head.castShadow=true; this.group.add(head); this.head=head;
    const legs=new THREE.Mesh(new THREE.BoxGeometry(.38,.65,.22),new THREE.MeshStandardMaterial({color:0x252b31,roughness:1}));
    legs.position.y=.05; legs.castShadow=true; this.group.add(legs); this.legs=legs;
    if(this.def.type==="police"||this.def.type==="security"){
      const cap=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.08,10),new THREE.MeshStandardMaterial({color:this.def.type==="police"?0x1b2c45:0x3b3b3b,roughness:.75}));
      cap.position.y=1.58; this.group.add(cap);
    }
    if(this.def.type==="tourist"){
      const bag=new THREE.Mesh(new THREE.BoxGeometry(.34,.38,.18),new THREE.MeshStandardMaterial({color:0x9b6840,roughness:.9}));
      bag.position.set(0,.75,-.28); this.group.add(bag);
    }
    this.group.scale.setScalar(this.def.scale||1);
    this.sync();
  }

  update(dt,time,context={}){
    this.behavior.update(dt,time,context);
    const stride=Math.sin(this.animTime||0)*.035;
    if(this.legs)this.legs.rotation.x=stride;
    this.sync();
  }
  sync(){this.group.position.copy(this.position);this.group.rotation.y=this.heading;}
}

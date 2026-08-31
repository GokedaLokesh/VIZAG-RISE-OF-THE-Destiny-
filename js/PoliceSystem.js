import * as THREE from "three";
import {NPC} from "../npc/NPC.js";
import {Vehicle} from "../vehicles/Vehicle.js";

export class PoliceSystem {
  constructor(scene,npcDefs=[],vehicleDefs=[],game=null){
    this.scene=scene; this.npcDefs=npcDefs; this.vehicleDefs=vehicleDefs; this.game=game;
    this.wanted=0; this.lastCrime=0; this.units=[]; this.searchTimer=0; this.arrestCooldown=0; this.lastStatus="CALM";
  }
  addCrime(amount=1){this.wanted=THREE.MathUtils.clamp(this.wanted+amount,0,5);this.lastCrime=performance.now()/1000;this.searchTimer=0;this.lastStatus="ALERT";this.game?.ui?.toast(`WANTED LEVEL ${Math.ceil(this.wanted)}`);}
  clearWanted(){this.wanted=0;this.lastCrime=0;this.removeUnits();this.lastStatus="CALM";}
  removeUnits(){for(const u of this.units){if(u.group)this.scene.remove(u.group);if(u.vehicle?.group)this.scene.remove(u.vehicle.group);}this.units.length=0;}
  spawnOfficer(playerPosition){
    const def=this.npcDefs.find(x=>x.type==="police")||{type:"police",scale:1.05};
    const a=Math.random()*Math.PI*2,d=45+Math.random()*65;
    const npc=new NPC(this.scene,def,[playerPosition.x+Math.cos(a)*d,0,playerPosition.z+Math.sin(a)*d]);
    npc.behavior.state="PATROL"; npc.behavior.speed=1.55+Math.random()*.55;
    this.units.push({kind:"officer",npc,phase:Math.random()*10,state:"CHASING",target:playerPosition.clone()});
  }
  spawnPoliceVehicle(playerPosition){
    const def=this.vehicleDefs.find(v=>/police|suv|sedan/i.test(v.name||v.type||""))||this.vehicleDefs[0];
    if(!def)return;
    const a=Math.random()*Math.PI*2,d=85+Math.random()*100;
    const vehicle=new Vehicle(this.scene,def,[playerPosition.x+Math.cos(a)*d,0,playerPosition.z+Math.sin(a)*d],{isAI:true,targetSpeed:28});
    vehicle.group.scale.setScalar(.82); vehicle.emergency=true;
    const beacon=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,.25),new THREE.MeshStandardMaterial({color:0xff3344,emissive:0xff2233,emissiveIntensity:1.5}));
    beacon.position.y=1.75;vehicle.group.add(beacon);
    this.units.push({kind:"policeVehicle",vehicle,state:"CHASING",phase:Math.random()*10});
  }
  update(dt,playerPosition,playerSpeed=0){
    const now=performance.now()/1000;
    if(this.wanted>0 && now-this.lastCrime>16){this.wanted=Math.max(0,this.wanted-dt*.16);if(this.wanted<=.02){this.clearWanted();return;}}
    const desired=Math.min(7,Math.ceil(this.wanted)*1.15);
    let officers=this.units.filter(u=>u.kind==="officer").length;
    while(officers<desired){this.spawnOfficer(playerPosition);officers++;}
    const cars=this.units.filter(u=>u.kind==="policeVehicle").length;
    if(this.wanted>=2 && cars<Math.min(2,Math.ceil(this.wanted/3)))this.spawnPoliceVehicle(playerPosition);

    this.arrestCooldown=Math.max(0,this.arrestCooldown-dt);
    let closest=Infinity;
    for(const u of this.units){
      if(u.kind==="officer"){
        const p=u.npc.position,dx=playerPosition.x-p.x,dz=playerPosition.z-p.z,dist=Math.hypot(dx,dz);closest=Math.min(closest,dist);
        if(this.wanted>0.5){
          if(dist<5.5 && this.arrestCooldown<=0){this.arrestCooldown=5;this.game?.player&&(this.game.player.health=Math.max(25,this.game.player.health-18));this.wanted=Math.max(0,this.wanted-1.5);this.game?.ui?.toast("POLICE ARREST ATTEMPT — ESCAPE!");}
          else {const speed=2.2+this.wanted*.45+(playerSpeed>12?.35:0);p.x+=dx/(dist||1)*speed*dt;p.z+=dz/(dist||1)*speed*dt;u.npc.heading=Math.atan2(dx,dz);u.npc.sync();}
        }
      } else if(u.kind==="policeVehicle"){
        const v=u.vehicle,dx=playerPosition.x-v.position.x,dz=playerPosition.z-v.position.z,dist=Math.hypot(dx,dz);closest=Math.min(closest,dist);
        if(this.wanted>0){const desired=Math.min(v.def.speed||40,24+this.wanted*3);v.targetSpeed=desired;const desiredHeading=Math.atan2(dx,dz);let delta=((desiredHeading-v.heading+Math.PI*3)%(Math.PI*2))-Math.PI;v.heading+=delta*Math.min(1,dt*1.8);v.update(dt);}
      }
    }
    if(this.wanted>0){this.lastStatus=closest<22?"PURSUIT":"SEARCHING";if(closest<24)this.lastCrime=now;if(playerSpeed>32)this.lastCrime=now;}
    this.searchTimer+=dt;
    const maxDist=300;
    for(let i=this.units.length-1;i>=0;i--){const u=this.units[i];const p=u.kind==="officer"?u.npc.position:u.vehicle.position;if(p.distanceTo(playerPosition)>maxDist&&this.wanted<2){if(u.kind==="officer")this.scene.remove(u.npc.group);else this.scene.remove(u.vehicle.group);this.units.splice(i,1);}}
  }
}

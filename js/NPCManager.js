import {NPC} from "./NPC.js";

export class NPCManager {
  constructor(scene, defs) { this.scene=scene; this.defs=defs; this.npcs=[]; this.spawnTimer=0; this.groupTimer=0; }
  spawnOne(playerPosition=null, density=70) {
    const pool=this.defs.filter(d=>d.type!=="police");
    const def=pool[Math.floor(Math.random()*pool.length)]||this.defs[0];
    let x=-560+Math.random()*1120, z=-100+Math.random()*720;
    if(playerPosition && Math.random()<.55){const a=Math.random()*Math.PI*2,d=35+Math.random()*150;x=playerPosition.x+Math.cos(a)*d;z=playerPosition.z+Math.sin(a)*d;}
    const npc=new NPC(this.scene,def,[x,0,z]);
    npc.socialTarget={x:x+(Math.random()-.5)*70,z:z+(Math.random()-.5)*70};
    this.npcs.push(npc);
  }
  formGroups(){
    const candidates=this.npcs.filter(n=>n.def.type!=="security");
    for(let i=0;i<candidates.length-1;i++){
      if(Math.random()<.035){candidates[i].socialTarget=candidates[i+1].position.clone();candidates[i+1].socialTarget=candidates[i].position.clone();}
    }
  }
  update(dt,density=70,gameTime=12,playerPosition=null){
    const target=Math.floor(10+density*.28);
    this.spawnTimer-=dt;
    if(this.spawnTimer<=0&&this.npcs.length<target){this.spawnOne(playerPosition,density);this.spawnTimer=Math.max(.22,1.35-density*.009);}
    this.groupTimer-=dt;if(this.groupTimer<=0){this.formGroups();this.groupTimer=8;}
    for(let i=this.npcs.length-1;i>=0;i--){const n=this.npcs[i];n.update(dt,gameTime,{playerPosition});if(Math.abs(n.position.x)>620||n.position.z>780||n.position.z<-300){this.scene.remove(n.group);this.npcs.splice(i,1);}}
  }
  clear(){for(const n of this.npcs)this.scene.remove(n.group);this.npcs.length=0;}
}

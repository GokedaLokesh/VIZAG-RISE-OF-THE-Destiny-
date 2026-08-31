import * as THREE from "three";
import {PHASE5_ZONES} from "./Phase5World.js";

export class WorldStreaming{
  constructor(game){
    this.game=game; this.zone="RK BEACH"; this.currentId=null; this.streamRadius=235; this.highRadius=115;
    this.zones=PHASE5_ZONES; this.zoneMap=new Map(this.zones.map(z=>[z.id,z]));
    this.lastX=Infinity; this.lastZ=Infinity;
  }
  locate(p){
    let best=null,bestD=Infinity;
    for(const z of this.zones){const d=Math.hypot(p.x-z.cx,p.z-z.cz);if(d<bestD){bestD=d;best=z}}
    return best;
  }
  update(){
    const p=this.game.player?.position;if(!p||!this.game.world)return;
    if(Math.hypot(p.x-this.lastX,p.z-this.lastZ)<8)return;
    this.lastX=p.x;this.lastZ=p.z;
    const current=this.locate(p);if(!current)return;
    this.currentId=current.id;this.zone=current.name;
    let loaded=0,high=0;
    for(const z of this.zones){const d=Math.hypot(p.x-z.cx,p.z-z.cz);const near=d<z.radius+this.streamRadius;const hi=d<z.radius+this.highRadius;z.group.visible=near;if(near)loaded++;if(hi)high++}
    this.game.ui.setZone(current.name);
    this.game.worldStreamingStats={current:current.name,loaded,highDetail:high};
  }
}

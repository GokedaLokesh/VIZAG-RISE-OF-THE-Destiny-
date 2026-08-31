import * as THREE from "three";

const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

export class MissionSystem{
  constructor(game,data){
    this.game=game;
    this.main=data.main||[];
    this.side=data.side||[];
    this.mainIndex=Number(data.mainIndex||0);
    this.sideIndex=Number(data.sideIndex||0);
    this.completed=new Set(data.completed||[]);
    this.current=this.main[this.mainIndex]||null;
    this.activeSide=null;
    this.marker=new THREE.Group();
    this.marker.name="PHASE8_MISSION_MARKERS";
    game.scene.add(this.marker);
    this.markerMesh=null;
    this.dialogue=null;
    this.timer=0;
    this.refreshCurrent();
  }

  refreshCurrent(){
    this.current=this.main[this.mainIndex]||null;
    if(this.current?.checkpoint) this.setMarker(this.current.checkpoint);
    else this.clearMarker();
    this.game.ui?.setMission(this.current);
  }

  setMarker(point){
    this.clearMarker();
    const g=new THREE.Group();
    g.position.set(point.x,0.15,point.z);
    const ring=new THREE.Mesh(new THREE.RingGeometry(2.8,3.25,32),new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.9,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,5,8),new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.55}));
    beam.position.y=2.5;
    g.add(ring,beam);
    this.marker.add(g); this.markerMesh=g;
  }
  clearMarker(){if(this.markerMesh){this.marker.remove(this.markerMesh);this.markerMesh=null}}

  update(dt=0){
    if(!this.current && !this.activeSide)return;
    if(this.timer>0){this.timer-=dt;if(this.timer<=0){this.fail(this.activeSide||this.current,"TIME EXPIRED");return}}
    if(this.activeSide){if(this.evaluate(this.activeSide)){this.completeSide(this.activeSide);this.activeSide=null}return}
    if(this.current && this.evaluate(this.current))this.completeMain(this.current);
  }

  evaluate(m){
    const p=this.game.player.position, o=m.objective||{};
    switch(o.type){
      case "reach": return p.distanceTo(new THREE.Vector3(o.x,1,o.z))<=o.radius;
      case "vehicleReach": return this.game.player.onVehicle && p.distanceTo(new THREE.Vector3(o.x,1,o.z))<=o.radius;
      case "enterVehicle": return !!this.game.player.onVehicle;
      case "leaveVehicle": return !this.game.player.onVehicle && p.distanceTo(new THREE.Vector3(o.x,1,o.z))<=o.radius;
      case "hour": return this.game.dayNight.hour>=o.min && this.game.dayNight.hour<=o.max;
      case "weather": return String(this.game.weather.mode).toLowerCase()===String(o.mode).toLowerCase();
      case "wanted": return (this.game.police?.wanted||0)>=o.min;
      case "clearWanted": return (this.game.police?.wanted||0)<=o.max;
      case "buy": return (this.game.economy?.inventory?.[o.item]||0)>=o.count;
      case "ownProperty": return this.game.economy?.properties?.includes(o.property);
      case "speed": return this.game.player.onVehicle && Math.abs(this.game.vehicle.speed)>=o.min;
      case "stay": return p.distanceTo(new THREE.Vector3(o.x,1,o.z))<=o.radius;
      case "crime": return (this.game.police?.crimeCount||0)>=o.count;
      case "missionCount": return this.completed.size>=o.count;
      case "all": return (o.conditions||[]).every(c=>this.evaluate({...m,objective:c}));
      case "money": return (this.game.player.money||0)>=o.min;
      default: return false;
    }
  }

  completeMain(m){
    if(this.completed.has(m.id))return;
    this.completed.add(m.id);
    this.game.player.money+=m.reward||0;
    this.game.ui.toast(`MISSION COMPLETE • ₹${(m.reward||0).toLocaleString("en-IN")}`);
    if(m.dialogue?.length)this.showDialogue(m.dialogue,()=>this.advanceMain());else this.advanceMain();
  }
  advanceMain(){
    this.mainIndex++;
    this.refreshCurrent();
    if(!this.current){this.clearMarker();this.game.ui.toast("MAIN STORY COMPLETE • FREE ROAM UNLOCKED")}
  }
  completeSide(m){
    if(this.completed.has(m.id))return;
    this.completed.add(m.id);
    this.game.player.money+=m.reward||0;
    this.game.ui.toast(`SIDE MISSION COMPLETE • ₹${(m.reward||0).toLocaleString("en-IN")}`);
    if(m.dialogue?.length)this.showDialogue(m.dialogue);this.refreshCurrent();
  }
  fail(m,reason){this.timer=0;this.activeSide=null;this.game.ui.toast(`${m.title} • ${reason}`);this.refreshCurrent()}

  startSide(id){
    const m=this.side.find(x=>x.id===id);
    if(!m||this.completed.has(id)||this.activeSide)return false;
    this.activeSide=m;this.timer=(m.timeLimit||0);this.setMarker(m.checkpoint||m.objective);this.game.ui.setMission(m);this.game.ui.toast(`SIDE MISSION • ${m.title}`);return true;
  }
  getAvailableSide(){return this.side.filter(m=>!this.completed.has(m.id)&&(!m.unlockAfter||this.completed.has(m.unlockAfter))).slice(0,8)}

  showDialogue(lines,done){
    const panel=document.getElementById("dialogue-panel"),name=document.getElementById("dialogue-name"),text=document.getElementById("dialogue-text"),next=document.getElementById("dialogue-next");
    if(!panel||!lines?.length){done?.();return}
    let i=0;this.game.paused=true;panel.classList.remove("hidden");name.textContent=lines[0].name||"CONTACT";text.textContent=lines[0].text||"";
    const advance=()=>{i++;if(i>=lines.length){panel.classList.add("hidden");this.game.paused=false;next.onclick=null;done?.();return}name.textContent=lines[i].name||"CONTACT";text.textContent=lines[i].text||""};
    next.onclick=advance;
  }

  serialize(){return {mainIndex:this.mainIndex,sideIndex:this.sideIndex,completed:[...this.completed]}}
}

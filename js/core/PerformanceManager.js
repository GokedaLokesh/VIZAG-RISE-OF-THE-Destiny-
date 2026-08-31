import * as THREE from "three";

/** Phase 9: adaptive rendering and lightweight runtime optimization. */
export class PerformanceManager {
  constructor(game){
    this.game=game;
    this.renderer=game.renderer;
    this.scene=game.scene;
    this.camera=game.camera;
    this.mode=game.settings.quality || game.autoQuality || "Medium";
    this.samples=[];
    this.sampleClock=0;
    this.lastCull=0;
    this.lastQualityChange=0;
    this.dynamicScale=this.baseScale(this.mode);
    this.minScale=this.mode==="Low"?.82:this.mode==="High"?.95:.88;
    this.maxScale=this.mode==="Ultra"?1.35:this.mode==="High"?1.15:1;
    this.drawDistance=this.mode==="Low"?520:this.mode==="High"?1050:this.mode==="Ultra"?1300:780;
    this.shadowDistance=this.mode==="Low"?180:this.mode==="High"?420:this.mode==="Ultra"?560:300;
    this.optimizeMaterials();
    this.apply();
  }
  baseScale(q){return q==="Low"?.9:q==="High"?1:q==="Ultra"?1.08:.96}
  setQuality(q){
    this.mode=q;
    this.dynamicScale=this.baseScale(q);
    this.minScale=q==="Low"?.78:q==="High"?.9:q==="Ultra"?.96:.84;
    this.maxScale=q==="Ultra"?1.35:q==="High"?1.15:1;
    this.drawDistance=q==="Low"?520:q==="High"?1050:q==="Ultra"?1300:780;
    this.shadowDistance=q==="Low"?180:q==="High"?420:q==="Ultra"?560:300;
    this.apply();
  }
  apply(){
    const dpr=Math.min(window.devicePixelRatio||1,this.mode==="Low"?1:this.mode==="Medium"?1.35:this.mode==="High"?1.8:2);
    this.renderer.setPixelRatio(dpr*this.dynamicScale);
    this.renderer.shadowMap.enabled=this.mode!=="Low";
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.scene.fog.density=this.mode==="Low"?.003:this.mode==="Medium"?.0022:this.mode==="High"?.0016:.00135;
    this.renderer.toneMappingExposure=this.mode==="Low"?1.02:1.06;
  }
  optimizeMaterials(){
    this.scene.traverse(o=>{
      if(!o.isMesh)return;
      o.frustumCulled=true;
      if(o.material?.isMeshStandardMaterial){
        if(this.mode==="Low") o.material.roughness=Math.max(o.material.roughness||.7,.82);
        if(this.mode==="Low") o.castShadow=false;
      }
    });
  }
  update(dt){
    this.sampleClock+=dt;
    const fps=1/Math.max(dt,.001);
    if(fps<240)this.samples.push(fps);
    if(this.samples.length>45)this.samples.shift();
    if(this.sampleClock<1.5)return;
    this.sampleClock=0;
    const avg=this.samples.reduce((a,b)=>a+b,0)/Math.max(1,this.samples.length);
    const target=this.mode==="Low"?42:50;
    if(performance.now()-this.lastQualityChange>3500){
      if(avg<target-5 && this.dynamicScale>this.minScale){
        this.dynamicScale=Math.max(this.minScale,this.dynamicScale-.06); this.lastQualityChange=performance.now(); this.apply();
      } else if(avg>target+14 && this.dynamicScale<this.maxScale){
        this.dynamicScale=Math.min(this.maxScale,this.dynamicScale+.04); this.lastQualityChange=performance.now(); this.apply();
      }
    }
    this.updateDistanceCulling();
    this.game.performanceStats={fps:Math.round(avg),scale:+this.dynamicScale.toFixed(2),quality:this.mode};
  }
  updateDistanceCulling(){
    const p=this.game.player?.position;if(!p)return;
    const root=this.game.world?.root;
    if(!root)return;
    const max=this.drawDistance, shadowMax=this.shadowDistance;
    root.traverse(o=>{
      if(!o.isMesh)return;
      const wp=o.getWorldPosition(_v);
      const d=p.distanceTo(wp);
      o.visible=d<max;
      if("castShadow" in o)o.castShadow=o.visible&&d<shadowMax&&this.mode!=="Low";
    });
  }
}
const _v=new THREE.Vector3();

import * as THREE from "three";
export class DayNightSystem{
 constructor(scene){this.scene=scene;this.hour=8;this.sun=new THREE.DirectionalLight(0xffffff,2.2);this.sun.position.set(-100,180,100);scene.add(this.sun);this.ambient=new THREE.HemisphereLight(0xbfe5ff,0x26343a,1.1);scene.add(this.ambient)}
 update(dt){this.hour=(this.hour+dt*.12)%24;const a=(this.hour/24)*Math.PI*2;this.sun.position.set(Math.cos(a)*220,Math.sin(a)*220,80);this.sun.intensity=THREE.MathUtils.clamp(Math.sin(a)*2.4+.3,.12,2.5);this.ambient.intensity=this.sun.intensity*.55+.25;const night=this.hour<6||this.hour>18;this.scene.background.setHSL(night?.58:.56,night?.55:.14,night?.18:.55)}}

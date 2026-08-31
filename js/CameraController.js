import * as THREE from "three";
export class CameraController{
 constructor(camera,player){this.camera=camera;this.player=player;this.yaw=0;this.pitch=-.2}
 update(dt,mouse){if(document.pointerLockElement){this.yaw-=mouse.x*.0025;this.pitch=THREE.MathUtils.clamp(this.pitch-mouse.y*.0015,-.9,.45)}const target=this.player.position.clone().add(new THREE.Vector3(0,1.5,0));const dist=this.player.onVehicle?8:6;const off=new THREE.Vector3(0,0,dist).applyEuler(new THREE.Euler(this.pitch,this.yaw,0,"YXZ"));this.camera.position.lerp(target.clone().add(off),1-Math.pow(.001,dt));this.camera.lookAt(target)}
}
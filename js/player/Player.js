import * as THREE from "three";
export class Player{
 constructor(scene){this.position=new THREE.Vector3(0,1,40);this.velocity=new THREE.Vector3();this.jumpVelocity=0;this.health=100;this.stamina=100;this.money=2500;this.onVehicle=null;this.group=new THREE.Group();scene.add(this.group);const body=new THREE.Mesh(new THREE.CapsuleGeometry(.45,1.15,6,12),new THREE.MeshStandardMaterial({color:0x2e5162,roughness:.8}));body.position.y=1;this.group.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.3,12,12),new THREE.MeshStandardMaterial({color:0x9a6c4e,roughness:.9}));head.position.y=1.85;this.group.add(head)}
 get position(){return this.group.position}
 set position(v){this.group.position.copy(v)}
 update(dt,input,world){if(this.onVehicle)return;const dir=new THREE.Vector3(input.x,0,input.z);if(dir.lengthSq()>1)dir.normalize();const sprint=input.sprint&&this.stamina>1;const speed=sprint?8:4.2;this.velocity.x=THREE.MathUtils.damp(this.velocity.x,dir.x*speed,10,dt);this.velocity.z=THREE.MathUtils.damp(this.velocity.z,dir.z*speed,10,dt);this.position.x+=this.velocity.x*dt;this.position.z+=this.velocity.z*dt;this.jumpVelocity-=18*dt;this.position.y+=this.jumpVelocity*dt;if(this.position.y<=1){this.position.y=1;this.jumpVelocity=0}if(sprint)this.stamina=Math.max(0,this.stamina-25*dt);else this.stamina=Math.min(100,this.stamina+18*dt);this.position.x=THREE.MathUtils.clamp(this.position.x,-620,660);this.position.z=THREE.MathUtils.clamp(this.position.z,-360,680)}
 jump(){if(!this.onVehicle&&this.position.y<=1.01)this.jumpVelocity=7}
}

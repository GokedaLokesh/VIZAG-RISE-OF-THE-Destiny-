import * as THREE from "three";
export class Ocean{
 constructor(scene){this.scene=scene;this.mesh=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800,80,80),new THREE.MeshStandardMaterial({color:0x126078,roughness:.18,metalness:.12,transparent:true,opacity:.92}));this.mesh.rotation.x=-Math.PI/2;this.mesh.position.set(0,-1.2,-330);scene.add(this.mesh);this.t=0}
 update(dt){this.t+=dt;const p=this.mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,Math.sin(x*.018+this.t*1.4)*.8+Math.sin(y*.025+this.t*.9)*.45)}p.needsUpdate=true;this.mesh.geometry.computeVertexNormals()}
}

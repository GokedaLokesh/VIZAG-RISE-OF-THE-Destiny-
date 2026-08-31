import * as THREE from "three";

// Phase 5: fictionalized/procedural Vizag-inspired world. Real place names are reference points;
// geometry is original and intentionally does not reproduce individual real buildings.
export const PHASE5_ZONES = [
  {id:"rk-beach", name:"RK BEACH", cx:0, cz:-25, type:"coast", radius:150, seed:11},
  {id:"beach-road", name:"BEACH ROAD", cx:80, cz:125, type:"coast", radius:155, seed:22},
  {id:"kailasagiri", name:"KAILASAGIRI", cx:-210, cz:-25, type:"hill", radius:145, seed:33},
  {id:"mvp-colony", name:"MVP COLONY", cx:-105, cz:235, type:"residential", radius:155, seed:44},
  {id:"maddilapalem", name:"MADDILAPALEM", cx:-70, cz:390, type:"residential", radius:155, seed:55},
  {id:"siripuram", name:"SIRIPURAM", cx:95, cz:235, type:"commercial", radius:150, seed:66},
  {id:"dwaraka-nagar", name:"DWARAKA NAGAR", cx:260, cz:245, type:"commercial", radius:155, seed:77},
  {id:"nad", name:"NAD JUNCTION", cx:350, cz:410, type:"junction", radius:150, seed:88},
  {id:"gajuwaka", name:"GAJUWAKA", cx:500, cz:235, type:"industrial", radius:160, seed:99},
  {id:"rushikonda", name:"RUSHIKONDA", cx:-390, cz:-10, type:"coast", radius:145, seed:111},
  {id:"simhachalam", name:"SIMHACHALAM", cx:95, cz:515, type:"hill", radius:150, seed:122},
  {id:"port", name:"PORT / YARADA", cx:490, cz:-80, type:"industrial", radius:170, seed:133}
];

function rng(seed){let s=seed>>>0;return ()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
function mat(color, roughness=.85, metalness=0){return new THREE.MeshStandardMaterial({color,roughness,metalness})}

export class Phase5World {
  constructor(scene){
    this.scene=scene; this.root=new THREE.Group(); this.root.name="PHASE5_WORLD"; scene.add(this.root);
    this.zones=new Map(); this.buildBase();
    for(const z of PHASE5_ZONES)this.buildZone(z);
    this.buildCoastline(); this.buildLandmarks();
  }

  buildBase(){
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(1450,1050,20,20),mat(0x536b58,1));
    ground.rotation.x=-Math.PI/2; ground.position.set(0,-1.05,170); ground.receiveShadow=true; this.root.add(ground);
    const inland=new THREE.Mesh(new THREE.PlaneGeometry(1450,1050),mat(0x5f755d,1));
    inland.rotation.x=-Math.PI/2; inland.position.set(0,-1.01,170); this.root.add(inland);
  }

  buildZone(z){
    const group=new THREE.Group(); group.name=`ZONE_${z.id}`; this.root.add(group); z.group=group; this.zones.set(z.id,z);
    const r=rng(z.seed), roadMat=mat(0x25292b,.96), edgeMat=mat(0xc6b995,.9);
    const roadCount=z.type==="junction"?5:3;
    for(let i=0;i<roadCount;i++){
      const horizontal=i%2===0; const span=z.radius*1.65; const off=(i-Math.floor(roadCount/2))*34;
      const road=new THREE.Mesh(new THREE.PlaneGeometry(horizontal?span:24,horizontal?24:span),roadMat);
      road.rotation.x=-Math.PI/2; road.position.set(z.cx+(horizontal?0:off),-.92,z.cz+(horizontal?off:0)); road.receiveShadow=true; group.add(road);
      const stripe=new THREE.Mesh(new THREE.PlaneGeometry(horizontal?span:1.2,horizontal?1.2:span),edgeMat);
      stripe.rotation.x=-Math.PI/2; stripe.position.set(z.cx+(horizontal?0:off),-.9,z.cz+(horizontal?off:0)); group.add(stripe);
    }
    if(z.type==="hill")this.hills(group,z,r);
    this.buildings(group,z,r);
    this.props(group,z,r);
    this.zoneLabel(group,z);
  }

  buildings(group,z,r){
    const palettes={residential:[0xc7b79f,0xb89f8b,0xd4c7ae],commercial:[0x9aaeb5,0xc7a66e,0x9b8a83],industrial:[0x777d78,0x858b83,0x6d747b],junction:[0x9b9b91,0xb0a38e,0x8c9a9d],coast:[0xcbb99a,0xb9aaa1,0xd0c6ad],hill:[0x9fa993,0xb1a98d,0x8f9d91]};
    const colors=palettes[z.type]||palettes.residential; const count=z.type==="commercial"?34:z.type==="industrial"?25:28;
    for(let i=0;i<count;i++){
      const x=z.cx+(r()-.5)*z.radius*1.65, zz=z.cz+(r()-.5)*z.radius*1.65;
      if(Math.abs(x-z.cx)<45 || Math.abs(zz-z.cz)<45)continue;
      const w=8+r()*18,d=8+r()*18,h=(z.type==="industrial"?5:6)+r()*(z.type==="commercial"?42:27);
      const b=new THREE.Group(); b.position.set(x,0,zz);
      const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(colors[i%colors.length],.8)); body.position.y=h/2-1; body.castShadow=true; body.receiveShadow=true; b.add(body);
      const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.88,Math.max(.35,h*.045),d*.88),mat(0x4d5657,.7)); roof.position.y=h-.8; b.add(roof);
      if(r()<.65)this.windows(b,w,d,h);
      if(z.type==="commercial"&&r()<.65)this.shopSign(b,w,d);
      if(z.type==="residential"&&r()<.4)this.wallAndGate(b,w,d);
      group.add(b);
    }
  }

  windows(b,w,d,h){
    const wm=mat(0x7eb1bd,.25,.12); const floors=Math.min(8,Math.floor(h/5));
    for(let f=0;f<floors;f++)for(let x=-w/2+2;x<w/2-1;x+=4){
      const q=new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.15),wm); q.position.set(x,2.4+f*4.4,d/2+.02); b.add(q);
    }
  }
  shopSign(b,w,d){const s=new THREE.Mesh(new THREE.BoxGeometry(Math.min(w*.8,12),1.2,.08),mat(0xe0bd61,.65));s.position.set(0,2.5,d/2+.08);b.add(s)}
  wallAndGate(b,w,d){const wm=mat(0xb7a58c,.95);const wall=new THREE.Mesh(new THREE.BoxGeometry(w+3,.9,.25),wm);wall.position.set(0,.4,d/2+3);b.add(wall)}

  props(group,z,r){
    const pole=mat(0x3c4547,.55,.5), light=mat(0xf1c46d,.3,.1);
    for(let i=0;i<6;i++){const x=z.cx+(r()-.5)*z.radius*1.5, zz=z.cz+(r()-.5)*z.radius*1.5;const p=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,5.5,7),pole);p.position.set(x,1.75,zz);group.add(p);const l=new THREE.Mesh(new THREE.SphereGeometry(.16,7,7),light);l.position.set(x,4.5,zz);group.add(l)}
    if(z.type==="commercial"||z.type==="junction"){
      for(let i=0;i<4;i++){const sign=new THREE.Mesh(new THREE.BoxGeometry(3,.12,1),mat(0xd6d8c8,.7));sign.position.set(z.cx+(r()-.5)*z.radius,z.cz+(r()-.5)*z.radius,2.6);sign.rotation.y=r()*Math.PI;group.add(sign)}
    }
  }

  hills(group,z,r){const hm=mat(0x48664e,1);for(let i=0;i<9;i++){const h=30+r()*75,rad=25+r()*45;const hill=new THREE.Mesh(new THREE.ConeGeometry(rad,h,12),hm);hill.position.set(z.cx+(r()-.5)*110,h/2-1,z.cz+(r()-.5)*130);hill.scale.z=.8;hill.castShadow=true;group.add(hill)}}

  buildCoastline(){
    const sand=mat(0xcdb37e,.98), wet=mat(0x8d9a87,.5);
    for(const [x,z,w] of [[0,-108,330],[130,-75,190],[-330,-92,150]]){
      const beach=new THREE.Mesh(new THREE.PlaneGeometry(w,72),sand);beach.rotation.x=-Math.PI/2;beach.position.set(x,-.72,z);this.root.add(beach);
      const wetStrip=new THREE.Mesh(new THREE.PlaneGeometry(w,12),wet);wetStrip.rotation.x=-Math.PI/2;wetStrip.position.set(x,-.68,z-36);this.root.add(wetStrip);
    }
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(1450,220),mat(0x236b83,.28,.1));sea.rotation.x=-Math.PI/2;sea.position.set(0,-.55,-190);this.root.add(sea);
  }

  buildLandmarks(){
    const items=[['RK BEACH PROMENADE',45,-90,22,5],['COASTAL MARKET',170,100,28,8],['KAILASAGIRI VIEWPOINT',-205,45,18,9],['NAD TRANSPORT HUB',350,410,24,7],['GAJUWAKA INDUSTRIAL HUB',500,235,28,8]];
    for(const [name,x,z,w,h] of items){const g=new THREE.Group();g.name=name;const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,w*.7),mat(0x7d8886,.65));b.position.y=h/2-.6;b.castShadow=true;g.add(b);const roof=new THREE.Mesh(new THREE.CylinderGeometry(w*.38,w*.55,2.2,6),mat(0x4d6265,.5,.2));roof.position.y=h+.6;g.add(roof);g.position.set(x,0,z);this.root.add(g)}
  }

  zoneLabel(group,z){
    // Lightweight floating marker; useful for navigation and debugging, not a real-world sign.
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=80;const c=canvas.getContext('2d');c.fillStyle='rgba(5,14,20,.82)';c.fillRect(0,0,512,80);c.fillStyle='#eafcff';c.font='bold 30px system-ui';c.fillText(z.name,18,50);const tex=new THREE.CanvasTexture(canvas);const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));spr.scale.set(32,5,1);spr.position.set(z.cx,26,z.cz);group.add(spr)
  }
}

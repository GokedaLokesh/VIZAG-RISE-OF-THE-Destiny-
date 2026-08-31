import * as THREE from "three";

export const BUSINESSES = [
  {id:"rk-market", name:"RK COAST MARKET", type:"shop", x:45, z:-62, district:"RK Beach", items:["food","drink"]},
  {id:"beach-restaurant", name:"COASTLINE RESTAURANT", type:"restaurant", x:125, z:55, district:"Beach Road", items:["meal","juice"]},
  {id:"mvp-clothes", name:"MVP STYLE HOUSE", type:"clothes", x:-110, z:210, district:"MVP Colony", items:["shirt","jacket"]},
  {id:"siripuram-mart", name:"SIRIPURAM MART", type:"shop", x:85, z:205, district:"Siripuram", items:["food","medkit"]},
  {id:"dwaraka-garage", name:"DWARAKA AUTO GARAGE", type:"garage", x:285, z:210, district:"Dwaraka Nagar"},
  {id:"nad-fuel", name:"NAD FUEL STOP", type:"fuel", x:355, z:370, district:"NAD Junction"},
  {id:"gajuwaka-garage", name:"GAJUWAKA MOTOR WORKS", type:"garage", x:475, z:205, district:"Gajuwaka"},
  {id:"rushikonda-cafe", name:"RUSHIKONDA CAFE", type:"restaurant", x:-365, z:20, district:"Rushikonda", items:["meal","juice"]},
  {id:"port-fuel", name:"PORT FUEL STATION", type:"fuel", x:455, z:-45, district:"Port / Yarada"},
  {id:"simhachalam-home", name:"SIMHACHALAM HOMES", type:"property", x:70, z:480, district:"Simhachalam", property:"hill-house"},
  {id:"beach-apartment", name:"COASTAL VIEW APARTMENTS", type:"property", x:20, z:-45, district:"RK Beach", property:"beach-apartment"},
  {id:"city-office", name:"DOWNTOWN SAFEHOUSE", type:"property", x:245, z:275, district:"Dwaraka Nagar", property:"safehouse"}
];

const ITEMS = {
  food:{name:"Street Meal",price:80,heal:8}, drink:{name:"Cool Drink",price:40,stamina:15}, meal:{name:"Restaurant Meal",price:180,heal:25,stamina:10}, juice:{name:"Fresh Juice",price:90,stamina:25}, shirt:{name:"New Shirt",price:650}, jacket:{name:"Street Jacket",price:1200}, medkit:{name:"First Aid Kit",price:300,heal:45}
};

function material(color){return new THREE.MeshStandardMaterial({color,roughness:.55,metalness:.08});}

export class EconomySystem {
  constructor(game){
    this.game=game; this.businesses=BUSINESSES.map(b=>({...b})); this.inventory={food:0,drink:0,meal:0,juice:0,shirt:0,jacket:0,medkit:0};
    this.properties=[]; this.active=null; this.markerRoot=new THREE.Group(); this.markerRoot.name="PHASE6_BUSINESS_MARKERS"; game.scene.add(this.markerRoot); this.buildMarkers(); this.load();
  }
  buildMarkers(){
    for(const b of this.businesses){
      const g=new THREE.Group(); g.position.set(b.x,0,b.z); g.name=`BUSINESS_${b.id}`;
      const base=new THREE.Mesh(new THREE.CylinderGeometry(2.3,2.3,.18,20),material(0x132c36)); base.position.y=.1; g.add(base);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,3.2,8),material(0x71838a)); pole.position.y=1.65; g.add(pole);
      const colors={shop:0xe0bd61,restaurant:0xd77a62,clothes:0x9c7bdd,garage:0x65b9d1,fuel:0x82c77b,property:0xe9edf0};
      const orb=new THREE.Mesh(new THREE.SphereGeometry(.42,12,12),material(colors[b.type]||0xffffff)); orb.position.y=3.25; g.add(orb);
      this.markerRoot.add(g); b.group=g;
    }
  }
  nearest(position,max=7){let best=null,dist=max;for(const b of this.businesses){const d=Math.hypot(position.x-b.x,position.z-b.z);if(d<dist){dist=d;best=b}}return best}
  getLabel(b){return b?({shop:"SHOP",restaurant:"RESTAURANT",clothes:"CLOTHING SHOP",garage:"GARAGE",fuel:"FUEL STATION",property:"PROPERTY"})[b.type]:""}
  interact(){const b=this.nearest(this.game.player.position,8);if(!b){this.game.ui.toast("NO BUSINESS NEARBY");return false}this.active=b;this.game.ui.openBusiness(b,this);return true}
  buy(itemId){const item=ITEMS[itemId];if(!item)return;const p=this.game.player;if(p.money<item.price){this.game.ui.toast("NOT ENOUGH MONEY");return}p.money-=item.price;this.inventory[itemId]=(this.inventory[itemId]||0)+1;this.save();this.game.ui.refreshEconomy(this);this.game.ui.toast(`${item.name.toUpperCase()} • ₹${item.price}`)}
  use(itemId){const count=this.inventory[itemId]||0;if(!count){this.game.ui.toast("ITEM NOT IN INVENTORY");return}const item=ITEMS[itemId],p=this.game.player;if(item.heal)p.health=Math.min(100,p.health+item.heal);if(item.stamina)p.stamina=Math.min(100,p.stamina+item.stamina);this.inventory[itemId]--;this.save();this.game.ui.refreshEconomy(this);this.game.ui.toast(`${item.name.toUpperCase()} USED`)}
  service(action){const v=this.game.vehicle;if(!v){this.game.ui.toast("VEHICLE NOT READY");return}if((action==="repair"||action==="fuel"||action==="engine"||action==="handling")&&!this.game.player.onVehicle&&this.game.player.position.distanceTo(v.position)>12){this.game.ui.toast("BRING YOUR VEHICLE TO THE GARAGE");return}let cost=0;if(action==="repair"){cost=Math.ceil((100-v.health)*12);if(cost===0){this.game.ui.toast("VEHICLE ALREADY REPAIRED");return}v.health=100}else if(action==="fuel"){cost=Math.ceil((100-v.fuel)*8);if(cost===0){this.game.ui.toast("TANK ALREADY FULL");return}v.fuel=100}else if(action==="engine"){cost=1200;if(v.upgrades?.engine){this.game.ui.toast("ENGINE UPGRADE ALREADY INSTALLED");return}v.upgrades=v.upgrades||{};v.upgrades.engine=true;v.def={...v.def,speed:(v.def.speed||32)*1.12,accel:(v.def.accel||9)*1.18}}else if(action==="handling"){cost=950;if(v.upgrades?.handling){this.game.ui.toast("HANDLING UPGRADE ALREADY INSTALLED");return}v.upgrades=v.upgrades||{};v.upgrades.handling=true;v.def={...v.def,handling:(v.def.handling||2)*1.25}}else return;
    if(this.game.player.money<cost){this.game.ui.toast("NOT ENOUGH MONEY");return}this.game.player.money-=cost;this.save();this.game.ui.refreshEconomy(this);this.game.ui.toast(`${action.toUpperCase()} • ₹${cost}`);
  }
  buyProperty(b){const prices={"beach-apartment":180000,"hill-house":240000,"safehouse":320000};const price=prices[b.property]||200000;if(this.properties.includes(b.property)){this.game.ui.toast("PROPERTY ALREADY OWNED");return}if(this.game.player.money<price){this.game.ui.toast(`NEED ₹${price.toLocaleString("en-IN")}`);return}this.game.player.money-=price;this.properties.push(b.property);this.save();this.game.ui.refreshEconomy(this);this.game.ui.toast(`${b.name} PURCHASED`)}
  save(){try{localStorage.setItem("vizag-phase6-economy",JSON.stringify({inventory:this.inventory,properties:this.properties}))}catch(e){console.warn(e)}}
  load(){try{const s=JSON.parse(localStorage.getItem("vizag-phase6-economy")||"null");if(s){this.inventory={...this.inventory,...(s.inventory||{})};this.properties=s.properties||[]}}catch(e){console.warn(e)}}
  markerVisible(distance=180){this.markerRoot.children.forEach(g=>{const b=this.businesses.find(x=>x.group===g);if(!b)return;const d=Math.hypot(this.game.player.position.x-b.x,this.game.player.position.z-b.z);g.visible=d<distance})}
  update(){this.markerVisible()}
}
export {ITEMS};

import {HUD} from "./HUD.js";
import {ITEMS} from "../economy/EconomySystem.js";
function addItem(add,e,id){const item=ITEMS[id];if(item)add(item.name,`Buy • ₹${item.price.toLocaleString("en-IN")}`,()=>e.buy(id));}
export class UIManager{
 constructor(game){this.game=game;this.hud=new HUD(game)}
 showHUD(){this.hud.show()}
 setHealth(v){this.hud.setHealth(v)} setStamina(v){this.hud.setStamina(v)} setMoney(v){this.hud.setMoney(v)}
 setMission(v){this.hud.setMission(v)} setZone(v){this.hud.setZone(v)} setWanted(v){this.hud.setWanted(v)} setVehicle(v){this.hud.setVehicle(v)} setVehicleTelemetry(s,f){this.hud.setVehicleTelemetry(s,f)}
 setBusinessHint(v){const el=document.getElementById("business-hint");if(el){el.textContent=v;el.classList.toggle("hidden",!v)}}
 setTime(v){this.hud.setTime(v)} setWeather(v){this.hud.setWeather(v)} interaction(v){this.hud.interaction(v)} toast(v){this.hud.toast(v)}
 setPerformance(v){const el=document.getElementById("perf-pill");if(el&&v)el.textContent=`${v.fps} FPS • ${Math.round(v.scale*100)}%`; }
 openBusiness(b,e){
   const panel=document.getElementById("business-panel"), title=document.getElementById("business-title"), type=document.getElementById("business-type"), district=document.getElementById("business-district"), box=document.getElementById("business-actions");
   title.textContent=b.name; type.textContent=e.getLabel(b); district.textContent=b.district||"Vizag"; box.innerHTML="";
   const add=(label,sub,fn,disabled=false)=>{const btn=document.createElement("button");btn.disabled=disabled;btn.innerHTML=`<b>${label}</b><small>${sub}</small>`;btn.onclick=fn;box.appendChild(btn)};
   if(b.type==="shop"||b.type==="restaurant"||b.type==="clothes") for(const id of (b.items||[])) addItem(add,e,id);
   if(b.type==="garage"){
     add("REPAIR VEHICLE","Restore vehicle health • ₹12 / damage",()=>e.service("repair"));
     add("FILL FUEL","Fill tank • ₹8 / %",()=>e.service("fuel"));
     add("ENGINE UPGRADE","+12% top speed / +18% acceleration • ₹1,200",()=>e.service("engine"));
     add("HANDLING UPGRADE","Improved steering • ₹950",()=>e.service("handling"));
   }
   if(b.type==="fuel") add("FILL FUEL","Refuel current vehicle • ₹8 / %",()=>e.service("fuel"));
   if(b.type==="property"){
     const prices={"beach-apartment":180000,"hill-house":240000,"safehouse":320000};const price=prices[b.property]||200000;
     add(e.properties.includes(b.property)?"OWNED":"BUY PROPERTY",e.properties.includes(b.property)?"Already owned":`Purchase • ₹${price.toLocaleString("en-IN")}`,()=>e.buyProperty(b),e.properties.includes(b.property));
   }
   panel.classList.remove("hidden");this.game.paused=true;this.refreshEconomy(e);
 }
 refreshEconomy(e){
   const list=document.getElementById("inventory-list");if(!list)return;list.innerHTML="";
   const names={food:"Street Meal",drink:"Cool Drink",meal:"Restaurant Meal",juice:"Fresh Juice",shirt:"New Shirt",jacket:"Street Jacket",medkit:"First Aid Kit"};
   for(const [id,count] of Object.entries(e.inventory)){if(!count)continue;const row=document.createElement("div");row.className="inventory-row";row.innerHTML=`<span>${names[id]||id}<br><small>×${count}</small></span>`;const b=document.createElement("button");b.textContent="USE";b.onclick=()=>e.use(id);row.appendChild(b);list.appendChild(row)}
   if(!list.children.length){const empty=document.createElement("div");empty.className="inventory-row";empty.innerHTML='<span>Inventory is empty.</span>';list.appendChild(empty)}
   document.getElementById("property-count").textContent=e.properties.length;
   this.setMoney(this.game.player?.money||0);
 }
 openInventory(e){document.getElementById("inventory-panel").classList.remove("hidden");this.refreshEconomy(e);this.game.paused=true}
 openJournal(){
   const panel=document.getElementById("journal-panel"); if(!panel)return; panel.classList.remove("hidden"); this.game.paused=true; this.renderJournal("main");
 }
 renderJournal(tab="main"){
   const ms=this.game.missions; if(!ms)return;
   const list=document.getElementById("journal-list"), progress=document.getElementById("journal-progress");
   const doneMain=ms.main.filter(m=>ms.completed.has(m.id)).length, doneSide=ms.side.filter(m=>ms.completed.has(m.id)).length;
   progress.textContent=`${doneMain} / ${ms.main.length} MAIN • ${doneSide} / ${ms.side.length} SIDE`;
   document.getElementById("main-tab")?.classList.toggle("active",tab==="main"); document.getElementById("side-tab")?.classList.toggle("active",tab==="side");
   list.innerHTML=""; const arr=tab==="main"?ms.main:ms.side;
   for(const m of arr){const row=document.createElement("div");row.className="journal-row"+(ms.completed.has(m.id)?" done":"");const status=ms.completed.has(m.id)?"COMPLETED":(m===ms.current?"ACTIVE":"AVAILABLE");row.innerHTML=`<div><b>${m.title}</b><small>${status} • ₹${(m.reward||0).toLocaleString("en-IN")}</small></div>`;if(tab==="side"&&!ms.completed.has(m.id)&&!ms.activeSide){const b=document.createElement("button");b.textContent="START";b.onclick=()=>{if(ms.startSide(m.id)){panel.classList.add("hidden");this.game.paused=false}};row.appendChild(b)}list.appendChild(row)}
 }
 closeEconomy(){document.getElementById("business-panel").classList.add("hidden");document.getElementById("inventory-panel").classList.add("hidden");if(!document.getElementById("pause-panel").classList.contains("hidden"))return;this.game.paused=false}

 togglePanel(id,show){document.getElementById(id).classList.toggle("hidden",!show)}
 toggleMap(show){document.getElementById("map-panel").classList.toggle("hidden",!show);if(show)this.game.map.draw()}
 bind(){document.getElementById("inventory-btn").onclick=()=>this.openInventory(this.game.economy);document.getElementById("journal-btn")?.addEventListener("click",()=>this.openJournal());document.getElementById("main-tab")?.addEventListener("click",()=>this.renderJournal("main"));document.getElementById("side-tab")?.addEventListener("click",()=>this.renderJournal("side"));document.getElementById("touch-journal")?.addEventListener("click",()=>this.openJournal());document.querySelectorAll(".close-panel").forEach(b=>b.onclick=()=>{const panel=b.closest(".panel");panel.classList.add("hidden");if(panel.id==="business-panel"||panel.id==="inventory-panel")this.game.paused=false});document.getElementById("resume-btn").onclick=()=>this.pause(false);document.getElementById("save-btn").onclick=()=>{this.game.save();this.toast("GAME SAVED")};document.getElementById("fullscreen-btn")?.addEventListener("click",()=>document.documentElement.requestFullscreen?.());document.getElementById("pause-map-btn").onclick=()=>this.toggleMap(true);document.getElementById("pause-settings-btn").onclick=()=>this.togglePanel("settings-panel",true);document.getElementById("exit-btn").onclick=()=>this.game.exitToTitle()}
 pause(show){this.togglePanel("pause-panel",show);this.game.paused=show}
}
export class HUD{
 constructor(game){this.game=game;this.el=document.getElementById("hud")}
 show(){this.el.classList.remove("hidden")}
 setHealth(v){document.getElementById("health-bar").style.width=`${v}%`}
 setStamina(v){document.getElementById("stamina-bar").style.width=`${v}%`}
 setMoney(v){document.getElementById("cash").textContent=`₹ ${Math.floor(v).toLocaleString("en-IN")}`}
 setMission(m){document.getElementById("mission-title").textContent=m?.title||"FREE ROAM";document.getElementById("mission-objective").textContent=m?.objectives?.[0]||m?.objective||"Explore Vizag."}
 setZone(v){document.getElementById("zone-pill").textContent=v}
 setWanted(v){const el=document.querySelector("#wanted");if(!el)return;const stars=Math.min(5,Math.ceil(v));el.classList.toggle("active",stars>0);const span=el.querySelector("span");if(span)span.textContent="★".repeat(stars)+"☆".repeat(5-stars);}
 setVehicle(v){document.getElementById("vehicle-hud").classList.toggle("hidden",!v);if(v){document.getElementById("speed").textContent=Math.floor(Math.abs(v.speed)*2.2);document.getElementById("fuel").textContent=Math.floor(v.fuel)}}
 setTime(h){const hh=Math.floor(h)%24,mm=Math.floor((h%1)*60);document.getElementById("time-pill").textContent=`${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`}
 setWeather(v){document.getElementById("weather-pill").textContent=v.toUpperCase()}
 interaction(show){document.getElementById("interaction").classList.toggle("hidden",!show)}
 toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(this.tt);this.tt=setTimeout(()=>t.classList.remove("show"),2200)}

 setVehicleTelemetry(speed,fuel){
   const s=document.getElementById("speed");
   const f=document.getElementById("fuel");
   if(s)s.textContent=Math.max(0,Math.round(Math.abs(speed)*3.6));
   if(f)f.textContent=Math.round(fuel);
 }
}
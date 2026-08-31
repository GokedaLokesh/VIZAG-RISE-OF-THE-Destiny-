export class Settings{
 constructor(game){
  this.game=game;
  const saved=(()=>{try{return JSON.parse(localStorage.getItem("vizag-settings-v1")||"null")}catch{return null}})();
  if(saved){game.settings={...game.settings,...saved}; if(saved.quality)game.applyQuality(saved.quality)}
  const q=document.getElementById("quality"), td=document.getElementById("traffic-density"), nd=document.getElementById("npc-density"), mv=document.getElementById("master-volume"), we=document.getElementById("weather-effects");
  if(q)q.value=game.settings.quality||game.autoQuality; if(td)td.value=game.settings.traffic; if(nd)nd.value=game.settings.npcs; if(mv)mv.value=Math.round(game.settings.volume*100);
  const persist=()=>{try{localStorage.setItem("vizag-settings-v1",JSON.stringify(game.settings))}catch{}};
  q?.addEventListener("change",e=>{game.settings.quality=e.target.value;game.applyQuality(e.target.value);persist();game.ui.toast(`GRAPHICS: ${e.target.value.toUpperCase()}`)});
  td?.addEventListener("input",e=>{game.settings.traffic=+e.target.value;persist()});
  nd?.addEventListener("input",e=>{game.settings.npcs=+e.target.value;persist()});
  mv?.addEventListener("input",e=>{game.settings.volume=+e.target.value/100;game.audio?.setVolume?.(game.settings.volume);persist()});
  we?.addEventListener("change",e=>{game.settings.weatherEffects=!!e.target.checked;persist()});
  if(we)we.checked=game.settings.weatherEffects!==false;
 }
}

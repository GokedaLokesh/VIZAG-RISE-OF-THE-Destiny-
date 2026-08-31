import * as THREE from "three";
import {AssetManager} from "./core/AssetManager.js";
import {GameLoop} from "./core/GameLoop.js";
import {SaveSystem} from "./core/SaveSystem.js";
import {Ocean} from "./world/Ocean.js";
import {Phase5World} from "./world/Phase5World.js";
import {WorldStreaming} from "./world/WorldStreaming.js";
import {Player} from "./player/Player.js";
import {PlayerController} from "./player/PlayerController.js";
import {CameraController} from "./player/CameraController.js";
import {Vehicle} from "./vehicles/Vehicle.js";
import {TrafficAI} from "./vehicles/TrafficAI.js";
import {NPCManager} from "./npc/NPCManager.js";
import {MissionSystem} from "./missions/MissionSystem.js";
import {PoliceSystem} from "./police/PoliceSystem.js";
import {DayNightSystem} from "./weather/DayNightSystem.js";
import {WeatherSystem} from "./weather/WeatherSystem.js";
import {AudioManager} from "./audio/AudioManager.js";
import {MapSystem} from "./map/MapSystem.js";
import {UIManager} from "./ui/UIManager.js";
import {Menu} from "./ui/Menu.js";
import {Settings} from "./ui/Settings.js";
import {EconomySystem} from "./economy/EconomySystem.js";
import {EmergencySystem} from "./emergency/EmergencySystem.js";
import {PerformanceManager} from "./core/PerformanceManager.js";
import {ReleaseManager} from "./core/ReleaseManager.js";

class Game{
 constructor(){this.paused=false;this.started=false;this.settings={quality:"Medium",traffic:65,npcs:70,volume:.7,weatherEffects:true};this.ui=new UIManager(this);this.menu=new Menu(this);this.ui.bind();this.release=new ReleaseManager(this);this.controller=new PlayerController();window.addEventListener("game-interact",()=>{if(this.started&&!this.paused)this.keys({code:"KeyE"})});this.audio=new AudioManager();this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});this.autoQuality=this.detectQuality();this.renderer.setPixelRatio(this.autoQuality==="Low"?1:Math.min(devicePixelRatio,this.autoQuality==="High"?1.75:1.4));this.renderer.setSize(innerWidth,innerHeight);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.05;document.getElementById("game").appendChild(this.renderer.domElement);this.scene=new THREE.Scene();this.scene.background=new THREE.Color(0x8ab8c8);this.scene.fog=new THREE.FogExp2(0x8ab8c8,.0018);this.camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1500);this.camera.position.set(0,5,50);addEventListener("resize",()=>this.resize());addEventListener("keydown",e=>this.keys(e))}
 async start(cont){if(this.started)return;this.menu.hide();this.ui.showHUD();this.audio.start();try{await this.buildWorld();if(cont){const s=SaveSystem.load();if(s)this.restore(s)}}catch(e){this.release.fatal(e);return}this.started=true;this.loop=new GameLoop(dt=>this.update(dt),()=>this.render());this.loop.start();this.ui.toast("WELCOME TO VIZAG")}
 async buildWorld(){const progress=document.getElementById("load-progress"),status=document.getElementById("load-status");const set=(p,s)=>{progress.style.width=`${p}%`;status.textContent=s};set(10,"Loading Phase 5 world...");this.world=new Phase5World(this.scene);set(25,"Loading coastline...");this.ocean=new Ocean(this.scene);set(42,"Loading roads + districts...");set(55,"Loading city blocks...");set(66,"Loading player...");this.player=new Player(this.scene);this.cameraController=new CameraController(this.camera,this.player);set(76,"Loading vehicles...");const defs=await (await fetch("./data/vehicles.json")).json();this.vehicle=new Vehicle(this.scene,defs[0],[8,0,55]);this.traffic=new TrafficAI(this.scene,defs);set(86,"Loading NPCs...");const npcd=await (await fetch("./data/npcs.json")).json();this.npcs=new NPCManager(this.scene,npcd.npcs||npcd);set(92,"Loading mission campaign...");const md=await (await fetch("./data/missions.json")).json();this.missions=new MissionSystem(this,md);this.police=new PoliceSystem(this.scene,npcd.npcs||npcd,defs,this);
this.emergency=new EmergencySystem(this.scene,defs,this);this.dayNight=new DayNightSystem(this.scene);this.weather=new WeatherSystem(this.scene);const locations=(await (await fetch("./data/locations.json")).json()).locations;this.map=new MapSystem(this,locations);this.streaming=new WorldStreaming(this);this.economy=new EconomySystem(this);this.performance=new PerformanceManager(this);this.settingsUI=new Settings(this);this.applyQuality(this.settings.quality==="Medium"?this.autoQuality:this.settings.quality);set(100,"Release build ready");document.getElementById("loading").classList.add("hidden");this.ui.setMission(this.missions.current)}
 update(dt){if(!this.started||this.paused)return;this.performance?.update(dt);this.ui.setPerformance(this.performanceStats);this.dayNight.update(dt);this.weather.update(dt);this.ocean.update(dt);this.streaming.update();this.economy?.update();this.player.update(dt,this.controller.input,this);this.npcs.update(dt,this.settings.npcs,this.dayNight.hour,this.player.position);this.traffic.update(dt,this.settings.traffic);this.police.update(dt,this.player.position,this.player.onVehicle?this.vehicle.speed:0);this.emergency.update(dt,this.player.position,this.police.wanted);if(this.player.onVehicle){
 const i=this.controller.input;
 this.vehicle.update(dt,{
   throttle:i.z < -.05 ? 1 : (i.z > .2 ? -1 : 0),
   steer:i.x,
   brake:i.z > .55 ? 1 : 0
 });
 this.player.position.copy(this.vehicle.position).add(new THREE.Vector3(0,.1,0));
 this.player.group.rotation.y=this.vehicle.heading;
}this.cameraController.update(dt,this.controller.mouse);this.controller.mouse.x=this.controller.mouse.y=0;this.missions.update(dt);this.ui.setHealth(this.player.health);this.ui.setStamina(this.player.stamina);this.ui.setMoney(this.player.money);this.ui.setTime(this.dayNight.hour);this.ui.setWeather(this.weather.mode);this.ui.setWanted(this.police?.wanted||0);this.ui.setVehicle(this.player.onVehicle);
 this.ui.setVehicleTelemetry(this.player.onVehicle ? this.vehicle.speed : 0, this.player.onVehicle ? this.vehicle.fuel : 0);
 const nearVehicle=this.player.position.distanceTo(this.vehicle.position)<7;
 const nearBusiness=this.economy?.nearest(this.player.position,8);
 this.ui.interaction(nearVehicle||!!nearBusiness);
 this.ui.setBusinessHint(nearVehicle?"E — ENTER / EXIT VEHICLE":nearBusiness?`E — ${this.economy.getLabel(nearBusiness)} • ${nearBusiness.name}`:"")
}
 render(){this.renderer.render(this.scene,this.camera)}
 keys(e){if(e.repeat)return;if(e.code==="Escape"&&this.started){this.ui.pause(!this.paused)}if(e.code==="KeyM"&&this.started&&!this.paused){this.map?.open()}if(e.code==="KeyE"&&this.started&&!this.paused){
 if(this.player.position.distanceTo(this.vehicle.position)<7){this.player.onVehicle=this.player.onVehicle?null:this.vehicle;if(this.player.onVehicle)this.player.group.visible=false;else this.player.group.visible=true;this.ui.toast(this.player.onVehicle?"VEHICLE ENTERED":"VEHICLE EXITED");return}
 this.economy?.interact();
}if(e.code==="Space"&&this.started&&!this.paused)this.player.jump();if(e.code==="KeyH"&&this.started&&!this.paused){this.police?.addCrime(1);this.police.crimeCount=(this.police.crimeCount||0)+1}}
 save(){if(!this.player)return false;return SaveSystem.save({settings:this.settings,position:this.player.position.toArray(),money:this.player.money,health:this.player.health,stamina:this.player.stamina,hour:this.dayNight.hour,weather:this.weather.mode,mission:this.missions.mainIndex,missionProgress:this.missions.serialize(),economy:{inventory:this.economy?.inventory,properties:this.economy?.properties}})}
 restore(s){
  if(!s||typeof s!=="object")return;
  if(s.settings&&typeof s.settings==="object")this.settings={...this.settings,...s.settings};
  const pos=Array.isArray(s.position)&&s.position.length>=3?s.position:[0,1,40];
  if(this.player?.position)this.player.position.set(Number(pos[0])||0,Number(pos[1])||1,Number(pos[2])||40);
  this.player.money=Number.isFinite(Number(s.money))?Number(s.money):2500;this.player.health=s.health??100;this.player.stamina=s.stamina??100;this.dayNight.hour=s.hour??8;this.missions.mainIndex=s.missionProgress?.mainIndex??s.mission??0;this.missions.completed=new Set(s.missionProgress?.completed||[]);this.missions.refreshCurrent();if(this.economy&&s.economy){this.economy.inventory={...this.economy.inventory,...(s.economy.inventory||{})};this.economy.properties=s.economy.properties||[];this.economy.save()}}
 exitToTitle(){this.save();location.reload()}
 detectQuality(){if(innerWidth<700||navigator.hardwareConcurrency<=4)return "Low";if(devicePixelRatio>=2||innerWidth>1600)return "High";return "Medium"}
 applyQuality(q){const p=q==="Low"?1:q==="High"?1.8:q==="Ultra"?2:1.4;this.renderer.setPixelRatio(Math.min(devicePixelRatio,p));this.renderer.shadowMap.enabled=q!=="Low";this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.performance?.setQuality(q)}
 resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight)}
}
const g=new Game();
window.VizagGame=g;
setTimeout(()=>{document.getElementById("loading").classList.add("hidden")},800);

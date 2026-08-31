import * as THREE from "three";

export class NPCBehavior {
  constructor(npc) {
    this.npc = npc;
    this.state = npc.def.type === "police" ? "PATROL" : "WANDER";
    this.target = null;
    this.timer = 0;
    this.speed = (npc.def.walkSpeed || 1.15) + Math.random() * .8;
    this.phase = Math.random() * Math.PI * 2;
    this.groupId = null;
  }

  chooseDestination(worldTime) {
    const hour = ((worldTime % 24) + 24) % 24;
    const type = this.npc.def.type;
    const p = this.npc.position;
    const beach = () => ({x:(Math.random()-.5)*260, z:-80+Math.random()*125});
    const city = () => ({x:(Math.random()-.5)*520, z:70+Math.random()*430});
    const shop = () => ({x:(Math.random()-.5)*420, z:120+Math.random()*300});

    if (type === "vendor" || type === "shopkeeper") {
      this.state = hour >= 8 && hour < 22 ? "WORK" : "HOME";
    } else if (type === "student") {
      this.state = hour >= 8 && hour < 16 ? "WORK" : (hour >= 17 && hour < 21 ? "SOCIAL" : "HOME");
    } else if (type === "office-worker" || type === "security") {
      this.state = hour >= 9 && hour < 18 ? "WORK" : (hour >= 18 && hour < 21 ? "SOCIAL" : "HOME");
    } else if (type === "fisherman") {
      this.state = (hour >= 4 && hour < 11) ? "BEACH" : (hour >= 16 && hour < 20 ? "SOCIAL" : "HOME");
    } else if (type === "tourist") {
      this.state = hour >= 7 && hour < 21 ? "BEACH" : "HOME";
    } else {
      this.state = hour >= 17 && hour < 21 ? (Math.random()<.55?"SOCIAL":"SHOP") : "WANDER";
    }

    if (this.state === "WORK") this.target = this.npc.work;
    else if (this.state === "BEACH") this.target = beach();
    else if (this.state === "SHOP") this.target = shop();
    else if (this.state === "SOCIAL") this.target = this.npc.socialTarget || beach();
    else if (this.state === "HOME") this.target = this.npc.home;
    else this.target = city();

    this.timer = 4 + Math.random() * 9;
  }

  update(dt, worldTime = 12, context = {}) {
    this.timer -= dt;
    if (this.timer <= 0 || !this.target) this.chooseDestination(worldTime);

    const p = this.npc.position;
    if (context.playerPosition && this.state !== "HOME") {
      const d = p.distanceTo(context.playerPosition);
      if (d < 7 && this.npc.def.type !== "security") {
        const away = p.clone().sub(context.playerPosition);
        away.y = 0;
        if (away.lengthSq() > .01) this.target = {x:p.x + away.x/away.length()*18, z:p.z + away.z/away.length()*18};
      }
    }

    if (!this.target) return;
    const dx = this.target.x-p.x, dz = this.target.z-p.z;
    const len = Math.hypot(dx,dz);
    if (len > 1.8) {
      const desired = Math.atan2(dx,dz);
      let delta = ((desired-this.npc.heading+Math.PI*3)%(Math.PI*2))-Math.PI;
      this.npc.heading += delta * Math.min(1,dt*5);
      const pace = this.speed * (this.state === "WORK" ? 1.05 : 0.9);
      p.x += Math.sin(this.npc.heading)*pace*dt;
      p.z += Math.cos(this.npc.heading)*pace*dt;
      this.npc.animTime = (this.npc.animTime || 0) + dt * (5 + pace*2);
    }
  }
}

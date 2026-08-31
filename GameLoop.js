export class GameLoop{
  constructor(update,render){this.update=update;this.render=render;this.last=performance.now();this.running=false}
  start(){this.running=true;this.last=performance.now();requestAnimationFrame(this.tick.bind(this))}
  tick(t){if(!this.running)return;const dt=Math.min((t-this.last)/1000,.05);this.last=t;this.update(dt);this.render();requestAnimationFrame(this.tick.bind(this))}
  stop(){this.running=false}
}
export class AudioManager{
 constructor(){this.ctx=null;this.master=.7}
 start(){if(!this.ctx)this.ctx=new (window.AudioContext||window.webkitAudioContext)()}
 tone(freq=440,duration=.08){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=freq;g.gain.setValueAtTime(.04,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+duration);o.connect(g).connect(this.ctx.destination);o.start();o.stop(this.ctx.currentTime+duration)}
}
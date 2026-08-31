export class ReleaseManager{
  constructor(game){
    this.game=game;
    this.installPrompt=null;
    this.installBtn=document.getElementById("install-btn");
    this.bind();
    this.registerServiceWorker();
  }
  bind(){
    window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();this.installPrompt=e;this.installBtn?.classList.remove("hidden")});
    window.addEventListener("appinstalled",()=>{this.installPrompt=null;this.installBtn?.classList.add("hidden");this.game.ui?.toast("APP INSTALLED")});
    this.installBtn?.addEventListener("click",async()=>{if(!this.installPrompt)return;const p=this.installPrompt;this.installPrompt=null;this.installBtn.classList.add("hidden");try{await p.prompt();await p.userChoice}catch(e){console.warn("Install prompt failed",e)}});
    document.getElementById("reload-game")?.addEventListener("click",()=>location.reload());
    window.addEventListener("error",e=>{if(e.error)this.fatal(e.error);else this.fatal(new Error(e.message||"Unexpected runtime error"))});
    window.addEventListener("unhandledrejection",e=>this.fatal(e.reason instanceof Error?e.reason:new Error(String(e.reason||"Unhandled promise rejection"))));
  }
  async registerServiceWorker(){
    if(!("serviceWorker" in navigator)||location.protocol==="file:")return;
    try{await navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"})}catch(e){console.warn("Service worker registration failed",e)}
  }
  fatal(error){
    if(this._fatalShown)return;
    this._fatalShown=true;
    console.error("VIZAG RUNTIME ERROR",error);
    const box=document.getElementById("fatal-error"),text=document.getElementById("fatal-error-text");
    if(text)text.textContent=error?.message||String(error)||"Unknown error";
    box?.classList.remove("hidden");
  }
}

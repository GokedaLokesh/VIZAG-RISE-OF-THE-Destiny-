export class Menu{
 constructor(game){this.game=game;this.title=document.getElementById("title-screen");this.bind()}
 bind(){document.getElementById("new-game").onclick=()=>this.game.start(false);document.getElementById("continue-game").onclick=()=>this.game.start(true);document.getElementById("settings-btn").onclick=()=>this.game.ui.togglePanel("settings-panel",true);document.getElementById("controls-btn").onclick=()=>this.game.ui.togglePanel("controls-panel",true);document.getElementById("credits-btn").onclick=()=>this.game.ui.togglePanel("credits-panel",true)}
 hide(){this.title.classList.add("hidden")}
 show(){this.title.classList.remove("hidden")}
}

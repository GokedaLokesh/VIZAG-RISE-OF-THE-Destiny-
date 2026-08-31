export class SaveSystem{
  static key="vizag-rise-save-v2";
  static version=2;
  static save(state){
    try{localStorage.setItem(this.key,JSON.stringify({...state,saveVersion:this.version,savedAt:Date.now()}));return true}
    catch(e){console.warn("Save failed",e);return false}
  }
  static load(){
    try{
      const raw=localStorage.getItem(this.key); if(!raw)return null;
      const x=JSON.parse(raw); if(!x||typeof x!=="object")return null;
      return x;
    }catch(e){console.warn("Load failed",e);return null}
  }
  static clear(){try{localStorage.removeItem(this.key)}catch(e){console.warn(e)}}
}

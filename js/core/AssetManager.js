export class AssetManager{
  constructor(onProgress=()=>{}){this.onProgress=onProgress;this.cache=new Map()}
  async loadJSON(url){if(this.cache.has(url))return this.cache.get(url);const r=await fetch(url);if(!r.ok)throw new Error(`Failed ${url}`);const d=await r.json();this.cache.set(url,d);return d}
  async load(urls=[]){let i=0;for(const u of urls){try{await this.loadJSON(u)}catch(e){console.warn(e)}i++;this.onProgress(i/urls.length)}}}

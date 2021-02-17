import {isJSON, isImage, isGLB, isURL, uploadFileToCloud} from "../Utilities/Functions.js"
import {Variant} from "./Variant.js"

class Texture extends SvgPlus{

  constructor(name, json, master = null){
    super('DIV');

    this.thumbnailElement = this.createChild('IMG');
    this.textureElement = this.createChild('DIV');
    this.statusElement = this.createChild("DIV");

    this._master = master;

    this._usdz = null;
    this._glb = null;
    this._thumbnail = null;
    this._name = null;
    this._color = null;

    this.name = name;
    this.json = json;
  }


  runEvent(eventName, params){
    if ( typeof this.master === 'object' ) {
      if ( eventName in this.master ) {
        let eventFunction = this.master;

        if ( eventFunction instanceof Function ){
          eventFunction(params);
        }
      }
    }
  }

  async deleteFromCloud(){
    
  }

  async uploadToCloud(){
    if (!this.filesAreValid) return;

    let filename = this.path.replace('/', '_');

    for ( var type of ["glb", "usdz", "thumbnail"]) {
      if ( type === "thumbnail" ){
        filename = "thumbnail" + getExt(this[type]);
      }else{
        filename = filename + getExt(this[type]);
      }

      this[type] = await uploadFileToCloud(this[type], this.path, (progress) => {
        progress = Number.isNaN(progress) ? '~ ' : `${Math.round(progress)}% `;
        this.statusElement.innerHTML += progress + this[type].name;
      }, filename)
    }

    if ( this.mode === -1 ) {
      try{
        await this.fireRef.set(this.json);
      }catch(e){
        this.statusElement.innerHTML = "An error occured, please try again."
      }
      this.statusElement.innerHTML = "Upload Complete"
    }else{
      this.statusElement.innerHTML = "An error occured, please try again."
    }
  }

  get master(){
    return this._master;
  }

  get mode(){
    if (this.name === null) return 0;

    let mode = 0;

    mode += this.glbMode;
    mode += this.usdzMode;
    mode += this.thumbnailMode;

    if ( mode === 3 ) return 1;   //All files
    if ( mode === -3 ) return -1; //All urls
    if ( mode === 0 ) return 0;   //No files or urls
    return 2;                     //Most likely an invalid texture
  }

  get isValid(){
    return Math.abs(this.mode) === 1;
  }

  get filesAreValid(){
    return this.mode === 1;
  }


  //Set and get parent variant
  set parentVariant(parent){
    if ( SvgPlus.is(parent, Varaint) ){
      this._parentVariant = parent;
    }else{
      this._parentVariant = null;
    }
  }
  get parentVariant(){
    return this._parentVariant;
  }

  //Set texture as json
  set json(json){
    this._errorLog = "";

    if ( isJSON(json) ) {

      for ( var key in json ){
        //Check for glb file
        if ( contains("glb", key) ){
          this.glb = json[key];
        }

        //Check for glb file
        if ( contains("usdz", key) ){
          this.usdz = json[key];
        }

        //Check for glb file
        if ( contains("thumbnail", key) ){
          this.thumbnail = json[key];
        }
      }
    }
  }

  //Get texture json
  get json(){
    return {
      glb: this.glb,
      usdz: this.usdz,
      thumbnail: this.thumbnail
    }
  }

  //Set texture name
  set name(name){
    this._name = null;
    this._color = null;

    let hexInParentheses = /\((([a-g]|[A-G]|\d){6})\)/
    let color = name.match(hexInParentheses);
    if ( color == null ) return;

    color = color[1];
    if (color) {
      this._name = name;
      this._color = color;

      this.textureElement.styles = {background: `#${this.color}`};
    }
  }

  //Get name
  get name(){
    return this._name;
  }

  //Get color
  get color(){
    return this._color;
  }

  //Set and get GLB variant-texture model file
  set glb(glb){
    if ( isGLB(glb) || isURL(glb) ){
      this._glb = glb;
    }else{
      this._glb = null;
    }
  }
  get glb(){
    return this._glb;
  }
  get glbMode(){
    if ( this.glb == null ) return 0;
    if ( isURL(this.glb) ) return -1;
    return 1;
  }

  //Set and get USDZ variant-texture model file
  set usdz(usdz){
    if ( isUSDZ(usdz) || isURL(usdz) ){
      this._usdz = usdz;
    }else{
      this._usdz = null;
    }
  }
  get usdz(){
    return this._usdz;
  }
  get usdzMode(){
    if ( this.usdz == null ) return 0;
    if ( isURL(this.usdz) ) return -1;
    return 1;
  }

  //Set and get USDZ variant-texture thumbnail image
  set thumbnail(thumbnail){
    if ( isThumbanil(thumbnail) || isURL(thumbnail) ){
      this._thumbnail = thumbnail;

      if ( isURL(thumbnail) ) {
        this.thumbnailElement.props = {src: thumbnail}
      }
    }else{
      this._thumbnail = null;
    }
  }
  get thumbnail(){
    return this._thumbnail
  }
  get thumbnailMode(){
    if ( this.thumbnail == null ) return 0;
    if ( isURL(this.thumbnail) ) return -1;
    return 1;
  }

  //Get path name
  get path(){
    if ( this.parentVariant == null ) return this.name;

    return `${this.parentVariant.path}/${this.name}`
  }

  get fireRef(){
    return firebase.database().ref(this.path);
  }
}

export {Texture}

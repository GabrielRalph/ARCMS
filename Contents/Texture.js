import {SvgPlus} from 'https://www.svg.plus/3.js'

import {getExt, loadURL, contains, isJSON, isImage, isThumbanil, isGLB, isUSDZ, isURL, uploadFileToCloud, deleteFilesFromCloud} from "../Utilities/Functions.js"
import {Variant, LiveVariant} from "./Variant.js"
import {RadioIcon} from "../Utilities/Icons.js"

/**
  A Texture is an object that represents a folder containing
  one glb, usdz and thumbnail file. Files can be either a
  a url file location or an actual File object.

  @see Texture
*/

class Texture extends SvgPlus{

  constructor(json, name, master = null){
    super('TABLE');

    this.buildTemplate();

    //Master can be used as a bus to run events
    this._master = master;

    //Instantiat private variables
    this._usdz = null;
    this._glb = null;
    this._thumbnail = null;
    this._name = null;
    this._color = null;
    this._uploading = false;

    //Set the name and json of the texture
    this.name = name;
    this.json = json;
  }

  //Builds the html template for this texture
  buildTemplate(){
    let body = this.createChild('TBODY');
    let row = this.createChild('TR');
    this.class = "texture"

    this.thumbnailElement = row.createChild('TD').createChild('IMG');
    this.thumbnailElement.styles = {
      height: '2.5em',
    }

    this.textureElement = row.createChild('TD').createChild(RadioIcon);
    this.textureElement.stroke = "white";
    this.textureElement.styles = {
      height: '1.3em',
      margin: '0.6em'
    }

    this.textureName = row.createChild("TD");
    this.textureName.styles = {
      'line-height': '2.5em',
    }
    this.buttonsPanel = row.createChild('TD');
    this.buttonsPanel.styles = {
      margin: '0.75em 0',
      height: '1em'
    }

    this.statusElement = row.createChild("TD");
    this.statusElement.class = "status"
  }

  appendChildToHead(element){
    this.buttonsPanel.appendChild(element);
  }
  removeChildFromHead(element){
    this.buttonsPanel.removeChild(element);
  }

  //Runs a method using the event bus
  runEvent(eventName, params){
    if ( this.master == null ) return;
    if ( typeof this.master === 'object' ) {
      if ( eventName in this.master ) {
        if ( this.master[eventName] instanceof Function ){
          this.master[eventName](params);
        }
      }
    }
  }

  trash(){
    if (this.parentVariant !== null){
      this.parentVariant.removeTexture(this);
    }
  }

  //Delete this texture from the cloud
  async deleteFromCloud(){
    return await deleteFilesFromCloud(this.path);
  }

  /** Upload this texture to the cloud
        @return true if successful upload
  */
  async uploadToCloud(){
    if (!this.filesAreValid) return;

    let filename = this.filename;

    this._uploading = true;
    for ( var type of ["glb", "usdz", "thumbnail"]) {
      let name;
      if ( type === "thumbnail" ){
        name = "thumbnail" + getExt(this[type]);
      }else{
        name = filename + getExt(this[type]);
      }
      this[type] = await uploadFileToCloud(this[type], this.path, (progress) => {
        progress = Number.isNaN(progress) ? '~ ' : `${Math.round(progress)}% `;
        this.statusElement.innerHTML = progress + this[type].name;
      }, name)

    }

    if ( this.mode === -1 ) {
      try{
        await this.fireRef.set(this.json);
        this.statusElement.innerHTML = "Upload Complete"
        this._uploading = false;
        return true;
      }catch(e){
        this.statusElement.innerHTML = "An error occured, please try again."
      }
    }
    this.statusElement.innerHTML = "An error occured, please try again."
    return false;
  }

  async loadThumbnail(){
    this.thumbnailElement.props = {
      src: await loadURL(this.thumbnail)
    }
  }

  async getURL(type){
    if (type in this) {
      if (isURL(this[type])){
        return this[type]
      }else if(this[type] instanceof File){
        return await loadURL(this[type]);
      }
    }
  }

  onclick(){
    this.runEvent('ontextureclick', this);
  }

  get uploading(){
    return this._uploading;
  }

  //Get master for use as an event bus
  get master(){
    return this._master;
  }

  /* mode returns:
        0: invalid
        1: files
       -1: urls
        2: incomplete
  */
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

  //returns true if files are all either urls or File blobs
  get isValid(){
    return Math.abs(this.mode) === 1;
  }

  //returns true if all files are blobs
  get filesAreValid(){
    return this.mode === 1;
  }

  //Set and get parent variant
  set parentVariant(parent){
    if ( SvgPlus.is(parent, Variant) ){
      this._parentVariant = parent;
    }else{
      this._parentVariant = null;
    }
  }
  get parentVariant(){
    return this._parentVariant;
  }
  get parentModel(){
    if (this.parentVariant != null) return this.parentVariant.parentModel;
    return null;
  }

  //Set texture as json
  set json(json){
    this._errorLog = "";

    if ( isJSON(json) ) {

      for ( var key in json ){

        //Check for glb file
        if ( contains(key, "glb") ){
          this.glb = json[key];
        }

        //Check for glb file
        if ( contains(key, "usdz") ){
          this.usdz = json[key];
        }

        //Check for glb file
        if ( contains(key, "thumbnail") ){
          this.thumbnail = json[key];
        }
      }

      if ( !this.isValid ){
        this.logErrors();
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

    if (typeof name !== 'string') return;

    //Check for hex code
    let hexInParentheses = /\((([a-g]|[A-G]|\d){6})\)/
    let color = name.match(hexInParentheses);
    if ( color == null ) return;

    color = color[1];
    if (color) {
      this._name = name;
      this._color = color;

      this.textureName.innerHTML = name.replace(`(${color})`, '');
      this.textureElement.color = `#${this.color}`;
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
      }else{
        this.loadThumbnail();
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
    if ( this.name === null ) return null;
    if ( this.parentVariant == null ) return this.name;

    return `${this.parentVariant.path}/${this.name}`
  }
  get fireRef(){
    if ( this.path == null ) return null;
    return firebase.database().ref(this.path);
  }
  get filename(){
    let variant = this.parentVariant;
    let model = this.parentModel;
    let name = this.name;
    if (variant !== null) name = variant.name + '_' + name;
    if (model !== null) name = model.name + '_' + name;
    return name;
  }

  logErrors(){
    let log = "";
    let errCount = 0;

    if (this.glbMode === 0){
      log += `No GLB file provided in texture ${this.path}\n`
      errCount++;
    }

    if (this.usdzMode === 0){
      log += `No USDZ file provided in texture ${this.path}\n`
      errCount++;
    }

    if (this.thumbnailMode === 0){
      log += `No Thumbnail file provided in texture ${this.path}\n`
      errCount++;
    }

    if (this.name === null){
      log += `Invalid texture name in texture ${this.path}\n`
    }

    if (errCount !== 3){
      console.log(log);
    }
  }
}

class LiveTexture extends Texture{
  async startSync(){
    if ( this.synced ) return false;
    if (this.fireRef == null) return false;
    return new Promise(async (resolve, reject) => {
      try{
        await this.fireRef.on('value', (sc) => {
          this.json = sc.val();
          resolve(this.isValid);
        })
        this._synced = true;
      }catch(e){
        resolve(false);
      }

      setTimeout(() => { resolve(false) }, 5000);
    })
  }

  async stopSync(){
    if ( !this.synced ) return false;
    try{
      await this.fireRef.off();
      this._synced = false;
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  get synced(){
    return !!this._synced;
  }
}

export {Texture, LiveTexture}

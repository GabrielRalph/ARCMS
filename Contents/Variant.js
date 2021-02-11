import {TrashIcon, UploadToCloudIcon, LoaderIcon} from '../Utilities/Icons.js'
import {Model} from './Model.js'
import {Textures, Texture, uploadFileToCloud, contains, isURL, isImage} from './Texture.js'

//isFBX returns true if the given param is an FBX file
function isFBX(file){
  if (file instanceof File){
    return (/\.fbx$/).test(file.name)
  }
  return false;
}

//isGLB returns true if the given param is a GLB file
function isGLB(file){
  if (file instanceof File){
    return (/\.glb$/).test(file.name)
  }
  return false;
}


/**
  Variant is an object the represents a folder containing
  at least one valid texture, a thumbnail, a fbx and glb file.

  @see Texture
*/
class Variant extends SvgPlus{
  constructor(variantData, name, master){
    super('TR');

    this.master = master;

    this._progress = null;
    this._parentModel = null;
    this._fileDownloading = null;

    this.class = 'variant'
    this.buildElement();

    this.name = name;
    this.json = variantData;
  }

  buildElement(){
    this.thumbnailImg = this.createChild('TD').createChild('IMG')
    this.nameCell = this.createChild('TD');
    this.textureCell = this.createChild('TD');

    this.textures = new Textures();
    this.trash = new TrashIcon();
    this.upload = new UploadToCloudIcon();

    this.nameCell.onclick = () => {
      if (typeof this.master === 'object' && this.master.select instanceof Function){
        this.master.select(this);
      }
    }


    this.textureCell.appendChild(this.textures)

    this.buttons = this.createChild('TD');
    this.buttons.appendChild(this.trash);
    this.buttons.appendChild(this.upload);

    this.statusCell = this.createChild('TD');
    this.errorsCell = this.createChild('TD');
  }

  updateButtons(){
    if (this.mode === 1) {

      this.trash.hidden = false;

      this.trash.onclick = () => {
        this.parentModel.removeVariant(this);
      }

      this.upload.hidden = false;
      this.upload.onclick = () => {
        this.uploadToCloud();
      }

    }else if(this.mode === -1) {

      this.upload.hidden = true;
      this.trash.hidden = false;
      this.trash.onclick = () => {
        this.deleteFromCloud();
      }

    }
  }

  async uploadToCloud(){
    if (this.mode === -1) return true;

    if (!this.filesAreValid || this.path === null) {
      return false;
    }

    this.buttons.innerHTML = "";

    if ( !(await this.textures.uploadToCloud()) ){
      return false;
    }

    for (var fileType of ['glb', 'fbx', 'thumbnail']){
      let file = this[fileType];

      let ext = file.name.split(/\./)[1];

      let name = (fileType === 'thumbnail') ? `thumbnail.${ext}` : `${this.parentModel.name}.${fileType}`
      this[fileType] = await uploadFileToCloud(file, this.path, (progress) => {
        progress = parseInt(progress);
        progress = Number.isNaN(progress) ? '~' : progress;
        this.status = `${progress}% ${file.name}`;
      }, name);
    }

    let res = await this.setDatabase();
    if (res){
      this.status = `uploaded complete`
      return true;
    }else{
      return false;
    }

  }

  async setDatabase(){
    try{
      let res = await firebase.database().ref(this.path).set(this.json);
      return true
    }catch(e){
      console.log(e);
      return false
    }
  }

  async deleteFromCloud(){
    if (this.parentModel !== null){
      await this.parentModel.deleteVariantFromCloud(this);
    }
  }


  set parentModel(parent){
    if (SvgPlus.is(parent, Model)){
      this._parentModel = parent;
    }else{
      this._parentModel = null;
    }
  }
  get parentModel(){
    return this._parentModel;
  }


  set errors(e){
    this.errorsCell.innerHTML = e;
  }
  set status(s){
    this.statusCell.innerHTML = s;
  }
  set progress(val){
    val = parseFloat(val);
    if (Number.isNaN(val)){
      this._progress = null;
      return;
    }
    this._progress = val;
    this.loader.progress = val;
  }


  set name(name){
    this.nameCell.innerHTML = name;
    this._name = name;
  }
  get name(){
    return this._name;
  }

  set selected(bool){
    if (bool) {
      this.nameCell.styles = {
        'text-decoration': 'underline',
      }
      this._selected = true;
    }else{
      this.nameCell.styles = {
        'text-decoration': 'none',
      }
      this._selected = false;
    }
  }
  get selected(){
    return this._selected;
  }

  /*
  mode returns
    2: if files are downloading
    1: all files are File objects ready to be uploaded
    0: invalid mix of files
   -1: url links to files
  */
  get mode(){

    let modeSum = 0;
    let error = ''
    for (var name of ['glb', 'fbx', 'thumbnail']){
      if (this[name] instanceof File){
        modeSum++;
      }else if (isURL(this[name])){
        modeSum--;
      }else{
        error += `${name} not included in variant at ${this.path}\n`
      }
    }


    modeSum += this.textures.mode;

    if (modeSum >= 4) return 1;
    if (modeSum <= -4) return -1;

    return 0;
  }


  /*
    texturesMode returns
      1: only files
      0: invalid mix
     -1: urls
  */
  get texturesMode(){
    let url = 0;
    let file = 0;
    for (var name in this.textures){
      if (this.textures[name] instanceof File) file++;
      if (isURL(this.textures[name])) url++;
    }
    if (file > 0 && url === 0) return 1;
    if (file === 0 && url > 0) return -1;
    return 0;
  }

  get isValid(){
    return this.mode !== 0;
  }

  get filesAreValid(){
    return this.mode === 1;
  }


  set fbx(fbx){
    if ( isFBX(fbx) || isURL(fbx)){
      this._fbx = fbx;
    }else{
      this._fbx = null;
    }
  }
  get fbx(){
    return this._fbx;
  }


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


  set thumbnail(thumbnail){
    if (thumbnail instanceof File && (/^image/).test(thumbnail.type)){
      this._thumbnail = thumbnail;
    }else if(isURL(thumbnail)){
      this._thumbnail = thumbnail;
      this.thumbnailImg.props = {src: thumbnail}
    }else{
      this._thumbnail = null;
    }
  }
  get thumbnail(){
    return this._thumbnail;
  }


  set json(json){
    if ( json === null || typeof json !== 'object' ){
      return;
    }

    if ( json instanceof File) return;
    for ( var key in json ){
      if (contains(key, 'thumbnail')){
        this.thumbnail = json[key];
      }else if(contains(key, 'fbx')){
        this.fbx = json[key];
      }else if(contains(key, 'glb')){
        this.glb = json[key];
      }
    }
    this.textures.json = json;
    this.textures.parentVariant = this;

    this.updateButtons();
  }

  get json(){
    if (!this.isValid) return null;

    let res = {
      glb: this.glb,
      fbx: this.fbx,
      thumbnail: this.thumbnail,
    }
    return Object.assign(res, this.textures.json);
  }


  get path(){
    if (this.parentModel == null) return null;
    return this.parentModel.path + '/' + this.name
  }
}

export {Variant, isGLB}

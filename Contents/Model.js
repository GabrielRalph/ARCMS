import {Variant} from './Variant.js'
import {Collection} from './Collection.js'
import {VList} from '../Utilities/VList.js'
import {deleteFilesFromCloud, isImage, isJSON} from '../Utilities/Functions.js'

/**
  A Model (Product) is an object that represents a folder containing
  at least one valid variant.

  @see Varaint
*/
class Model extends VList{
  constructor(variants, name, master){
    super(name, master);

    this.class = 'model'

    //Instantiate private variables
    this._variants = {};
    this._thumbnail = null;
    this._parentCollection = null;

    //Set json
    this.json = variants;
  }

  //Adds a variant object
  addVariant(variant){
    if (SvgPlus.is(variant, Variant)){
      if (variant.isValid){

        variant.parentModel = this;
        this._variants[variant.name] = variant;
        this.pushElement(variant);

      }
    }
  }

  //Removes a variant object
  removeVariant(variant){
    if (SvgPlus.is(variant, Variant)){

      //Remove variant
      this.removeElement(variant)
      delete this._variants[variant.name];
      variant.parentModel = null;

      //If there are no more variants remove this model
      if ( !this.isValid && this.parentCollection !== null){
        this.parentCollection.remove(this);
      }
    }
  }

  //Uploads all variants and their textures to the cloud
  async uploadToCloud(){
    let variants = this._variants;
    for (var name in variants){
      if ( !(await variants[name].uploadToCloud()) ){
        return false;
      }
    }
  }

  //Deletes this model from the cloud
  async deleteFromCloud(){
    deleteFilesFromCloud(this.path);
  }

  set thumbnail(thumbnail){
    if ( isImage(thumbnail) || isURL(thumbnail) ){
      this._thumbnail = thumbnail;
    }else{
      this._thumbnail = null;
    }
  }
  get thumbnail(){
    return this._thumbnail;
  }

  //Set model using json object
  set json(variants){
    this.clear();
    this._variants = {};
    if ( isJSON(variants) ){
      for (var name in variants){

        if (name === 'info'){
          this.info = variants[name];

        }else if(name === 'thumbnail'){
          this.thumbnail = variants[name];

        }else{
          let variant = new Variant(variants[name], name, this.master);
          this.addVariant(variant);
        }
      }
    }
  }

  //set and get parent collection
  set parentCollection(collection){
    if (SvgPlus.is(collection, Collection)){
      this._parentCollection = collection;
    }else{
      this._parentCollection = null;
    }
  }
  get parentCollection(){
    return this._parentCollection;
  }

  //return true if there are more than one valid textures
  get isValid(){
    return Object.keys(this._variants).length > 0;
  }

  //get path
  get path(){
    if (this.name === null) return "";
    if (this.parentCollection == null) return this.name;
    return this.parentCollection.path + '/' + this.name;
  }
}

class LiveModel extends Model{

  get synced(){
    return !!this._synced
  }


  async startSync(){
    if ( !this.isValid || this.path === null ) return false;
    try{
      this.clearVariants();
      await firebase.database().ref(this.path).on('value', (sc) => {
        this._onSyncValue(sc);
      });
      this._synced = true;
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  async _onSyncValue(sc){
    this.json = sc.val();

    if (! this.isValid) {
      await firebase.database().ref(this.path).remove();
    }
  }

  async stopSync(){
    try{
      await firebase.database().ref(this.path).off();
      this._synced = false;
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }
}

class InfoForm extends SvgPlus{
  constructor(master, model){

    super('DIV');
    this.master = master;
    this.class = "info-form"

    this.styles = {position: 'relative'};

    this.upload = new UploadToCloudIcon();
    this.upload.styles = {
      position: 'absolute',
      top: '0.3em',
      right: 0,
      'font-size': '0.7em'
    }
    this.upload.onclick = () => {
      this.uploadToCloud();
    }
    this.appendChild(this.upload)

    this._name = this.createChild('H1');

    this.createChild('H2').innerHTML = "Description";
    this.description = this.createChild('textarea');

    this.createChild('H2').innerHTML = "Price";
    this.price = this.createChild('input');

    this.createChild('H2').innerHTML = "Link";
    this.link = this.createChild('input');

    this.model = model;
  }

  set name(name){
    this._name.innerHTML = name;
  }

  get json(){
    return {
      description: this.description.value,
      price: this.price.value,
      link: this.link.value
    }
  }

  set json(json){

    if (json === null || typeof json !== 'object' ) return;

    if ('description' in json) this.description.value = json.description;
    if ('price' in json) this.price.value = json.price;
    if ('link' in json) this.link.value = json.link;
  }

  set model(model){
    if (SvgPlus.is(model, Model)){
      if ('info' in model) this.json = model.info;
      if ('name' in model) this.name = model.name;
      this._model = model;
    }
  }

  get model(){
    return this._model;
  }

  async uploadToCloud(){
    let path = this.model.path;
    if (path == null) return;
    path += '/info';
    try{
      await firebase.database().ref(path).set(this.json);
      if (typeof this.master === 'object' && this.master.removeTools instanceof Function)
      this.master.removeTools();
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }
}


export {Model, InfoForm}

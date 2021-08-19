import {SvgPlus} from '../3.js'

import {Variant, LiveVariant} from './Variant.js'
import {Collection, LiveCollection, ImageLoader} from './Collection.js'
import {VList} from '../Utilities/VList.js'
import {TickIcon} from '../Utilities/Icons.js'
import {deleteFilesFromCloud, isImage, isJSON, isURL} from '../Utilities/Functions.js'

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

  ontitleclick(){
    this.runEvent('onmodelclick', this);
  }

  trash(){
    if (this.parentCollection !== null){
      this.parentCollection.remove(this);
    }
  }

  //Adds a variant object
  addVariant(variant){
    if (SvgPlus.is(variant, Variant)){
      if (variant.isValid){

        variant.parentModel = this;
        this._variants[variant.name] = variant;
        this.addElement(variant);

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
    if ( !this.isValid ) return;

    let variants = this._variants;
    for (var name in variants){
      if ( !(await variants[name].uploadToCloud()) ){
        return false;
      }
    }
  }

  //Deletes this model from the cloud
  async deleteFromCloud(){
    return await deleteFilesFromCloud(this.path);
  }

  get uploading(){
    for (var key in this._variants){
      if (this._variants[key].uploading) return true;
    }
    return false;
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

    this.show();
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
    return this.variantCount > 0;
  }

  //get path
  get path(){
    if (this.name === null) return null;
    if (this.parentCollection == null) return this.name;
    return this.parentCollection.path + '/' + this.name;
  }

  get fireRef(){
    if ( this.path === null ) return null;
    return firebase.database().ref(this.path);
  }

  get variantCount(){
    return Object.keys(this._variants).length;
  }

  get filesAreValid(){
    for (var key in this._variants){
      if (this._variants[key].filesAreValid) return true;
    }
    return false;
  }
}

class LiveModel extends Model{

  async startSync(){
    if ( this.synced ) return false;
    if ( this.fireRef === null ) return false;
    return new Promise(async (resolve, reject) => {
      try{
        await this.fireRef.on('child_added', async (sc) => {
          if (sc.key == 'thumbnail'){
            this.thumbnail = sc.val();
          }else if(sc.key == 'info'){
            this.info = sc.val();
          }else{
            await this._onSyncChildAdded(sc);
            resolve(this.isValid);
          }
        })
        await this.fireRef.on('child_removed', (sc) => {
          this._onSyncChildRemoved(sc);
        })

        await this.fireRef.child('info').on('value', (sc) => {
          this.info = sc.val();
        })

        await this.fireRef.child('thumbnail').on('value', (sc) => {
          this.thumbnail = sc.val();
        })

        this._synced = true;
      }catch(e){
        resolve(false);
        this._synced = false;
      }

      setTimeout(() => {
        resolve(false)
        this._synced = false;
       }, 5000);
    })
  }

  async _onSyncChildAdded(sc){
    let variant = new LiveVariant(null, sc.key, this.master);
    variant.parentModel = this;
    if (await variant.startSync()){
      this.addVariant(variant);
      return true;
    }
    return false;
  }

  async _onSyncChildRemoved(sc){
    let key = sc.key;
    if (key in this._variants){
      let variant = this._variants[key];
      variant.stopSync();

      if (this.variantCount == 1){
        await this.deleteFromCloud();
      }else{
        this.removeVariant(this._variants[key])
      }
    }
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
    return !!this._synced
  }
}

class ModelInfoForm extends SvgPlus{
  constructor(model){

    super('DIV');
    this.class = "info-form"

    this._name = this.createChild('H1');

    this.appendChild(new ImageLoader(model));

    this.createChild('H2').innerHTML = "Description";
    this.description = this.createChild('textarea');
    this.description.addEventListener('focusout', () => {
      this.uploadToCloud()
    })

    this.createChild('H2').innerHTML = "Link";
    this.link = this.createChild('input');
    this.link.addEventListener('focusout', () => {
      this.uploadToCloud()
    })

    this.createChild('H2').innerHTML = "Scale";
    this.scale = this.createChild('input', {type: "number"});
    this.scale.addEventListener('focusout', () => {
      this.uploadToCloud()
    })

    let fbox = this.createChild('DIV', {
      styles: {
        float: 'left'
      }
    })
    let featured = fbox.createChild('H2', {
      styles: {
        float: 'left',
        display: 'inline'
      }
    }).innerHTML = "Featured";
    this.featured = fbox.createChild(TickIcon);
    this.featured.stroke = "black";
    this.featured.styles = {
      height: '0.6em',
      'padding-left': '0.5em',
      float: 'left'
    }
    fbox.onclick = () => {
      this.featured.ticked = !this.featured.ticked;
      this.uploadToCloud();
    }


    let hbox = this.createChild('DIV', {
      styles: {
        float: 'left',
        "padding-left": "0.5em"
      }
    });
    let htitle = hbox.createChild('H2', {
      styles: {
        float: 'left',
        display: 'inline'
      }
    }).innerHTML = "Hidden";

    this.hiddenState = hbox.createChild(TickIcon);
    this.hiddenState.stroke = "black";
    this.hiddenState.styles = {
      height: '0.6em',
      'padding-left': '0.5em',
      float: 'left'
    }
    hbox.onclick = () => {
      this.hiddenState.ticked = !this.hiddenState.ticked;
      this.uploadToCloud();
    }

    this.model = model;

    this.startSync();
  }

  set name(name){
    this._name.innerHTML = name;
  }

  get json(){
    return {
      description: this.description.value,
      link: this.link.value,
      featured: this.featured.ticked,
      scale: this.scale.value,
      hidden: this.hiddenState.ticked,
    }
  }

  set json(json){

    if (json === null || typeof json !== 'object' ) return;

    if ('description' in json) this.description.value = json.description;
    if ('featured' in json) this.featured.ticked = json.featured;
    if ('link' in json) this.link.value = json.link;
    if ('scale' in json) this.scale.value = json.scale;
    if ('hidden' in json) this.hiddenState.ticked = json.hidden;
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

  async startSync(){
    if (this.model.fireRef !== null){
      await this.model.fireRef.child('info').on('value', (sc) => {
        this.json = sc.val();
      })
    }
  }

  uploadToCloud(){
    if (this.model.fireRef !== null){
      this.model.fireRef.child('info').set(this.json);
    }
  }
}


export {Model, LiveModel, ModelInfoForm}

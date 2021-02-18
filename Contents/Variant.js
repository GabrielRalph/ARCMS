import {isJSON, deleteFilesFromCloud} from '../Utilities/Functions.js'
import {VList} from '../Utilities/VList.js'
import {Model, LiveModel} from './Model.js'
import {Texture, LiveTexture} from './Texture.js'


/**
  A Variant is an object that represents a folder containing
  at least one valid texture.

  A variant can also contain an info object that provides
  information on the variant such as price

  @see Texture
*/
class Variant extends VList{
  constructor(variantData, name, master = null){
    super(name, master);

    this.class = "variant"

    //Instantiate private variables
    this._textures = {};
    this._parentModel = null;

    //Set json
    this.json = variantData;
  }

  ontitleclick(){
    this.runEvent('onvariantclick', this);
  }

  //Deletes this variant from the cloud
  async deleteFromCloud(){
    return await deleteFilesFromCloud(this.path);
  }

  //Uploads this variant to the cloud
  async uploadToCloud(){
    if ( !this.isValid ) return;
    for ( var name in this._textures ){
      if (!(await this._textures[name].uploadToCloud())){
        return false;
      }
    }
    return true;
  }

  trash(){
    if (this.parentModel !== null){
      this.parentModel.removeVariant(this);
    }
  }

  //Adds a Texture object
  addTexture(texture){
    if ( SvgPlus.is(texture, Texture) ){
      if ( texture.isValid ){
        texture.parentVariant = this;
        this.addElement(texture);
        this._textures[texture.name] = texture;
      }
    }
  }

  //Removes a Texture object
  removeTexture(texture){
    if ( SvgPlus.is(texture, Texture) ){
      if (`${texture.name}` in this._textures){

        this.removeElement(texture);
        delete this._textures[texture.name];
        texture.parentVariant = null;

        if ( !this.isValid && this.parentModel !== null ){
          this.parentModel.removeVariant(this);
        }
      }
    }
  }

  get uploading(){
    for (var key in this._textures){
      if (this._textures[key].uploading) return true;
    }
    return false;
  }

  //returns true if there are more than one valid texture
  get isValid(){
    return this.textureCount > 0;
  }

  //Set variant using json object
  set json(json){
    this.clear();
    this._textures = {};

    if ( isJSON(json) ) {
      for ( var key in json ){

        if (key === 'info'){
          this.info = json.info;
        }else{
          let texture = new Texture(json[key], key, this.master);
          this.addTexture(texture);
        }
      }
    }

    this.show();
  }

  get textureCount(){
    return Object.keys(this._textures).length;
  }

  //Set and get parent Model
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

  //get path of this variant
  get path(){
    if (this.name === null) return null;
    if (this.parentModel == null) return this.name;
    return this.parentModel.path + '/' + this.name;
  }

  get fireRef(){
    if ( this.name == null ) return null;
    return firebase.database().ref(this.path);
  }

  get filesAreValid(){
    for (var key in this._textures){
      if (this._textures[key].filesAreValid) return true;
    }
    return false;
  }
}


class LiveVariant extends Variant{

  async startSync(){
    if ( this.synced ) return false;
    if ( this.fireRef === null ) return false;
    return new Promise(async (resolve, reject) => {
      try{
        await this.fireRef.on('child_added', async (sc) => {
          if (sc.key == 'info'){
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
    let texture = new LiveTexture(null, sc.key, this.master);
    texture.parentVariant = this;
    if (await texture.startSync()){
      this.addTexture(texture);
      return true;
    }
    return false;
  }

  async _onSyncChildRemoved(sc){
    let key = sc.key;
    if (key in this._textures){
      let texture = this._textures[key];
      texture.stopSync();

      if (this.textureCount == 1){
        await this.deleteFromCloud();
      }else{
        this.removeTexture(texture)
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
    return !!this._synced;
  }
}

class VariantInfoForm extends SvgPlus{
  constructor(variant){

    super('DIV');
    this.class = "info-form"

    this._name = this.createChild('H1');

    this.createChild('H2').innerHTML = "Price";
    this.price = this.createChild('input');
    this.price.props = {type: "number"};
    this.price.addEventListener('focusout', () => {
      this.uploadToCloud()
    })



    this.variant = variant;
  }

  set name(name){
    this._name.innerHTML = name;
  }

  get json(){
    return {
      price: this.price.value
    }
  }

  set json(json){

    if (json === null || typeof json !== 'object' ) return;

    if ('price' in json) this.price.value = json.price;
  }

  set variant(variant){
    if (SvgPlus.is(variant, Variant)){
      if ('info' in variant) this.json = variant.info;
      if ('name' in variant) this.name = variant.name;
      this._variant = variant;
    }
  }

  get variant(){
    return this._variant;
  }

  uploadToCloud(){
    if (this.variant.fireRef !== null){
      this.variant.fireRef.child('info').set(this.json);
    }
    this.remove();
  }
}

export {Variant, LiveVariant, VariantInfoForm}

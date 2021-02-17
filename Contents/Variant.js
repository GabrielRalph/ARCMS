import {isJSON, deleteFilesFromCloud} from '../Utilities/Functions.js'
import {VList} from '../Utilities/VList.js'
import {Model} from './Model.js'


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

    //Create title
    this.nameElement = this.createChildOfHead('H1');

    //Instantiate private variables
    this._textures = {};
    this._parentModel = null;

    //Set json
    this.json = variantData;
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

  //returns true if there are more than one valid texture
  get isValid(){
    return Object.keys(this._textures).lenght > 0;
  }

  //Set variant using json object
  set json(json){
    this.clear();
    this._textures = {};

    if ( isJSON(json) ) {
      for ( var key in json ){

        if (key === 'info'){
          this.info = json[info];
        }else{
          let texture = new Texture(json[key], key, this.master);
          this.addTexture(texture);
        }
      }
    }
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
    if (this.name === null) return "";
    if (this.parentModel == null) return this.name;
    return this.parentModel.path + '/' + this.name;
  }
}

export {Variant}

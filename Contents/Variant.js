import {TrashIcon, UploadToCloudIcon, LoaderIcon} from '../Utilities/Icons.js'
import {isJSON} from '../Utilities/Functions.js'
import {Model} from './Model.js'




/**
  Variant is an object the represents a folder containing
  at least one valid texture, a thumbnail, a fbx and glb file.

  @see Texture
*/
class Variant extends VList{
  constructor(variantData, name, master = null){
    super('TR');

    this._master = master;

    this.nameElement = this.createChildOfHead('H1');

    this.name = name;
    this.json = variantData;
  }

  addTexture(texture){
    if ( SvgPlus.is(texture, Texture) ){
      if ( texture.isValid ){
        texture.parentVariant = this;
        this.pushElement(texture);
        this._textures[texture.name] = texture;
      }
    }
  }

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

  get isValid(){
    return Object.keys(this._textures).lenght > 0;
  }

  get master(){
    return this._master;
  }

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


  set name(name){
    this.nameElement.innerHTML = name;
    this._name = name;
  }
  get name(){
    return this._name;
  }

  get path(){
    if (this.parentModel == null) return this.name;
    return this.parentModel.path + '/' + this.name
  }
}

export {Variant}

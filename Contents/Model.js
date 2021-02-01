import {Variant} from './Variant.js'
import {Collection} from './Collection.js'
import {UploadToCloudIcon} from '../Utilities/Icons.js'


class Model extends SvgPlus{
  constructor(variants, name, master){
    super('div');
    this.master = master;
    this.class = 'model'
    this._variants = null;
    this.buildElement();
    this.json = variants;
    this.name = name;
  }

  buildElement(){
    this.headerElement = this.createChild('DIV');
    this.headerElement.class = 'header'

    this.headerName = this.headerElement.createChild('h1');
    this.headerName.onclick = () => {
      if (typeof this.master === 'object' && this.master.select instanceof Function){
        this.master.select(this);
      }
    }

    this.variantsTable = this.createChild('TABLE');
    this.variantsBody = this.variantsTable.createChild('TBODY');
  }

  appendChildToHead(child){
    this.headerElement.appendChild(child)
  }


  addVariant(variant){
    if (SvgPlus.is(variant, Variant)){
      if (variant.isValid){
        if (this._variants === null){
          this._variants =  {};
        }
        variant.parentModel = this;
        this._variants[variant.name] = variant;
        this.variantsBody.appendChild(variant);
      }
    }
  }


  removeVariant(variant){
    if (SvgPlus.is(variant, Variant)){
      if (typeof this._variants === 'object'){
        this.variantsBody.removeChild(variant)
        delete this._variants[variant.name];
        if (Object.keys(this._variants).length == 0){
          this.parentCollection.remove(this);
        }
      }
    }
  }


  clearVariants(){
    this.variantsBody.innerHTML = '';
    this._variants = null;
  }


  trash(){
    if (this.parentCollection !== null){
      this.parentCollection.remove(this)
    }
  }


  async uploadToCloud(){
    let variants = this._variants;
    for (var name in variants){
      if (!(await variants[name].uploadToCloud())){
        console.log('x');
        return false;
      }
    }
    return true;
  }


  async deleteFromCloud(){
    let variants = this._variants;
    for (var name in variants){
      if (!(await variants[name].deleteFromCloud())){
        return false;
      }
    }
    return true;
  }


  set selected(bool){
    if (bool) {
      this.headerName.styles = {
        'text-decoration': 'underline',
      }
      this._selected = true;
    }else{
      this.headerName.styles = {
        'text-decoration': 'none',
      }
      this._selected = false;
    }
  }
  get selected(){
    return this._selected;
  }


  set json(variants){
    if (typeof variants === 'object' && variants !== null){
      this.clearVariants();

      if (variants instanceof File) return;

      for (var name in variants){
        if (name === 'info'){
          this.info = variants[name];
        }else{
          let variant = new Variant(variants[name], name, this.master);
          this.addVariant(variant);
        }
      }
    }
  }



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


  get path(){
    if (this.parentCollection == null) {
      return this.name;
    }else{
      return this.parentCollection.path + '/' + this.name;
    }
  }


  set name(name){
    this.headerName.innerHTML = name;
    this._name = name;
  }

  get name(){
    return this._name;
  }


  get filesAreValid(){
    return ! (this.variantFiles == null)
  }


  get isValid(){
    return this._variants !== null
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

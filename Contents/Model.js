import {Variant} from './Variant.js'
import {Collection} from './Collection.js'

class Model extends SvgPlus{
  constructor(variants, name){
    super('div');
    this.class = 'model'
    this.buildElement();

    this.variants = variants;
    this.name = name;
  }

  buildElement(){
    this.headerElement = this.createChild('DIV');
    this.headerElement.class = 'header'
    this.headerName = this.headerElement.createChild('h1');

    this.variantsTable = this.createChild('TABLE');
    this.variantsBody = this.variantsTable.createChild('TBODY');
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

  set variants(variants){
    this.clearVariants();
    if (typeof variants === 'object'){
      for (var name in variants){
        let variant = new Variant(variants[name], name);
        this.addVariant(variant);
      }
    }
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
          this.collectionParent.remove(this);
        }
      }
    }
  }

  clearVariants(){
    this.variantsBody.innerHTML = '';
    this._variants = null;
  }

  get variants(){
    return this._variants;
  }
}

export {Model}

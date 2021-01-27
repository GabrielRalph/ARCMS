import {VList} from '../Utilities/VList.js'
import {Model} from './Model.js'

class Collection extends VList{
  constructor(json = null, name = ''){
    super();
    console.log(json);
    this.class = "collection"
    this.buildElement();

    this._collection = null;
    this._mode = null;

    this.name = name;
    this.json = json;
  }

  clear(){
    this._collection = null;
    this.list = null;
  }

  buildElement(){
    this.headerTitle = this.createChildOfHead('H1');
    this.headerTitle.innerHTML = name;
    this.headerTitle.onclick = () => {
      this.open = !this.open;
    }
  }

  set name(name){
    this.headerTitle.innerHTML = name;
    this._name = name;
  }

  get name(){
    return this._name;
  }

  get isValid(){
    return this._collection !== null;
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
    if (this.parentCollection == null){
      return this.name;
    }else{
      return this.parentCollection.path + '/' + this.name;
    }
  }


  forEach(callback){
    if (callback instanceof Function){
      for (var key in this._collection){
        callback(this[key], key)
      }
    }
  }

  getAllModels(el = this){
    let models = [];
    if (SvgPlus.is(el, Collection)) {
      el.forEach((item, key) => {
        models = models.concat(this.getAllModels(item));
      });
      return models;
    }else if (SvgPlus.is(el, Model)){
      return [el];
    }
  }

  remove(item){
    if (SvgPlus.is(item, Collection) || SvgPlus.is(item, Model)){
      delete this._collection[item.name];
      item.parentCollection = null;
      this.removeElement(item);

      if (Object.keys(this._collection).length == 0){
        this.parentCollection.remove(this);
      }
    }
  }

  async showAll(duration = 100){
    await this.show();
    for (var element of this.list){
      if (SvgPlus.is(element, Collection)){
        await element.showAll(duration);
      }
    }
  }


  add(el, name = el.name){
    if (this._collection == null) {
      this._collection = {};
    }
    if (SvgPlus.is(el, Model) && el.isValid){
      if (this._mode == null || this._mode === 'models'){

        if (this._collection == null) this._collection = {};
        this._mode = 'models'
        this.pushElement(el);

        el.parentCollection = this;
        this._collection[name] = el;
      }
    }else if (SvgPlus.is(el, Collection) && el.isValid){
      if (this._mode == null || this._mode === 'category'){

        if (this._collection == null) this._collection = {};
        this._mode = 'category';
        this.pushElement(el)

        el.parentCollection = this;
        this._collection[name] = el;
      }
    }
    if (Object.keys(this._collection).length == 0){
      this._collection = null;
    }
  }

  set json(json){
    this.clear();
    if (json === null || json instanceof File || typeof json !== 'object' || typeof json === 'string') return;

    for (var key in json) {

      let value = json[key];

      let model = new Model(value, key);

      if (model.isValid) {
        this.add(model)
      }else{
        let subcollection = new Collection(value, key);
        if (subcollection.isValid){
          this.add(subcollection)
        }
      }
    }
  }
}

export {Collection}

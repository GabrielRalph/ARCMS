class Collection extends VList{
  constructor(json = null, name = ''){
    super();
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


  add(el, name = el.name){
    if (this._collection == null) {
      this._collection = {};
    }
    if (SvgPlus.is(el, Model) && el.isValid){
      if (this._mode == null || this._mode === 'models'){

        if (this._collection == null) this._collection = {};
        this._mode = 'models'
        this.pushElement(el);

        el.collectionParent = this;
        this._collection[name] = el;
      }
    }else if (SvgPlus.is(el, Collection) && el.isValid){
      if (this._mode == null || this._mode === 'category'){

        if (this._collection == null) this._collection = {};
        this._mode = 'category';
        this.pushElement(el)

        el.collectionParent = this;
        this._collection[name] = el;
      }
    }
    if (Object.keys(this._collection).length == 0){
      this._collection = null;
    }
  }

  set json(json){
    if (json instanceof File || typeof json !== 'object') return;

    for (var key in json) {

      let value = json[key];
      let model = new Model(value, key);

      if (model.isValid) {
        this.add(model)
      }else{
        let subcollection = new Collection(value, key);
        console.log(subcollection, value);
        this.add(subcollection)
      }
    }
  }
}

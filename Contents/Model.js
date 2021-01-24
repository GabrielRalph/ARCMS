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
    this.variantsTable.class = 'list'
    this.variantsBody = this.variantsTable.createChild('TBODY');
  }

  get path(){
    let parent = this.collectionParent;
    let path = this.name;
    while (SvgPlus.is(parent, Collection)){
      path = parent.name + '/' + path;
      parent = parent.collectionParent;
    }
    return path;
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
    if (typeof variants === 'object'){
      this._variants = {};
      for (var name in variants){
        let variant = new Variant(variants[name], name);
        variant.parentModel = this;
        if (variant.isValid){
          this._variants[name] = variant;
          this.variantsBody.appendChild(variant);
        }
      }

      if (Object.keys(this._variants).length > 0){
        return;
      }
    }
    this.variantsBody.innerHTML = "";
    this._variants = null;
  }

  get variants(){
    return this._variants;
  }

}

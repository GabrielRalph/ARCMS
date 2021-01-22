class Uploader extends SvgPlus{

  constructor(){
    super('input');
    this.props = {
      webkitdirectory: true,
      type: 'file'
    }

    this.fileTree = {};
  }


  onchange(){
    this.makeFileTree();
    let collections = this.getContentUpdate();
    console.log(collections);
    document.body.appendChild(collections)
    console.log(collections.getAllModels());

  }

  _getPath(file){
    let path = file.webkitRelativePath;
    if (typeof path === 'string'){
      path = path.split(/\/|\./g);
    }else{
      return null;
    }
    if (path.length < 5){
      return null;
    }

    if ((/\.(fbx)|(glb)$/).test(file.name)){
      path[path.length - 2] = path[path.length - 1];
      path.pop();
      path.push(file);
      return path;
    }

    if ((/^image/).test(file.type)){
      let name = path[path.length - 2];
      if (name == 'thumbnail' ){
        path.pop();
        path.push(file);
        return path;

      }else if( (/\(([a-g]|[A-G]|\d){6}\)/).test(name)){
        path[path.length - 1] = path[path.length - 2];
        path[path.length - 2] = 'textures'
        path.push(file);
        return path;
      }
    }

    return null;
  }

  insertFile(file){
    let path = this._getPath(file);
    if (path === null) return;
    let ref = this.fileTree;
    for (var i = 0; i < path.length - 1; i++){
      let part = path[i];

      if (i == path.length - 2){
        ref[part] = path[path.length - 1];
      }else{
        if (part in ref){
          ref = ref[part];
        }else{
          ref[part] = {};
          ref = ref[part];
        }
      }
    }
  }

  makeFileTree(){
    if (this.files instanceof FileList && this.files.length > 0){
      for (var file of this.files){
        this.insertFile(file);
      }
    }
  }

  getContentUpdate(){
    let search = (node, name) => {
      if (node instanceof File || typeof node !== 'object') return null;

      let collection = new Collection(name);
      for (var childName in node){
        let res = search(node[childName], childName);
        collection.add(res, childName);
      }

      if (collection.isValid){
        return collection;
      }else{
        return new Model(node, name);
      }
    }

    return search(this.fileTree, 'Content');
  }
}


// class Downloader{
//   constructor(fileTree){
//     this.assetFiles = assetFiles;
//   }
//
//   set assetFiles(assetFiles){
//     this._assetFiles = {};
//     let modelCount = 0;
//     let check = (data) => {
//       if (typeof data === 'object' && !(data instanceof File)){
//
//         let collection = new Collection();
//         for (var key in data){
//           let res = check(data[key], key, parent[name]);
//           collection.add(res, key)
//         }
//
//         if (collection.isValid){
//           return collection;
//         }
//
//         let model = new Model(data);
//         if (model.filesAreValid){
//           return model;
//         }else{
//           return null;
//         }
//
//       }else{
//         return null;
//       }
//     }
//   }
// }

class Collection extends VList{
  constructor(name){
    super();
    this.buildElement();
    this.name = name;
    this._keys = null;
    this._mode = null;
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
  }

  get name(){
    return this.headerTitle.innerHTML;
  }

  get isValid(){
    return this._keys !== null;
  }
  get keys(){
    return this._keys;
  }


  forEach(callback){
    if (callback instanceof Function){
      for (var key of this.keys){
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


  add(el, name){
    if (SvgPlus.is(el, Model) && el.filesAreValid){
      if (this._mode == null || this._mode === 'models'){
        this._mode = 'models'
        if (this.keys == null){
          this._keys = [];
        }
        this.pushElement(el);
        el.collectionParent = this;
        this._keys.push(name)
        this[name] = el;
      }
    }else if (SvgPlus.is(el, Collection) && el.isValid){
      if (this._mode == null || this._mode === 'category'){
        this._mode = 'category';
        if (this.keys == null){
          this._keys = [];
        }
        this.pushElement(el)
        el.collectionParent = this;
        this._keys.push(name)
        this[name] = el;
      }
    }
  }

}

class Model extends SvgPlus{
  constructor(modelFiles, name){
    super('div');
    this.buildElement();
    this.modelFiles = modelFiles;
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
  }

  get name(){
    return this.headerName.innerHTML;
  }

  get filesAreValid(){
    return ! (this.variantFiles == null)
  }

  set modelFiles(data){
    if (typeof data === 'object'){
      this.variantFiles = data;
    }else{
      this.variantFiles = null;
    }
  }

  set variantFiles(variants){
    if (typeof variants === 'object'){
      let variantFiles = {};
      for (var name in variants){
        let variant = new Variant(variants[name], name);
        if (variant.filesAreValid){
          variantFiles[name] = variant;
          this.variantsBody.appendChild(variant)
        }
      }
      if (Object.keys(variantFiles).length == 0){
        this._variantFiles = null;
      }else{

        this._variantFiles = variantFiles;
      }
    }else{
      this._variantFiles = null;
    }
  }

  get variantFiles(){
    return this._variantFiles;
  }

}

class Variant extends SvgPlus{
  constructor(variantFiles, name){
    super('TR');
    this.header = this.createChild('TD');
    this.header.innerHTML = name;
    this.texture = this.createChild('TD');

    this.variantFiles = variantFiles;
  }

  uploadFiles(){

  }

  get filesAreValid(){
    return !(this.fbxFile == null || this.glbFile == null || this.thumbnailFile == null || this.textureFiles == null)
  }

  set variantFiles(data){
    if (typeof data === 'object'){
      this.fbxFile = data.fbx;
      this.glbFile = data.glb;
      this.thumbnailFile = data.thumbnail;
      this.textureFiles = data.textures;
    }else{
      this.fbxFile = null;
      this.glbFile = null;
      this.thumbnailFile = null;
      this.textureFiles = null;
    }
  }

  set fbxFile(fbx){
    if (fbx instanceof File && (/\.fbx$/).test(fbx.name)){
      this._fbxFile = fbx;
    }else{
      this._fbxFile = null;
    }
  }
  get fbxFile(){
    return this._fbxFile;
  }


  set glbFile(glb){
    if (glb instanceof File && (/\.glb$/).test(glb.name)){
      this._glbFile = glb;
    }else{
      this._glbFile = null;
    }
  }
  get glbFile(){
    return this._glbFile;
  }

  set thumbnailFile(thumbnail){
    if (thumbnail instanceof File && (/^image/).test(thumbnail.type)){
      this._thumbnailFile = thumbnail;
    }else{
      this._thumbnailFile = null;
    }
  }
  get thumbnailFile(){
    return this._thumbnailFile;
  }

  get textureFiles(){
    return this._texturesFiles;
  }

  set textureFiles(files){
    if (typeof files === 'object'){
      this.texture.innerHTML = "";
      this._texturesFiles = {};
      for (var name in files){
        let file = files[name];
        if (file instanceof File && (/\(([a-g]|[A-G]|\d){6}\)/).test(name) && (/^image/).test(file.type)){
          this._texturesFiles[name] = file;
          let color = name.match(/\((([a-g]|[A-G]|\d){6})\)/)
          this.texture.innerHTML += `<b style = "color: #${color[1]}">⬤ </b>`
        }
      }
      if (Object.keys(this._texturesFiles).length > 0){
        return;
      }
    }
    this._texturesFiles = null;
  }
}

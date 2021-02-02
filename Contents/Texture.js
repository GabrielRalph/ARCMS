import {Variant} from './Variant.js'


//Returns true is a string is a url
function isURL(str) {
  if (typeof str !== 'string') return false;
  var pattern = new RegExp('^(https?:\\/\\/firebasestorage)'); // fragment locator
  return !!pattern.test(str);
}

//Returns true if param is an image file
function isImage(image) {
  if (image instanceof File) {
    return (/^image/).test(image.type);
  }else{
    return false;
  }
}

//Check string contains substring
function contains(string, value){
  let regex = new RegExp(value);
  return regex.test(string)
}

// Upload file to firebase storage bucket
async function uploadFileToCloud(file, path, statusCallback){
  path = `${path}`
  if ( !(file instanceof File) || typeof path !== 'string' ){
    console.log('invalid file');
    return null;
  }
  return new Promise((resolve, reject) => {

    try{
      var uploadTask = firebase.storage().ref().child(path + '/' + file.name).put(file);
    }catch(e){
      console.log(e);
      resolve(null)
    }

    uploadTask.on('state_changed', (snapshot) => {

      // Observe state change events such as progress, pause, and resume
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if (statusCallback instanceof Function) {
        statusCallback(progress);
      }

    }, function(error) {
      resolve(null);
    }, function() {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        resolve(downloadURL);
      });
    });
  })
}

/*
Texture is an object that represents a folder containing
3 image files.

Images must inclue "albedo", "metallic" and "normal",
individualy in each of their filenames. Case sensitive
e.g.

some file and info metallic.png
some_file_with_underscores_albedo.png
as long as it has normal in the name.jpg
*/
class Texture extends SvgPlus{
  constructor(json, name){
    super('SPAN');
    this.class = "texture";

    this._parentVariant = null;

    this.name = name;
    this.json = json;

    this.innerHTML = '⬤';
  }

  async deleteFromCloud(){
    if (this.path == null) return false;

    let ref = firebase.storage().ref()
    let childRef = ref.child(this.path)
    try{
      let files = await childRef.listAll();
      files = files.items;
      for (var file of files){
        await ref.child(file.fullPath).delete();
      }
    }catch(e){
      this.parentVariant.errors = 'Error deleting from cloud, please refresh and try again'
      return false;
    }
    return true;
  }

  async uploadToCloud(){
    if ( !this.filesAreValid ){
      return false;
    }

    for (var textureFormat of this.textureFormats){
      let file = this[textureFormat];
      this[textureFormat] = await uploadFileToCloud(file, this.path, (progress) => {

        if (this.parentVariant === null) return;

        progress = Math.round(progress);
        progress = Number.isNaN(progress) ? '~' : progress;
        this.parentVariant.status = `${Math.round(progress)}% ${file.name}`;
      })
    }

    if (this.mode === -1){
      return true;
    }else{
      return false;
    }
  }

  get textureFormats(){ return ['metallic', 'albedo', 'normal'] }

  //Set the texture as a json object
  set json(json){
    if (json === null || typeof json !== 'object') return;
    if (json instanceof File) return;

    // Texture json must contain exactly 3 json
    if (Object.keys(json).length !== 3) return;

    let textureFormats = this.textureFormats;

    while (textureFormats.length > 0){

      let found = false;

      // Check a file contains a valid format in its name i.e. (file_name_metallic.png)
      // then remove that format from the list of formats and continue to check
      // the other files
      for (var name in json){

        let file = json[name];

        if (contains(name, textureFormats[0])){
          let textureFormat = textureFormats.shift();
          this[textureFormat] = file;
          found = true;
          break;
        }
      }

      // If no file is found with the given texture format in its name then
      // the texture is inValid so we can return
      if (!found){
        return;
      }
    }
  }
  //Get texture as json object
  get json(){
    if (!this.isValid) return null;

    return {
      metallic: this.metallic,
      albedo: this.albedo,
      normal: this.normal
    }
  }


  //Set and get name
  set name(name){
    let hexInParentheses = /\((([a-g]|[A-G]|\d){6})\)/
    let color = name.match(hexInParentheses);
    if ( color == null ) {
      this._name = null;
      return;
    }
    color = color[1];
    if (color) {
      this._name = name;
      this._color = color;
      this.styles = {color: this.color};
    }else{
      this._name = null;
    }
  }
  get name(){
    return this._name;
  }

  //Get the hex code color set in the name
  get color(){
    return '#' + this._color;
  }


  /* Mode returns:
      1: all files are Files
      0: invalid texture
     -1: all files are URL links to the firestore
  */
  get mode(){
    if (this.name == null) return 0;

    let mode = 0;
    for (var textureFormat of this.textureFormats){
      let textureFile = this[textureFormat];
      // console.log(textureFile, textureFormat);
      mode += isImage(textureFile) ? 1 : 0;
      mode += isURL(textureFile) ? -1 : 0;
      // console.log(isImage(textureFile), isURL(textureFile));
    }
    // console.log(mode);
    if (mode === -3) return -1;
    if (mode === 3) return 1;
    return 0;
  }

  get isValid(){
    return this.mode !== 0;
  }

  get filesAreValid(){
    return this.mode === 1;
  }


  //Set and get parent Variant
  set parentVariant(parent){
    if ( SvgPlus.is(parent, Variant) ){
      this._parentVariant = parent;
    }else{
      this._parentVariant = null;
    }
  }
  get parentVariant(){
    return this._parentVariant;
  }


  //Set and get metallic texture format
  set metallic(metallic){
    if ( isImage(metallic) || isURL(metallic) ){
      this._metallic = metallic;
    }else{
      this._metallic = null;
    }
  }
  get metallic(){
    return this._metallic;
  }


  //Set and get albedo texture format
  set albedo(albedo){
    if ( isImage(albedo) || isURL(albedo) ){
      this._albedo = albedo;
    }else{
      this._albedo = null;
    }
  }
  get albedo(){
    return this._albedo;
  }


  //Set and get normal texture format
  set normal(normal){
    if ( isImage(normal) || isURL(normal) ){
      this._normal = normal;
    }else{
      this._normal = null;
    }
  }
  get normal(){
    return this._normal;
  }

  //Returns path to this texture
  get path(){
    if (this.parentVariant == null) return null;
    if (this.name == null) return null;

    return this.parentVariant.path + '/' + this.name;
  }
}


/*
  Textures is an object that can contain multiple texture objects.
*/
class Textures extends SvgPlus{
  constructor(json){
    super('DIV');
    this.json = json;
  }

  forEachTexture(callback){
    if (callback instanceof Function){
      for ( var texture of this.children ){
        if ( SvgPlus.is(texture, Texture) ){
          callback(texture);
        }
      }
    }
  }

  async uploadToCloud(){
    if (!this.filesAreValid){
      return false;
    }
    for ( var texture of this.children ){
      if ( SvgPlus.is(texture, Texture) ){
        let res = await texture.uploadToCloud();
        if (!res) return false;
      }
    }
    return true;
  }

  async deleteFromCloud(){
    for ( var texture of this.children ){
      if ( SvgPlus.is(texture, Texture) ){
        let res = await texture.deleteFromCloud();
        if (!res) return false;
      }
    }
    return true;
  }

  set parentVariant(parentVariant){
    this.forEachTexture((texture) => {
      texture.parentVariant = parentVariant;
    });
  }

  get mode(){
    let urls = 0;
    let files = 0;

    this.forEachTexture((texture) => {
      urls += texture.mode == -1 ? 1 : 0;
      files += texture.mode == 1 ? 1 : 0;
    });

    if (urls > 0 && files == 0) return -1;
    if (files > 0 && urls == 0) return 1;
    return 0;
  }

  get isValid(){
    return this.mode !== 0;
  }

  get filesAreValid(){
    return this.mode === 1;
  }

  set json(json){
    if (json === null || typeof json !== 'object') return;
    if (json instanceof File) return;
    this.innerHTML = "";


    for ( var key in json ){
      let texture = new Texture(json[key], key);
      if ( texture.isValid ){
        this.appendChild(texture);
      }
    }


  }

  get json(){
    if (!this.isValid) return null;

    let json = {};

    this.forEachTexture((texture) => {
      json[texture.name] = texture.json;
    });

    return json;
  }
}

export {Texture, Textures, isURL, isImage, uploadFileToCloud, contains}

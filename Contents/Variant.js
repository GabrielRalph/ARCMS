import {TrashIcon, UploadToCloudIcon, LoaderIcon} from '../Utilities/Icons.js'

function isURL(str) {
  if (typeof str !== 'string') return false;
  var pattern = new RegExp('^(https?:\\/\\/)'); // fragment locator
  return !!pattern.test(str);
}

class Variant extends SvgPlus{
  constructor(variantData, name){
    super('TR');
    this._modes = {textures: {}};
    this._textures = null;
    this._progress = null;
    this._fileDownloading = null;
    this.class = 'variant'
    this.buildElement();

    this.name = name;
    this.json = variantData;
  }

  buildElement(){
    this.nameCell = this.createChild('TD');
    this.textureCell = this.createChild('TD');

    this.trash = new TrashIcon();
    this.upload = new UploadToCloudIcon();


    this.buttons = this.createChild('TD');
    this.buttons.appendChild(this.trash);
    this.buttons.appendChild(this.upload);

    this.statusCell = this.createChild('TD');
    this.errorsCell = this.createChild('TD');

  }

  updateButtons(){
    if (this.mode === 1) {
      this.trash.hidden = false;
      this.trash.onclick = () => {
        this.parentModel.removeVariant(this);
      }
      this.upload.hidden = false;
      this.upload.onclick = () => {
        this.uploadToCloud();
      }

    }else if(this.mode === -1) {
      this.upload.hidden = true;
      this.trash.hidden = false;
      this.trash.onclick = () => {
        this.deleteFromCloud();
      }
    }
  }

  async uploadToCloud(){
    if (this.mode !== 1) return;

    for (var fileType of ['glb', 'fbx', 'thumbnail']){
      let file = this[fileType];

      this[fileType] = await this._uploadFileToCloud(file);

    }

    for (var textureName in this.textures){
      let file = this.textures[textureName];

      let url = await this._uploadFileToCloud(file);
      this.textures[textureName] = url;
    }

    if (this.mode !== -1) {
      this.errors = 'Error uploading, please refresh and try again';
      return false;
    }

    if (!(await this.setDatabase())){
      this.errors = 'Error updating database, please refresh and try again'
    }

    this.status = 'upload complete'
    this.upload.hidden = true;
    return true;
  }


  async setDatabase(){
    try{
      let res = await firebase.database().ref(this.path).set(this.json);
      return true
    }catch(e){
      console.log(e);
      return false
    }
  }


  async deleteFromCloud(){
    let ref = firebase.storage().ref()
    let childRef = ref.child(this.path)
    try{
      let files = await childRef.listAll();
      files = files.items;
      for (var file of files){
        await ref.child(file.fullPath).delete();
      }
      await firebase.database().ref(this.path).remove();

      // this.parentModel.removeVariant(this)
    }catch(e){
      this.errors = 'Error deleting from cloud, please refresh and try again'
      return null;
    }
    return true;
  }


  async _uploadFileToCloud(file){
    return new Promise((resolve, reject) => {

      try{
        var uploadTask = firebase.storage().ref().child(this.path + '/' + file.name).put(file);
        this._fileDownloading = file;
      }catch(e){
        console.log(e);
        resolve(null)
      }

      uploadTask.on('state_changed', (snapshot) => {

        // Observe state change events such as progress, pause, and resume
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progress = Math.round(progress);
        progress = Number.isNaN(progress) ? 0 : progress;
        this.status = `${Math.round(progress)}% ${file.name}`;

      }, function(error) {
        resolve(null);
      }, function() {
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          resolve(downloadURL);
        });
      });
    })
  }


  _update(){
    if (this.onupdate instanceof Function){
      this.onupdate();
    }
  }

  set errors(e){
    this.errorsCell.innerHTML = e;
  }

  set status(s){
    this.statusCell.innerHTML = s;
  }


  set progress(val){
    val = parseFloat(val);
    if (Number.isNaN(val)){
      this._progress = null;
      return;
    }
    this._progress = val;
    this.loader.progress = val;
  }


  set name(name){
    this.nameCell.innerHTML = name;
    this._name = name;
    this._update();
  }

  get name(){
    return this._name;
  }


  /*
  mode returns
    2: if files are downloading
    1: all files are File objects ready to be uploaded
    0: invalid mix of files
   -1: url links to files
  */
  get mode(){
    if (typeof this._modes === 'object'){

      let modeSum = 0;
      for (var name of ['glb', 'fbx', 'thumbnail']){
        if (this[name] instanceof File){
          modeSum++;
        }else if (isURL(this[name])){
          modeSum--;
        }
      }

      modeSum += this.texturesMode;

      if (modeSum >= 4) return 1;
      if (modeSum <= -4) return -1;
    }
    return 0;
  }


  /*
    texturesMode returns
      1: only files
      0: invalid mix
     -1: urls
  */
  get texturesMode(){
    let url = 0;
    let file = 0;
    for (var name in this.textures){
      if (this.textures[name] instanceof File) file++;
      if (isURL(this.textures[name])) url++;
    }
    if (file > 0 && url === 0) return 1;
    if (file === 0 && url > 0) return -1;
    return 0;
  }


  get isValid(){
    return this.mode !== 0;
  }


  get filesAreValid(){
    return this.mode === 1;
  }


  set fbx(fbx){
    if (fbx instanceof File && (/\.fbx$/).test(fbx.name)){
      this._fbx = fbx;
    }else if(isURL(fbx)){
      this._fbx = fbx;
    }else{
      this._fbx = null;
    }
    this._update()
  }


  get fbx(){
    return this._fbx;
  }


  set glb(glb){
    if (glb instanceof File && (/\.glb$/).test(glb.name)){
      this._glb = glb;
    }else if(isURL(glb)){
      this._glb = glb;
    }else{
      this._glb = null;
    }
    this._update();
  }


  get glb(){
    return this._glb;
  }


  set thumbnail(thumbnail){
    if (thumbnail instanceof File && (/^image/).test(thumbnail.type)){
      this._thumbnail = thumbnail;
    }else if(isURL(thumbnail)){
      this._thumbnail = thumbnail;
    }else{
      this._thumbnail = null;
    }
    this._update();
  }


  get thumbnail(){
    return this._thumbnail;
  }


  get textures(){
    return this._textures;
  }


  set textures(files){
    if (typeof files === 'object'){

      this._textures = {};
      for (var name in files){
        let file = files[name];
        let hexInParentheses = /\((([a-g]|[A-G]|\d){6})\)/

        if (hexInParentheses.test(name)){
          let color = name.match(hexInParentheses)
          this.textureCell.innerHTML += `<b style = "color: #${color[1]}">⬤ </b>`

          if( isURL(file) ){
            this._textures[name] = file;
          }else if(file instanceof File && (/^image/).test(file.type)){
            this._textures[name] = file;
          }else{
            this._textures[name] = null;
          }
        }
      }
      this._update();
    }
  }


  set json(data){
    if (data === null || typeof data !== 'object'){
      return;
    }
    for (var name of ['glb', 'fbx', 'thumbnail', 'textures']){
      if (name in data){
        this[name] = data[name];
      }else{
        this[name] = null;
      }
    }
    this.updateButtons();
  }


  get json(){

    let res =  {
      glb: this.glb,
      fbx: this.fbx,
      thumbnail: this.thumbnail,
      textures: this.textures
    }
    if (!this.isValid) return null;
    return res;
  }


  get path(){
    return this.parentModel.path + '/' + this.name
  }
}

export {Variant}

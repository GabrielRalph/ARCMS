class Variant extends SvgPlus{
  constructor(variantData, name){
    super('TR');
    this._modes = {};
    this.class = 'variant'
    this.buildElement();

    this.name = name;
    this.variantData = variantData;
  }

  buildElement(){
    this.nameCell = this.createChild('TD');
    this.textureCell = this.createChild('TD');
  }

  set name(name){
    this.nameCell.innerHTML = name;
    this._name = name;
  }

  get name(){
    return this._name;
  }

  get mode(){
    let help = (modes) => {
      let sum = 0;
      for (var key in modes){
        let mode = modes[key];
        if (key === 'textures' && typeof mode === 'object') {
          if (help(mode) > 0) sum++;
          if (help(mode) < 0) sum--;
        }else{
          sum += mode;
        }
      }
      return sum;
    }

    if (typeof this._modes === 'object'){
      let res = help(this._modes);
      if (res >= 4) return 1;
      if (res <= -4) return -1;
    }
    return 0;
  }

  get isValid(){
    return this.mode !== 0;
  }

  get filesAreValid(){
    return this.mode === 1;
  }

  set variantData(data){
    if (typeof data === 'object'){
      this.fbx = data.fbx;
      this.glb = data.glb;
      this.thumbnail = data.thumbnail;
      this.textures = data.textures;
    }else{
      this.fbx = null;
      this.glb = null;
      this.thumbnail = null;
      this.textures = null;
    }
  }

  set fbx(fbx){
    if (fbx instanceof File && (/\.fbx$/).test(fbx.name)){
      this._fbx = fbx;
      this._modes['fbx'] = 1;
    }else if(isURL(fbx)){
      this._fbx = fbx;
      this._modes['fbx'] = -1;
    }else{
      this._fbx = null;
      this._modes['fbx'] = 0;
    }
  }

  get fbx(){
    return this._fbx;
  }


  set glb(glb){
    if (glb instanceof File && (/\.glb$/).test(glb.name)){
      this._glb = glb;
      this._modes['glb'] = 1;
    }else if(isURL(glb)){
      this._glb = glb;
      this._modes['glb'] = -1;
    }else{
      this._glb = null;
      this._modes['glb'] = 0;
    }
  }
  get glb(){
    return this._glb;
  }

  set thumbnail(thumbnail){
    if (thumbnail instanceof File && (/^image/).test(thumbnail.type)){
      this._thumbnail = thumbnail;
      this._modes['thumbnail'] = 1;
    }else if(isURL(thumbnail)){
      this._thumbnail = thumbnail;
      this._modes['thumbnail'] = -1;
    }else{
      this._thumbnail = null;
      this._modes['thumbnail'] = 0;
    }
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
      this._modes['textures'] = {};
      for (var name in files){
        let file = files[name];
        let hexInParentheses = /\((([a-g]|[A-G]|\d){6})\)/

        if (hexInParentheses.test(name)){
          let color = name.match(hexInParentheses)
          this.textureCell.innerHTML += `<b style = "color: #${color[1]}">⬤ </b>`

          if( isURL(file) ){
            this._modes['textures'][name] = -1;
            this._textures[name] = file;
          }else if(file instanceof File && (/^image/).test(file.type)){
            this._textures[name] = file;
            this._modes['textures'][name] = 1;
          }else{
            this._textures[name] = null;
            this._modes['textures'][name] = 0;
          }
        }
      }
    }
  }

  get json(){
    if (!this.isValid) return null;
    let res =  {
      glb: this.glb,
      fbx: this.fbx,
      thumbnail: this.thumbnail,
    }
    for (var name in this.textures){
      res[name] = this.textures[name]
    }
    return res;
  }

  onclick(){
    this.upload()
  }

  upload(){
    let json = this.json;
    let length = Object.keys(json);
    for (var fileName in json){
      let file = json[fileName];
      let name = file.name.replace(/([^\.#$\[\]]+)(\.(glb)|(fbx){3})$/, fileName + '.$2')
      console.log(name);

    }
    // var uploadTask = storageRef.child(this.path + '/' fileName).put(file);
    //
    // // Register three observers:
    // // 1. 'state_changed' observer, called any time the state changes
    // // 2. Error observer, called on failure
    // // 3. Completion observer, called on successful completion
    // uploadTask.on('state_changed', function(snapshot){
    //
    //   // Observe state change events such as progress, pause, and resume
    //   var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //
    // }, function(error) {
    //   console.log(error);
    // }, function() {
    //
    //   // Handle successful uploads on complete
    //   // For instance, get the download URL: https://firebasestorage.googleapis.com/...
    //   uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
    //     this[path] =
    //   });
    // });
  }
}

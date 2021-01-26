import {UploadFilesIcon} from '../Utilities/Icons.js'

class AddCollection extends SvgPlus{
  constructor(){
    super('div');
    this.class = "add-collection"
    this.button = new UploadFilesIcon();
    this.appendChild(this.button)
    this.input = new AddCollectionInput();
    this.input.styles = {
      display: 'none'
    }
    this.appendChild(this.input);
    this.button.onclick = () => {
      this.input.click();
    }
  }

  set ontree(callback){
    if (callback instanceof Function){
      this.input.ontree = callback;
    }
  }

  async getFilesFromDrop(items){
    let files = []
    for (var item of items){
      let itemEntry = item.webkitGetAsEntry();
      if (item){
        let res = await this._traverseFileTree(itemEntry);
        files = files.concat(res)
      }
    }
    this.input.uploadFiles(files);
  }

  async _traverseFileTree(item, path) {
      path = path || "";
      if (item.isFile) {
        let file = await this._readFile(item);
        file['treePath'] = path + file.name;
        return [file]

      } else if (item.isDirectory) {
        let files = [];

        // Get folder contents
        var entries = await this._readEntries(item);
        for (var entry of entries){
          let res = await this._traverseFileTree(entry, path + item.name + '/');
          files = files.concat(res)
        }
        return files
      }
  }

  async _readEntries(item){
    return new Promise((resolve, reject) => {
      var dirReader = item.createReader();
      dirReader.readEntries((entries) => {
        resolve(entries)
      });
    })
  }

  async _readFile(item){
    return new Promise((resolve, reject) => {
      item.file((file) => {
        resolve(file)
      });
    })
  }
}

class AddCollectionInput extends SvgPlus{

  constructor(){
    super('input');
    this.props = {
      webkitdirectory: true,
      type: 'file'
    }
    this.resetTree();
  }

  resetTree(){
    this.fileTree = {};
  }

  uploadFiles(files = this.files){
    this.makeFileTree(files);
    if (this.ontree instanceof Function){
      this.ontree(this.fileTree)
    }
    this.value = null;
  }

  oninput(){
    this.uploadFiles();
  }



  _getPath(file){
    let path = file.webkitRelativePath || file.treePath;
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

  _insertFile(file){
    if (!(file instanceof File)) return;

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

  makeFileTree(files = this.files){
    this.resetTree();
    if ((files instanceof FileList || Array.isArray(files)) && files.length > 0){
      for (var file of files){
        this._insertFile(file);
      }
    }
  }
}

export {AddCollection}

import {SvgPlus} from 'https://www.svg.plus/3.js'

import {UploadFilesIcon} from '../Utilities/Icons.js'

class Hints extends SvgPlus{
  constructor(el, name){
    super(el);

    this.hints = this.createChild('DIV');
    this.hints.innerHTML = name
    this.hints.styles = {
      position: "absolute",
      top: "50%",
      left: "50%",
      'text-align': 'center',
      transition: '0.3s ease-in transform',
      width: "200%",
      'font-size': '0.6em'
    }

    this.styles = {
      position: "relative"
    }

    this.hintSize = 0;
  }

  set showHint(bool){
    this.hintSize = bool ? 1: 0;
  }

  get showHint(){
    return this._hintSize == 1;
  }

  set hintSize(size){
    this.hints.styles = {
      transform: `translate(-50%, -50%) scale(${size})`,
    }
    this._hintSize = size;
  }
}

class FileTreeInput extends Hints{
  constructor(){
    super('div', 'Upload Assets');

    this.styles = {cursor: 'pointer'}

    this._hover = false;

    this.class = "file-tree-input"

    this.button = new UploadFilesIcon();
    this.appendChild(this.button);

    this.styles = {
      display: "inline"
    }

    this.input = new SvgPlus('INPUT');
    this.input.props = {
      type: 'file',
      webkitdirectory: true,
      style: {display: 'none'}
    };

    this.appendChild(this.input);


    this.input.onchange = (e) => {
      let uploaderFolder = new UploadFolder();
      uploaderFolder.files = this.input.files
      this.callOnTree(uploaderFolder.fileTree);
    }

    this.onclick = () => {
      this.trigger();
    }
  }

  trigger(){
    this.input.click();
    this.hintSize = 0;
  }

  callOnTree(tree){
    if (this.ontree instanceof Function){
      this.ontree(tree);
      this.input.value = null;
    }
  }

  onmouseover(){
    this._hover = true;
    // setTimeout(() => {
    //   if (this._hover) {
        this.hintSize = 1;
    //   }
    // }, 1000)
  }
  onmouseleave(){
    this._hover = false;
    this.hintSize = 0;
  }

  async getFileTreeFromDrop(items){
    let uploaderFolder = new UploadFolder();
    uploaderFolder.files = await UploadFolder.getFilesFromDropItems(items);
    this.callOnTree(uploaderFolder.fileTree);
  }
}

class UploadFolder{
  static async getFilesFromDropItems(items){
    let files = []
    for (var item of items){
      let itemEntry = item.webkitGetAsEntry();
      if (item){
        let res = await UploadFolder.traverseFileTree(itemEntry);
        files = files.concat(res)
      }
    }
    return files;
  }

  static async traverseFileTree(item, path) {
      path = path || "";

      if (item.isFile) {

        let file = await UploadFolder.readItemFile(item);
        file['treePath'] = path + file.name;
        return [file]

      } else if (item.isDirectory) {
        let files = [];

        // Get folder contents
        var entries = await UploadFolder.readItemEntries(item);
        for (var entry of entries){
          let res = await UploadFolder.traverseFileTree(entry, path + item.name + '/');
          files = files.concat(res)
        }
        return files
      }
  }

  static async readItemEntries(item){
    return new Promise((resolve, reject) => {
      var dirReader = item.createReader();
      dirReader.readEntries((entries) => {
        resolve(entries)
      });
    })
  }

  static async readItemFile(item){
    return new Promise((resolve, reject) => {
      item.file((file) => {
        resolve(file)
      });
    })
  }

  static getPath(file){
    let path = file.webkitRelativePath || file.treePath;
    if (typeof path === 'string'){
      path = path.replace(/\./g, '_');
      path = path.split(/\//g);
    }else{
      return null;
    }
    if (path.length < 4){
      return null;
    }
    path.push(file)
    return path;
  }

  constructor(files){
    this.files = files;
  }

  async setDropBoxItems(items){
    let files = await UploadFolder.getFilesFromDropItems(items);
    this.files = files;
  }

  get fileTree(){
    return this._fileTree;
  }

  set files(files = this.files){
    this._fileTree = {};
    if ((files instanceof FileList || Array.isArray(files)) && files.length > 0){
      for (var file of files){
        this._insertFile(file);
      }
    }
  }

  _insertFile(file){
    if (!(file instanceof File)) return;

    let path = UploadFolder.getPath(file);

    if (path === null) return;
    let ref = this._fileTree;
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
}

export {FileTreeInput}

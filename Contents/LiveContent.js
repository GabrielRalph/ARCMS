import {FileTreeInput} from "./FileTreeInput.js"
import {Collection, ThumbnailLoader} from "./Collection.js"
import {Model, InfoForm} from "./Model.js"
import {Variant} from "./Variant.js"

class DropBox extends SvgPlus{
  constructor(el){
    super(el);

    //Setup to enable dropbox
    let events = ['dragenter', 'dragover', 'dragleave', 'drop']
    events.forEach(eventName => {
      this.addEventListener(eventName, (e) => {
        e.preventDefault()
        e.stopPropagation()
      }, false)
    })
  }
}

class LiveContent extends DropBox{
  constructor(content){
    super('DIV');

    this.content = content;

    this.class = "live-content";

    this.liveCollection = this.createChild('DIV');
    this.liveCollection.styles = {
      width: "65%",
      height: "100%",
      top: "0",
      left: "0",
      position: "absolute",
    }

    this.tools = this.createChild('DIV');
    this.tools.styles = {
      width: "35%",
      height: "calc(100% - 2em)",
      top: "2em",
      right: "0",
      position: "absolute",
    }

    this.upload = new FileTreeInput();
    this.upload.styles = {
      margin: "0 1em"
    }
    this.upload.ontree = (json) => {
      if (this.ontree instanceof Function){
        this.ontree(json);
      }
    }
    this.cleanDatabase();
  }

  ondrop(e){
    this.upload.getFileTreeFromDrop(e.dataTransfer.items);
  }

  select(node){
    this.removeTools();

    if ( SvgPlus.is(node, Model) ){
      this.test(node);
      this.tools.appendChild(new InfoForm(this, node))
    }else if ( SvgPlus.is(node, Collection) ){
      if (node === this.collection) return;
      this.tools.appendChild(new ThumbnailLoader(this, node))
    }else if( SvgPlus.is(node, Variant) ){
      let box = this.tools.createChild('DIV');
      box.styles = {
        position: "relative",
        width: "100%",
        height: "100%"

      }
      let modelViewer = box.createChild('model-viewer');
      modelViewer.props = {
        src: node.glb,
        'auto-rotate': true,
        'data-js-focus-visible': true,
        'camera-controls': true,
        style: {
          width: "100%",
          height: "100%"
        }
      }
    }else{
      return;
    }

    node.selected = true;

    this._oldNode = node;
  }

  removeTools(){
    if (this._oldNode && this._oldNode instanceof Element){
      this._oldNode.selected = false;
    }
    this.tools.innerHTML = "";
  }

  async test(node){
    console.log(await this.listAll(node.path));
  }

  async listAll(path){
    if (path == null) return null;
    let array = [];
    try{
      let ref = firebase.storage().ref().child(path);
      let list = await ref.listAll();

      if (list == null) return null

      for ( var prefix of list.prefixes ){
        let sublist = await this.listAll(prefix.fullPath);
        if (sublist != null) array = array.concat(sublist);
      }

      for (var item of list.items ){
        array.push(item.fullPath);
      }

      return array;
    }catch(e){
      console.log(e);
      return null
    }

  }

  async createCollection(title){

    this.collection = new Collection(null, 'contents', this);
    this.collection.class = "collection head";
    this.collection.styles = {
      direction: "rtl"
    }
    await this.collection.syncStart();

    this.liveCollection.innerHTML = "";

    let header = this.liveCollection.createChild('H1');
    header.styles = { display: 'inline'}
    this.liveCollection.appendChild(this.upload)
    header.innerHTML = title;

    this.liveCollection.appendChild(this.collection);

    this.collection.showAll()
  }

  async removeThumbnail(path){
    try{
      let ref = firebase.storage().ref()
      let files = await ref.child(path).listAll();
      files = files.items;
      for (var file of files){
        console.log(file);
        await ref.child(file.fullPath).delete();
      }
      return true;
    }catch(e){
      return false;
    }
  }

  async cleanDatabase(){
    let data = await firebase.database().ref('contents').once('value');
    data = data.val();

    if (data == null) return;

    let recursive = async (node, path) => {
      if (typeof node === 'object'){
        if ( Object.keys(node).length === 1 && ('info' in node || 'thumbnail' in node ) ){
          console.log('removing at ' + path);
          if ('thumbnail' in node){
            if ( await this.removeThumbnail(path) ){
              await firebase.database().ref(path).remove();
              console.log('thumbnail removed');
            }else{
              console.log('failed to remove thumbnail');
            }
          }else{
            await firebase.database().ref(path).remove();
          }
        }else{
          for (var key in node){
            recursive(node[key], path + '/' + key)
          }
        }
      }
    }

    recursive(data, 'contents');
  }
}

export {LiveContent}

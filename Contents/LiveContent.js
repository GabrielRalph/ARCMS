import {FileTreeInput} from "./FileTreeInput.js"
import {Collection, ThumbnailLoader} from "./Collection.js"
import {Model, InfoForm} from "./Model.js"
import {Variant} from "./Variant.js"
import {TrashIcon} from "../Utilities/Icons.js"

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

    this.trash = new TrashIcon();
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
      'overflow-y': "scroll"
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
  }

  ondrop(e){
    this.upload.getFileTreeFromDrop(e.dataTransfer.items);
  }

  select(node){
    this.removeTools();

    if ( SvgPlus.is(node, Model) ){
      this.trash.onclick = () => {node.deleteFromCloud()}
      node.appendChildToHead(this.trash);
      this.tools.appendChild(new InfoForm(this, node))
    }else if ( SvgPlus.is(node, Collection) ){
      if (node === this.collection) return;
      this.trash.onclick = () => {node.deleteFromCloud()}
      node.appendChildToHead(this.trash);
      this.tools.appendChild(new ThumbnailLoader(this, node))
    }else if( SvgPlus.is(node, Variant) ){
      node.selected = true;
      this._oldNode = node;
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
  }

  removeTools(){
    if (this._oldNode && this._oldNode instanceof Element){
      this._oldNode.selected = false;
    }
    this.tools.innerHTML = "";
  }


  async createCollection(title){

    this.collection = new Collection(null, 'contents', this);
    this.collection.class = "collection head";
    this.collection.styles = {
      direction: "rtl"
    }
    await this.collection.startSync();

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
}

export {LiveContent}

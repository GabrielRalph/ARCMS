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
      width: "70%",
      height: "100%",
      top: "0",
      left: "0",
      position: "absolute",
    }

    this.tools = this.createChild('DIV');
    this.tools.styles = {
      width: "30%",
      height: "calc(100% - 2em)",
      top: "2em",
      right: "0",
      position: "absolute",
    }

    this.upload = new FileTreeInput();
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
      this.tools.appendChild(new InfoForm(this, node))
    }else if ( SvgPlus.is(node, Collection) ){
      this.tools.appendChild(new ThumbnailLoader(this, node))
    }else if( SvgPlus.is(node, Variant) ){

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

  async createCollection(title){

    this.collection = new Collection(null, 'contents', this);
    this.collection.class = "collection head";
    this.collection.styles = {
      direction: "rtl"
    }
    this.collection.appendChildToHead(this.upload);
    await this.collection.syncStart();

    this.liveCollection.innerHTML = "";

    let header = this.liveCollection.createChild('H1');
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

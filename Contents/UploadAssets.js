import {SvgPlus} from '../3.js'

import {Collection} from './Collection.js'
import {WorkPanel} from '../Utilities/WorkPanel.js'
import {UploadToCloudIcon, TrashIcon} from '../Utilities/Icons.js'
import {FileTreeInput} from './FileTreeInput.js'


class UploadAssets extends SvgPlus{
  constructor(tree){
    super('DIV');
    this.styles = {
      width: '100%',
      height: '100%'
    }

    this.buttons = new Buttons();

    this.header = this.createChild('DIV');
    this.header.styles = {
      'margin-bottom': '1vw',
      height: '3vw'
    }

    this.headerTitle = this.header.createChild('H1');
    this.headerTitle.innerHTML = "Upload Assets"
    this.headerTitle.styles = {
      display: "inline-block",
      'margin': '0 1em 0 0',
      'font-size': '4vw',
      'line-height': '3vw',
    }

    this.done = new SvgPlus('DIV');
    this.done.class = "text-button"
    this.done.innerHTML = 'done'
    this.done.onclick = () => {
      if (this.onreturn instanceof Function){
        this.onreturn();
      }
    }
    this.header.appendChild(this.done);

    this.workPanel = new WorkPanel();
    this.workPanel.styles = {
      height: 'calc(100% - 4vw)'
    }
    this.appendChild(this.workPanel);

    this.collection = new Collection(tree, 'Assets', this);
    this.collection.class = "collection head"
    this.workPanel.appendLeftChild(this.collection);
  }

  oncollectionclick(collection){
    this.addButtons(collection)
  }

  onmodelclick(model){
    this.addButtons(model)
  }

  onvariantclick(variant){
    this.addButtons(variant)
  }

  addButtons(vlist){
    if (!vlist.filesAreValid)return;
    if (vlist.uploading) return;
    this.buttons.ontrash = () => {
      vlist.trash()
    }
    this.buttons.onupload = () => {
      this.buttons.remove();
      vlist.uploadToCloud();
    }
    vlist.appendChildToHead(this.buttons);
  }

  async ontextureclick(texture){
    this.workPanel.rightElement = await this.makeModelViewer(texture);
    this.addButtons(texture);
  }

  async makeModelViewer(texture){
    let glbURL = await texture.getURL('glb');

    let modelViewer = new SvgPlus('model-viewer');
    modelViewer.props = {
      src: glbURL,
      'auto-rotate': true,
      'data-js-focus-visible': true,
      'camera-controls': true,
      'exposure': 0.9,
      'image': '../Assets/scene3w.hdr',
      style: {
        width: "100%",
        height: "100%"
      }
    }
    return modelViewer
  }
}

class Buttons extends SvgPlus{
  constructor(){
    super('DIV');

    this.class = "buttons"

    this.upload = new UploadToCloudIcon();
    this.upload.onclick = () => {
      if (this.onupload instanceof Function){
        this.onupload();
      }
    }
    this.upload.styles = {
      'margin-right': '1vw'
    }
    this.appendChild(this.upload);


    this.trash = new TrashIcon();
    this.trash.onclick = () => {
      if (this.ontrash instanceof Function){
        this.ontrash();
      }
    }
    this.appendChild(this.trash);
  }
}

export {UploadAssets}

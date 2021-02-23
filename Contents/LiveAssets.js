import {SvgPlus} from 'https://www.svg.plus/3.js'

import {LiveCollection, CollectionInfoForm} from './Collection.js'
import {ModelInfoForm} from './Model.js'
import {VariantInfoForm} from './Variant.js'
import {WorkPanel} from '../Utilities/WorkPanel.js'
import {UploadToCloudIcon, TrashIcon} from '../Utilities/Icons.js'
import {FileTreeInput} from './FileTreeInput.js'


class LiveAssets extends SvgPlus{
  constructor(){
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
    this.headerTitle.innerHTML = "Live Assets"
    this.headerTitle.styles = {
      display: "inline-block",
      'margin': '0 1em 0 0',
      'font-size': '4vw',
      'line-height': '3vw',
    }


    this.uploader = new FileTreeInput();
    this.uploader.ontree = (tree) => {
      if (this.ontree instanceof Function){
        this.ontree(tree);
      }
    }
    this.header.appendChild(this.uploader);

    this.header.onresize = () => {
      console.log('x');
    }

    this.workPanel = new WorkPanel();
    this.workPanel.styles = {
      height: `calc(100% - 4vw)`
    }
    this.appendChild(this.workPanel);

    this.collection = new LiveCollection(null, 'Assets', this);
    this.collection.class = "collection head";

    this.sync();
  }

  async sync(){
    this.workPanel.appendLeftChild(this.collection);
    await this.collection.startSync();
    this.collection.showAll();
  }

  oncollectionclick(collection){
    this.addButtons(collection);
    this.workPanel.rightElement = new CollectionInfoForm(collection);
  }

  onmodelclick(model){
    this.addButtons(model);
    this.workPanel.rightElement = new ModelInfoForm(model);
  }

  onvariantclick(variant){
    this.addButtons(variant)
    this.workPanel.rightElement = new VariantInfoForm(variant);
  }

  addButtons(vlist){
    if (vlist === this.collection){
      this.buttons.remove();
      return;
    }
    this.buttons.ontrash = () => {
      this.buttons.remove();
      vlist.styles = {
        background:'#0001'
      }
      this.workPanel.rightElement = null;
      vlist.deleteFromCloud();
    }

    vlist.appendChildToHead(this.buttons);
  }

  async ontextureclick(texture){
    this.workPanel.rightElement = await this.makeModelViewer(texture);
    this.addButtons(texture);
  }

  async makeModelViewer(texture){
    let glbURL = await texture.getURL('glb');
    let usdzURL = await texture.getURL('usdz');

    let modelViewer = new SvgPlus('model-viewer');
    modelViewer.props = {
      src: glbURL,
      'ios-src': usdzURL,
      'ar': true,
      'auto-rotate': true,
      'data-js-focus-visible': true,
      'camera-controls': true,
      'exposure': 0.9,
      'image': '../Assets/scene.hdr',
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
    this.styles = {display: 'inline-block'}

    this.trash = new TrashIcon();
    this.trash.onclick = () => {
      if (this.ontrash instanceof Function){
        this.ontrash();
      }
    }
    this.appendChild(this.trash);
  }
}

export {LiveAssets}

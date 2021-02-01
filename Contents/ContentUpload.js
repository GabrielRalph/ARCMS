import {Collection} from "./Collection.js"
import {TrashIcon, UploadToCloudIcon, LoaderIcon} from '../Utilities/Icons.js'
import {Model} from "./Model.js"


class ContentUpload extends SvgPlus{
  constructor(tree){
    super('DIV');

    this.styles = {
      width: "100%",
      height: "100%"
    }

    let header = this.createChild('H1');
    header.styles = {
      display: 'inline',
      'margin-right': "1em"
    }
    header.innerHTML = "Upload Asset Collection";

    let collection = new Collection(tree, 'contents', this);
    collection.class = "collection head"
    let done = this.createChild('H3');
    done.styles = { cursor: "pointer" };
    done.onclick = () => {
      if (this.onreturn instanceof Function){
        this.onreturn();
      }
    }
    done.innerHTML = "done"
    this.appendChild(collection)
    collection.showAll();

    this.upload = new UploadToCloudIcon();
    this.trash = new TrashIcon();
    this._selected = null;
  }


  select(mode){
    if (SvgPlus.is(mode, Collection) || SvgPlus.is(mode, Model)){

      mode.appendChildToHead(this.upload)
      this.upload.onclick = () => {
        mode.uploadToCloud();
        this.upload.remove();
        this.trash.remove();
      }
      mode.appendChildToHead(this.trash)
      this.trash.onclick = () => {
        mode.trash();
        this.upload.remove();
        this.trash.remove();
      }
      this._selected = mode;
    }
  }
}


// class UploadButton extends SvgPlus{
//   constructor(){
//     super('DIV');
//     this.styles = {
//       this.position: "relative"
//     }
//     this.icon = new UploadToCloudIcon();
//     this.appendChild(this.icon);
//
//     this.hint = this.createReader('H3');
//     this.hint.styles = {
//       position: "absolute",
//       top: "0",
//       left: "0",
//     }
//   }
// }

export {ContentUpload}

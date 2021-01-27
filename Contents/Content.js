import {Collection} from './Collection.js'
import {AddCollection} from './AddCollection.js'
import {Windows} from '../Utilities/Windows.js'
import {TrashIcon, UploadToCloudIcon} from '../Utilities/Icons.js'

class Content extends Windows{
  constructor(){
    super('div');
    this.class = 'content'
    this.input = new AddCollection();
    // this.appendChild(this.input);
    this.props = {
      webkitdirectory: true,
    }
    let events = ['dragenter', 'dragover', 'dragleave', 'drop']
    events.forEach(eventName => {
      this.addEventListener(eventName, (e) => {
        e.preventDefault()
        e.stopPropagation()
      }, false)
    })

    this.liveCollection = new Collection(null, 'contents');
    this.liveCollection.syncStart();
    this.liveCollectionBody = this.makeCollectionBody(this.liveCollection, 'Live Assets Collection');

    this.moveTo(this.liveCollectionBody);


    let header = this.liveCollection.createChildOfHead('H3');
    header.innerHTML = 'upload assets'

    this.loader = this.liveCollection.appendChildToHead(this.input);
    this.loader.props = {fill: '#0c89ff'};


    this.input.ontree = (json) => {
      let uploads = new Collection(json, 'contents');
      if (!uploads.isValid) return;

      let done = uploads.createChildOfHead('H3');
      let uploadAll = uploads.createChildOfHead('H3');

      done.styles = {cursor: 'pointer'}
      uploadAll.styles = {cursor: 'pointer'}

      done.innerHTML = "done";
      uploadAll.innerHTML = "upload all ";
      uploadAll.appendChild(new UploadToCloudIcon())

      uploadAll.onclick = async () => {
        // this.uploadAll();
        await uploads.uploadAll();
        this.moveTo(this.liveCollectionBody, true)
      }

      done.onclick = () => {
        this.moveTo(this.liveCollectionBody, true)
      }

      let uploadsBody = this.makeCollectionBody(uploads, 'Upload Assets Collection');
      this.moveTo(uploadsBody)
      uploads.showAll();
      // console.log(this.databaseCollection);
    }
  }

  makeCollectionBody(collection, name){
    let body = new SvgPlus('DIV');
    collection.class = "collection head";
    let head = body.createChild('H1');
    head.innerHTML = name;
    body.appendChild(collection)
    return body;
  }





  ondrop(e){
    e.preventDefault();
    var items = e.dataTransfer.items;
    this.input.getFilesFromDrop(items)
  }
}

export {Content}

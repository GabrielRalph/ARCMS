import {Collection} from './Collection.js'
import {AddCollection} from './AddCollection.js'
import {Windows} from '../Utilities/Windows.js'

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


    this.databaseCollection = new Collection();
    this.databaseCollection.name = "contents"
    this.moveTo(this.databaseCollection);

    let header = this.databaseCollection.createChildOfHead('H3');
    header.innerHTML = 'upload assets'
    this.loader = this.databaseCollection.appendChildToHead(this.input);
    this.loader.props = {fill: '#0c89ff'}


      this.syncFire();

    this.input.ontree = (json) => {
      let uploads = new Collection(json);
      uploads.name = 'contents'
      this.moveTo(uploads)
      uploads.showAll();
      // console.log(this.databaseCollection);
    }
  }

  async syncFire(){

    try{
      firebase.database().ref('contents').on('value', (sc) => {
        this.databaseCollection.json = sc.val();
        this.databaseCollection.showAll()
      });
    }catch(e){
      console.log(e);
    }
  }



  ondrop(e){
    e.preventDefault();
    var items = e.dataTransfer.items;
    this.input.getFilesFromDrop(items)
  }
}

export {Content}

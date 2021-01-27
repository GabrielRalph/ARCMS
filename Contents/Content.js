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


    this.additions = new Collection();
    this.additions.name = "contents"
    this.moveTo(this.additions);

    this.loader = this.additions.appendChildToHead(this.input);
    this.loader.props = {fill: '#0c89ff'}


      this.syncFire();

    this.input.ontree = (json) => {
      let uploads = new Collection(json);
      uploads.name = 'contents'
      this.moveTo(uploads)
      uploads.showAll();
      // console.log(this.additions);
    }
  }

  async syncFire(){

    try{
      firebase.database().ref('contents').on('value', (sc) => {
        this.additions.json = sc.val();
        this.additions.showAll()
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

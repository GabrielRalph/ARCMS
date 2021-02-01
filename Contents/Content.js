import {Windows} from '../Utilities/Windows.js'

import {LiveContent} from './LiveContent.js'
import {ContentUpload} from './ContentUpload.js'

class Content extends Windows{
  constructor(){
    super();
    this.class = "content";
    this.styles = {
      width: "100%",
      height: "100%"
    }
    this.createLiveCollection();
  }

  async createLiveCollection(){
    this.liveContent = new LiveContent();
    this.liveContent.ontree = (tree) => { this.ontree(tree) };
    await this.liveContent.createCollection("Live Asset Collection");
    this.center = this.liveContent;
  }

  ontree(tree){
    let contentUpload = new ContentUpload(tree);
    this.moveTo(contentUpload);
    contentUpload.onreturn = () => {
      this.moveTo(this.liveContent, true);
    }
  }
}

export {Content}

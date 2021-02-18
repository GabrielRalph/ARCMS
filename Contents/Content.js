import {Windows} from '../Utilities/Windows.js'

import {UploadAssets} from './UploadAssets.js'
import {LiveAssets} from './LiveAssets.js'

class Content extends Windows{
  constructor(){
    super();
    this.class = "content";
    this.styles = {
      width: "100%",
      height: "100%"
    }
    this.createLiveAssets();
  }

  async createLiveAssets(){
    this.liveAssets = new LiveAssets();
    this.liveAssets.ontree = (tree) => { this.ontree(tree) };
    this.center = this.liveAssets;
    // await this.liveAssets.startSync();
  }

  ontree(tree){
    let uploadAssets = new UploadAssets(tree);
    if (!uploadAssets.collection.isValid){
      alert('The collection is invalid');
      return;
    }
    this.moveTo(uploadAssets);
    uploadAssets.onreturn = () => {
      this.liveAssets.workPanel.rightElement = null;
      this.moveTo(this.liveAssets, true);
    }
  }
}

export {Content}

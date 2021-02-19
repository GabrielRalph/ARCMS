import {loadURL, isGLB} from './Utilities/Functions.js'

class Viewer extends SvgPlus{
  constructor(){
    super('DIV');

    this.class = 'viewer'

    this.styles = {
      width: '100%',
      height: '100%',
    }

    this.header = this.createChild('DIV');
    this.header.innerHTML = "Model Viewer"
    this.header.styles = {
      width: '100%',
      height: '4vw',
    }

    this.modelFrame = this.createChild('DIV');
    this.modelFrame.styles = {
      width: 'calc(100vw - 2*var(--margin))',
      height: 'calc((100vw - 2*var(--margin)) * 0.62)',
      background: '#f8f5f0'
    }

    this.x = 0;
  }

  get canvas(){
    return document.getElementById('webgl-canvas');
  }

  async onclick(){
    if (!this.modelViewer){
      if (! (await this.getModel()) ){
        return;
      }
    }
    await this.getImage();
  }

  async getModel(){
    return new Promise((resolve, reject) => {
      let input = new SvgPlus('INPUT');
      input.props = {
        type: 'file'
      }
      input.onchange = async () => {
        let file = input.files[0]
        if ( isGLB(file) ){
          await this.makeModelViewer(file);
          resolve(true);
        }else{
          resolve(false);
        }
      }

      input.click()
    })
  }

  async getImage(){
    if (!this.modelViewer) return;
    let url = URL.createObjectURL(await this.modelViewer.toBlob());
    console.log(url);
    let link = document.createElement('a');
    link.href = url;
    link.innerHTML = "download";
    link.download = "thumbnail"
    link.click();
  }

  async makeModelViewer(file){
    let glbURL = await loadURL(file);

    this.modelViewer = new SvgPlus('model-viewer');
    this.modelViewer.props = {
      src: glbURL,
      'data-js-focus-visible': true,
      'orientation': '0deg 0deg 25deg',
      'field-of-view': '30deg',
      style: {
        width: "100%",
        height: "100%"
      }
    }
    this.modelFrame.appendChild(this.modelViewer);
    return new Promise((resolve, reject) => {
      this.modelViewer.onload = () => {
        setTimeout(() => {resolve(true)}, 100)
      }
    })
  }
}

export {Viewer}

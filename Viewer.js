import {SvgPlus} from 'https://www.svg.plus/3.js'

import {loadURL, isGLB} from './Utilities/Functions.js'

class Viewer extends SvgPlus{
  constructor(){
    super('DIV');

    this.class = 'viewer'

    this.metersPerPixel = 0;
    this.panX = 0;
    this.panY = 0;
    this._zoom = 30;


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
      background: 'white'
    }

    this.modelFrame.onmousedown = () => {
      this.mousedown = true;
    }

    this.modelFrame.onmouseup = () => {
      this.mousedown = false;
    }

    this.modelFrame.onmouseleave = () => {
      this.mousedown = false;
    }

    this.modelFrame.onmousemove = (e) => {
      if (this.mousedown){
        this.movePan(e.movementX, e.movementY);
      }
    }

    this.modelFrame.onwheel = (e) => {
      this.zoom += e.deltaY/5;
    }

    this.x = 0;
  }

  set mousedown(val){
    this._mousedown = val;
    if (this.modelViewer){
      this.modelViewer.styles = {
        cursor: val ? 'grabbing' : 'grab'
      }
    }
  }

  get mousedown(){
    return !!this._mousedown;
  }


  get canvas(){
    return document.getElementById('webgl-canvas');
  }

  async onclick(){
    if (!this.modelViewer){
      if (! (await this.getModel()) ){
        return;
      }
      this.addSaveButton();
      this.startPan();
    }
  }

  addSaveButton(){
    let save = this.header.createChild('div');
    save.innerHTML = "save";
    save.class = 'text-button';
    save.styles = {'margin-left': '1em'}
    save.onclick = () => {
      this.downloadImage();
    }
  }

  get zoom(){
    return this._zoom;
  }

  set zoom(zoom){
    if (this.modelViewer){
      this._zoom = zoom;
      this.modelViewer.props = {
        'field-of-view': `${zoom}deg`
      }
    }
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

  async downloadImage(){
    if (!this.modelViewer) return;
    let url = URL.createObjectURL(await this.modelViewer.toBlob());
    console.log(url);
    let link = document.createElement('a');
    link.href = url;
    link.innerHTML = "download";
    link.download = "thumbnail"
    link.click();
  }

  startPan(){
    if (!this.modelViewer) return;

    this.modelViewer.styles = {cursor: 'grab'}
    this.panstarted = true;

    const orbit = this.modelViewer.getCameraOrbit();
    const {theta, phi, radius} = orbit;
    const psi = theta - this.modelViewer.turntableRotation;
    this.metersPerPixel = 0.75 * radius / this.modelViewer.getBoundingClientRect().height;

    this.panX = [-Math.cos(psi), 0, Math.sin(psi)];
    this.panY = [
      -Math.cos(phi) * Math.sin(psi),
      Math.sin(phi),
      -Math.cos(phi) * Math.cos(psi)
    ];
  };

  movePan(dx, dy){
    if (!this.panstarted) return;

    dx *= this.metersPerPixel;
    dy *= this.metersPerPixel;

    const target = this.modelViewer.getCameraTarget();
    target.x += dx * this.panX[0] + dy * this.panY[0];
    target.y += dx * this.panX[1] + dy * this.panY[1];
    target.z += dx * this.panX[2] + dy * this.panY[2];
    this.modelViewer.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;

  };


  async makeModelViewer(file){
    let glbURL = await loadURL(file);

    this.modelViewer = new SvgPlus('model-viewer');
    this.modelViewer.props = {
      src: glbURL,
      'data-js-focus-visible': true,
      'orientation': '0deg 0deg 25deg',
      'exposure': 0.9,
      'field-of-view': '30deg',
      'image': '../Assets/scene.hdr',
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

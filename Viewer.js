import {SvgPlus} from '../SvgPlus/4.js'

import {loadURL, isGLB, uploadFileToCloud} from './Utilities/Functions.js'

class Viewer extends SvgPlus{
  constructor(){
    super('DIV');

    this.class = 'viewer'

    this.modelViewerProps = {
      'orientation': '0deg 0deg 25deg',
      'exposure': 0.9,
      'field-of-view': '30deg',
      'shadow-intensity' : 0.4,
      'shadow-softness': 1.2,
    }

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
      background: 'white'
    }
    this.sizeMode = "large";

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

    this.buttonsFrame = this.createChild('DIV');
    this.buttonsFrame.props = {
      display: 'inline-block'
    }

    this.x = 0;
  }

  set sizeMode(mode){
    if (mode == 'small'){
      this.modelFrame.styles = {
        width: '300px',
        height: '200px',
      }
      this._sizeMode = "small";
    }else if(mode == 'large'){
      this.modelFrame.styles = {
        width: '600px',
        height: '400px',
      }
      this._sizeMode = "large";
    }
  }

  get sizeMode(){
    return this._sizeMode;
  }

  toggleSizeMode(){
    if (this._sizeMode == 'small'){
      this.sizeMode = 'large';
    }else{
      this.sizeMode = 'small';
    }
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

  setModelProp(name, value){
    if (!this.modelViewer) return;
    if (typeof name !== 'string') return;
    this.modelViewerProps[name] = value;

    this.modelViewer.props = this.modelViewerProps;
  }

  makeButtons(){

    let table = new SvgPlus('TABLE');
    let tbody = table.createChild('TBODY');

    // let sizeMode = tbody.createChild('TR').createChild('TD');
    // sizeMode.innerHTML = this.sizeMode;
    // sizeMode.onclick = () => {
    //   this.toggleSizeMode();
    //   sizeMode.innerHTML = this.sizeMode;
    // }

    for (let name in this.modelViewerProps){
      let value = this.modelViewerProps[name];

      let row = tbody.createChild('TR');
      row.createChild('TD').innerHTML = name;
      let inputCell = row.createChild('TD');

      let inputs = [];

      let getValue = () => {
        let value = "";
        for (let child of inputs){
          value += (value === "" ? "" : " ") + child.value + child.mtype;
        }
        return value;
      }

      if (typeof value === 'number'){
        let input = inputCell.createChild('INPUT');
        input.mtype = '';
        input.props = {
          type: 'number',
          value: value,
        }
        inputs.push(input);
        input.onkeyup = () => {this.setModelProp(name, getValue())}

      }else if(typeof value === 'string'){
        let split = value.split(' ');
        for (let div of split){
          let box = inputCell.createChild('SPAN');
          let input = box.createChild('INPUT');

          let number = parseFloat(div);
          inputs.push(input);

          if (name == 'field-of-view'){
            this.zoom_el = input;
          }
          input.props = {
            type: 'number',
            value: number,
          }

          let m = div.replace(/(\d|\.)*/, '');
          input.mtype = m;
          box.createChild('h6').innerHTML = m;

          input.onkeyup = () => {
            this.setModelProp(name, getValue());
          }
        }
      }

    }

    let env = tbody.createChild('TR').createChild('TD');
    env.innerHTML = "environment-image";
    env.styles = {cursor: 'pointer'};
    env.onclick = () => {
      let input = new SvgPlus('INPUT');
      input.props = {
        type: 'file',
        accept: '.hdr',
      }
      input.onchange = async () => {
        let scene = input.files[0];
        if (scene instanceof File){
          let url = await uploadFileToCloud(scene, '', (p) => {
            env.innerHTML = `environment-image ${Math.round(p)}%`;
          }, 'scene.hdr');
          this.modelViewer.setAttribute('environment-image', url);
        }
      }
      input.click();
    }

    this.buttonsFrame.innerHTML = "";
    this.buttonsFrame.appendChild(table);
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
      this.zoom_el.value = Math.round(zoom * 100)/100;
      this.modelViewer.props = {
        'field-of-view': `${zoom}deg`
      }
    }
  }

  async getModel(){
    return new Promise((resolve, reject) => {
      let input = new SvgPlus('INPUT');
      input.props = {
        type: 'file',
        accept: '.glb'
      }
      input.onchange = async () => {
        let file = input.files[0]
        if ( isGLB(file) ){
          await this.makeModelViewer(file);
          this.makeButtons();
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
      'environment-image': './Assets/scene3.hdr',
      'data-js-focus-visible': true,
      style: {
        width: "100%",
        height: "100%"
      }
    }
    this.modelViewer.props = this.modelViewerProps;

    this.modelFrame.appendChild(this.modelViewer);
    return new Promise((resolve, reject) => {
      this.modelViewer.onload = () => {
        setTimeout(() => {resolve(true)}, 100)
      }
    })
  }
}

export {Viewer}

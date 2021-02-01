class Controls extends SvgPlus{
  constructor(){
    super('div');
    this.class = 'controls'
    this.image = this.createChild("IMG");
    this.buttonBox = this.createChild("DIV");
  }

  set buttons(obj){
    if (obj === null || typeof obj !== 'object') return;
    this._buttons = {};
    for (var buttonName in obj){
      let onclick = obj[buttonName];

      if (onclick instanceof Function){
        this._buttons[buttonName] = onclick;
      }
    }

    this.updateButtons();
  }

  get buttons(){
    return this._buttons;
  }

  set imgSrc(src){
    if (typeof src === 'string'){
      this.image.props = {src: src};
    }
  }


  updateButtons(){
    this.buttonBox.innerHTML = "";
    for (var buttonName in this.buttons){
      let button = this.buttonBox.createChild("H1");
      button.innerHTML = buttonName;
      button.onclick = this.buttons[buttonName];
    }
  }
}

export {Controls}

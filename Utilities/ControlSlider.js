class Controls extends SvgPlus{
  constructor(){
    super('div');
    this.buttonPannel = this.createChild('DIV').createChild('DIV');
    this._image = this.createChild('IMG');
    this._init = true;
    this.image.onclick = () => {this.shown = !this.shown}

    this.class = 'controls'
    this._shown = false;
    this.xPos = 100;

    this.buildElement();
  }

  set buttons(buttons){
    this._buttons = {}
    if (typeof buttons !== 'object' || buttons == null){
      return;
    }
    for (var key in buttons){
      let onclick = buttons[key];
      if (onclick instanceof Function){
        this._buttons[key] = onclick;
      }
    }
    if (this._init){
      this._init = false;
      this.buildElement();
    }
  }

  get buttons(){
    return this._buttons;
  }

  buildElement(){
    this.buttonPannel.innerHTML = "";
    for (var buttonName in this.buttons){
      let button = this.buttonPannel.createChild('div');
      button.class = "ctr-btn";
      button.onclick = this.buttons[buttonName];
      button.innerHTML = buttonName;
    }
  }

  set shown(val){
    if (val === true && this._shown === false){
      this.waveTransistion(val);
    }else if(val === false && this._shown === true){
      this.waveTransistion(val);
    }
  }
  get shown(){
    return this._shown;
  }

  set xPos(x){
    x = parseFloat(x);

    let transform = 'translate(0, 0)'
    this._xPos = 0;
    if (x >= 0 && x <= 100){
      this._xPos = x;
      transform = `translate(${x}%, 0%)`
    }
    this.buttonPannel.styles = {transform: transform}
  }

  get xPos(){
    return this._xPos;
  }

  waveTransistion(shown, duration = 400){
    this._shown = null;
    shown = !!shown;
    let theta = 0;
    let done = false;
    let startTime = 0;

    let next = (time) => {
      theta = Math.PI * (time - startTime) / duration;
      if (theta > Math.PI) {
        theta = Math.PI;
        done = true;
      }

      let x = (Math.cos(theta) + 1) * 50;
      this.xPos = shown ? x : 100 - x;

      if (done){
        this._shown = shown;
        if (!shown){
          this.buildElement();
        }
      }else{
        window.requestAnimationFrame(next)
      }
    }

    window.requestAnimationFrame((time) => {
      startTime = time;
      window.requestAnimationFrame(next)
    })
  }


  set image(val){
    this._image.props = {
      src: val
    }
  }

  get image(){
    return this._image;
  }
}

export {Controls}

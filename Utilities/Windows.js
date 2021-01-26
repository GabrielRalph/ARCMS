class Windows extends SvgPlus{
  constructor(){
    super('div');

    this.class = 'windows'


    this.windowPannel = this.createChild('div');
    this.windowPannel.styles = {
      position: 'relative'
    }

    this._center = new Frame();
    this._left = new Frame();
    this._right = new Frame();

    this.clear();

    this.windowPannel.appendChild(this.left);
    this.windowPannel.appendChild(this.center);
    this.windowPannel.appendChild(this.right);
  }

  get center(){
    return this._center;
  }

  set center(val){
    this._center.window = val;
  }

  get left(){
    return this._left;
  }

  set left(val){
    this._left.window = val;
  }

  get right(){
    return this._right;
  }

  set right(val){
    this._right.window = val;
  }

  set xPos(x){
    this.center.xPos = x;
    this.left.xPos = x - 100;
    this.right.xPos = x + 100;
  }

  async moveTo(element, direction){
    if (element instanceof Element){
      await this.waveTransistion(element, direction);
    }
  }


  clear(){
    this.center = null;
    this.left = null;
    this.right = null;
  }

   async waveTransistion(element, direction, duration = 400){
    return new Promise((resolve, reject) => {
      let done = false;
      let theta = 0;
      let startTime = 0;

      let nextFrame = (time) => {
        theta = (time - startTime) * Math.PI / duration;
        if (theta > Math.PI){
          theta = Math.P1;
          done = true;
        }

        let x = (100 - (Math.cos(theta) + 1) * 50);
        x = direction ? x : - x;
        this.xPos = x;

        if (!done){

          window.requestAnimationFrame(nextFrame)
        }else{
          this.center = element;
          this.xPos = 0;
          resolve(true)
        }
      }

      window.requestAnimationFrame((time) => {
        startTime = time;
        if (direction) {
          this.left = element;
        }else{
          this.right = element;
        }
        window.requestAnimationFrame(nextFrame)
      })
    })
  }
}

class Frame extends SvgPlus{
  constructor(){
    super('div');
    this.class = "window"
    this.styles = {
      inset: 0,
      position: 'absolute',
    }
  }

  set xPos(val){
    this.styles = {
      transform: `translate(${val}%, 0)`
    }
  }

  set window(el){
    this.innerHTML = "";
    if (el instanceof Element){
      this.appendChild(el)
    }
  }
}
export {Windows}

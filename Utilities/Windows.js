import {SvgPlus} from '../3.js'

class Windows extends SvgPlus{
  constructor(){
    super('div');

    this.class = 'windows'


    this.windowPannel = this.createChild('div');
    this.windowPannel.styles = {
      position: 'relative',
      width: "100%",
      height: "100%"
    }

    this._center = new Frame();
    this._left = new Frame();
    this._right = new Frame();

    this.clear();

    this.windowPannel.appendChild(this.center);
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
    this.scrollTo(0, 0);
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
          // if (this.windowPannel.contains(this.left)) this.windowPannel.remove(this.left);
          // if (this.windowPannel.contains(this.right)) this.windowPannel.remove(this.right);
          resolve(true)
        }
      }

      window.requestAnimationFrame((time) => {
        startTime = time;
        if (direction) {
          this.windowPannel.appendChild(this.left);
          this.left = element;

        }else{
          this.windowPannel.appendChild(this.right);
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
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
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

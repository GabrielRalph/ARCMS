import {SvgPlus, SvgPath, Vector} from '../SvgPlus/svg-path.js'


class AnimationSvg extends SvgPlus{

  get drawing(){
    return !!this._drawing;
  }

  get time(){
    return this._time - this._startTime;
  }

  resetClock(){
    this._startTime = this._time;
  }

  drawAll(){
    let recurse = (node) => {
      if (!(node instanceof Element)) return;
      if (node.draw instanceof Function) node.draw(this.time);
      for (var child of node.children){
        recurse(child)
      }
    }
    recurse(this)
  }

  async fadeIn(){
    return;
  }
  async fadeOut(){
    return;
  }

  async start(){
    let init = true;
    let next = (dt) => {
      this._time = dt;
      if (init){
        this.resetClock();
        init = false;
      }
      this.drawAll();
      if (this.drawing){
        window.requestAnimationFrame(next)
      }
    }
    this._drawing = true;
    window.requestAnimationFrame(next);
    await this.fadeIn();
  }

  async stop(){
    await this.fadeOut();
    this._drawing = false;
  }
}

class MCMLoader extends AnimationSvg {
  constructor(){
    super('DIV');
    this.class = "mcm-loader"

    this.svg = this.createChild('svg');
    this.svg.props = {
      viewBox:"0 0 811.3 370.6"
    }

    this.m1 = this.svg.createChild('polygon');
    this.m1.props = {
      points: "295.7,247.1 337.5,247.1 314.6,123.5 270.6,123.5 252,174.8 235.6,123.5 191.7,123.5 168.8,247.1 210.5,247.1 220.9,189.9 239.2,247.1 267,247.1 285.4,189.9 "
    }
    this.m1.center = new Vector(253, 183);

    this.c = this.svg.createChild('path');
    this.c.props ={
      d:"M419.1,249.7c10.5,0,20-2.3,28.2-6.9v-41.9c-6.2,5.7-14.9,9.5-24.9,9.5c-15.4,0-26.5-10.7-26.5-25.1s11.1-25.1,26.5-25.1c10,0,18.7,3.8,24.9,9.5v-42.1c-8.2-4.1-17.7-6.7-28.2-6.7c-37.9,0-65.5,27.5-65.5,64.4S381.2,249.7,419.1,249.7",
    }
    this.c.center = new Vector(419, 183);

    this.m2 = this.svg.createChild('polygon');
    this.m2.props = {
      points: "596.4,247.1 638.1,247.1 615.2,123.5 571.3,123.5 552.6,174.8 536.2,123.5 492.3,123.5 469.4,247.1 511.2,247.1 521.5,189.9 539.8,247.1 567.7,247.1 586,189.9 ",
    }
    this.m2.center = new Vector(553, 183);

    this.letters = [];
    this.letters.push(this.m1);
    this.letters.push(this.c);
    this.letters.push(this.m2);

    this.svg.styles = {
      position: 'fixed',
      width: '40vw',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  async fadeOut(){
    return new Promise((resolve, reject) => {
      this.styles = {
        transition: '0.2s ease-in opacity',
        opacity: '0'
      }
      setTimeout(() => {
        this.styles = {
          display: 'none'
        }
        resolve(true)
      }, 200)
    })
  }

  async fadeIn(){
    return new Promise((resolve, reject) => {
      this.styles = {
        transition: '0.2s ease-in opacity',
        display: 'block',
        opacity: '1'
      }
      setTimeout(() => {
        resolve(true)
      }, 200)
    })
  }

  scaleFromCenter(scale, element){
    let bBox = element.getBBox();
    let size = new Vector(bBox, {x: "width", y: "height"});
    let pos = new Vector(bBox);

    let center = pos.add(size.div(2));
    let adjustment = center.sub(center.mul(scale));

    element.props = {
      transform: `translate(${adjustment.x} ${adjustment.y}) scale(${scale})`
    }
  }

  draw(dt){
    let theta = dt/500;
    for (var letter of this.letters){

      this.scaleFromCenter(1 + 0.1*Math.cos(theta), letter);

      theta += Math.PI/4
    }
  }
}

export {MCMLoader}

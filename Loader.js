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

class PhiLoader extends AnimationSvg {
  build(){
    this.innerHTML = `<svg id = "logo-loader" viewBox="0 0 500 500">
      <style type="text/css">
      .st0{fill:black;stroke-miterlimit:10;}
      .lightning{
        stroke: #ffe200;
        filter: url(#glow);
        fill: none;
        stroke-width: 2;
      }
      </style>
      <defs>
        <filter id="glow">
          <fegaussianblur class="blur" result="coloredBlur" stddeviation="4"></fegaussianblur>
          <femerge>
            <femergenode in="coloredBlur"></femergenode>
            <femergenode in="coloredBlur"></femergenode>
            <femergenode in="coloredBlur"></femergenode>
            <femergenode in="SourceGraphic"></femergenode>
          </femerge>
        </filter>
      </defs>
    </svg>`

    this.svg = this.getElementsByTagName('svg')[0];
    this.path = new SvgPath('path');
    this.path.d_string = "M269.7,201.1c1.3-5.5,4.6-11.5,20.6-11.5c-0.3,0,0-9.6,0-9.6l-61.4,0.7l0-0.8v9.6c15.1,0,22.8,0.8,21.8,11.6c-30,3.8-56.7,24.2-61.9,48.9c-5.2,24.6,12.6,45,40.8,48.8c-1.2,4.5-4.2,11.8-19.9,11.8l-0.1,9.3l55.8,0.1v-9.6c-8,0-19.4-0.3-17.1-10.7l0.2-0.7c30.2-3.5,57.4-24.1,62.6-49C316.4,225.2,298.3,204.7,269.7,201.1z M248,213.4l-9.2,43.5l-7.4,33.6c-17.4-4.4-27.5-20.9-23.3-40.5c4.2-19.7,21.5-36.2,40.8-40.6L248,213.4z M291.8,250c-4.3,20-21.9,36.7-41.6,40.7l0.7-3.2L260,245l4.9-22.6l1.5-6.9c0,0,0.7-2.5,1.5-6.1C285.6,213.6,296,230.2,291.8,250z";
    this.svg.appendChild(this.path);
    this.lightning = new LightningPath(this.path, 15);
    this.lightning.restart = () => {
      this.resetClock();
    }
    this.svg.appendChild(this.lightning)
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
}

class LightningPath extends SvgPath{
  constructor(path, tail){
    super('path');
    this.path = path
    this.tail = tail;
    this.lastDl = null;
    this.lastPoint = null;
    this.props = {
      class: "lightning"
    }
  }
  set path(path){
    if (path instanceof SVGPathElement) {
      this._path = path;
      this._pathLength = this.path.getTotalLength();
    }else{
      this._path = null;
    }
  }

  get path(){
    return this._path;
  }


  get length(){
    return this._pathLength;
  }


  draw(time){
    let dl = time/5;
    if (dl < this.length){


      if (this.d.length > this.tail){
        this.dequeue();
        this.d.start.cmd_type = 'M'
      }

      let point = new Vector(this.path.getPointAtLength(dl));
      let point2 = point;

      if (this.lastPoint instanceof Vector && this.lastDl != null){
        let ddl = dl - this.lastDl;
        let dldp = this.lastPoint.dist(point)/ddl;

        if (dldp > 2){
          this.restart();
          return;
        }

        let tangent = point.sub(this.lastPoint).dir();
        let normal = tangent.rotate(Math.PI/2);
        let projection = normal.mul((Math.random() - 0.5)*12);

        point2 = point.add(projection);
      }


      if(this.d.length == 0){
        this.M(point2)
      }else{
        this.L(point2)
      }
      this.lastPoint = point;
      this.lastDl = dl;
    }
  }
}

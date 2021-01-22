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
        stroke: orange;
        filter: url(#glow);
        fill: none;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .phi{
        /* fill: #e6770d; */
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
      <path class="phi" d="M269.7,201.1c1.3-5.5,4.01-11.21,20.01-11.21l0.59-9.89l-61.4,0.7v8.8c15.1,0,22.8,0.8,21.8,11.6c-30,3.8-56.7,24.2-61.9,48.9c-5.2,24.6,12.6,45,40.8,48.8c-1.2,4.5-4.2,11.8-19.9,11.8l-0.1,9.3l55.8,0.1v-9.6c-8,0-19.4-0.3-17.1-10.7l0.2-0.7c30.2-3.5,57.4-24.1,62.6-49C316.4,225.2,298.3,204.7,269.7,201.1z M248,213.4l-9.2,43.5l-7.4,33.6c-17.4-4.4-27.5-20.9-23.3-40.5c4.2-19.7,21.5-36.2,40.8-40.6L248,213.4z M291.8,250c-4.3,20-21.9,36.7-41.6,40.7l0.7-3.2L260,245l4.9-22.6l1.5-6.9c0,0,0.7-2.5,1.5-6.1C285.6,213.6,296,230.2,291.8,250z"/>
    </svg>
    `

    this.svg = new SvgPlus(this.getElementsByTagName('svg')[0]);
    this.svg.styles = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
    this.path = new SvgPath('path');
    this.path.d_string = "M213.15,315.13L213.15,315.13c0.01-0.65,0.51-1.18,1.16-1.25c10.28-1.03,16.41-5.69,18.67-14.18c0.26-0.97,0.09-2.01-0.47-2.84c-0.56-0.84-1.45-1.39-2.44-1.53c-14.28-1.92-25.86-8.27-32.63-17.86c-5.47-7.75-7.27-17-5.21-26.75c4.76-22.63,30.03-42.45,58.79-46.14c1.71-0.22,3.04-1.62,3.18-3.34c0.38-4.48-0.53-7.86-2.79-10.34c-3.55-3.89-9.76-6.6-18.08-6.76l0,0l51.97-0.59l0,0c-11.11,0.95-16.97,8.11-19.01,16.74c-0.23,0.97-0.04,1.98,0.53,2.8s1.45,1.35,2.44,1.48c14.52,1.83,26.3,8.16,33.18,17.84c5.52,7.77,7.33,17.06,5.24,26.85c-4.8,22.98-30.38,42.85-59.53,46.25c-1.45,0.17-2.64,1.22-3.04,2.62l-0.17,0.6c-0.02,0.07-0.04,0.14-0.05,0.21c-0.87,3.92-0.27,7.2,1.77,9.74c3.02,3.76,8.28,4.83,13.96,5.12c0.72,0.04,1.29,0.62,1.29,1.34l0,0c0,0.74-0.6,1.35-1.35,1.35l-46.14-0.08C213.71,316.41,213.14,315.83,213.15,315.13z"
    this.lightning = new LightningPath(this.path, 30);
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
    let dl = time/10;
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
        point2 = point.add(normal.mul(5*Math.sin(dl*22.22*Math.PI/this.length)));
      }


      if(this.d.length == 0){
        this.M(point2)
      }else{
        this.L(point2)
      }
      this.lastPoint = point;
      this.lastDl = dl;
    }else{
      this.restart();
    }
  }
}

class LightingLoader extends SvgPlus{
  build(){
    this.box = this.parentNode;
    this.path = this.getElementsByTagName('path')[0];
    this.length = this.path.getTotalLength();
    this.loadPath = new SvgPath('path');
    this.loadPath.props = {
      class: 'lighting'
    }
    this.appendChild(this.loadPath);
    this.start();
  }

  get drawing(){
    return this._drawing;
  }
  get time(){
    return this._time - this._startTime;
  }

  set opacity(val){
    this.box.style.setProperty('opacity', val);
    this._opacity = val;
  }
  get opacity(){
    return this._opacity;
  }



  restart(){
    this._startTime = this._time;
  }
  async stop(){
    await this.fadeOut();
    this.box.style.setProperty('display', 'none');
    this._drawing = false;
  }
  start(){
    this.tail = 15;
    this.opacity = 1;
    this.lastPoint = null;
    this.lastDl = null;
    this._time = null;
    this._startTime = null;
    this._drawing = true;

    let next = (time) => {
      this._time = time;
      if (this._startTime== null) this._startTime = time;

      this.draw();
      if (this.drawing){
        window.requestAnimationFrame(next);
      }
    }
    window.requestAnimationFrame(next);
  }

  async fadeOut(){
    return new Promise((resolve, reject) => {
      let i = 1;
      let next = () => {
        i -= 0.05;
        if (i < 0) {
          this.opacity = 0;
          resolve(true);
        }else{
          this.opacity = i;
          window.requestAnimationFrame(next)
        }
      }
      window.requestAnimationFrame(next)
    })
  }

  draw(){

    let dl = this.time/5;
    if (dl < this.length){

      if (this.loadPath.d.length > this.tail){
        this.loadPath.dequeue();
        this.loadPath.d.start.cmd_type = 'M'
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


      if(this.loadPath.d.length == 0){
        this.loadPath.M(point2)
      }else{
        this.loadPath.L(point2)
      }
      this.lastPoint = point;
      this.lastDl = dl;
    }
  }
}

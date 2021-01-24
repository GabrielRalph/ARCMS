class Icon extends SvgPlus{
  constructor(innerHTML){
    super('svg');
    this.props = {
      viewBox: '0 0 100 100',
      height: '1em',
      styles: {
        float: 'right',
        margin: '0.2em 0'
      }
    }
    this.class = "icon"
    this.innerHTML = innerHTML;
  }

  set float(val){
    this.styles = {float: val}
  }
}

class TrashIcon extends Icon{
  constructor(){
    super(`<path style = "opacity: 0.7" d="M22.54,28.31l6.68,55.05c0,0,1.68,8.19,20.78,7.76s21.92-7.41,21.92-7.41l5.6-56.54c0,0-11.19,3.88-27.53,3.88
    	S22.54,28.31,22.54,28.31z"/>
    <path d="M82.68,25.76v-3.39c0,0-1.13-1.62-2.54-1.69c-1.41-0.07-3.39,0.07-3.81-0.35c-0.42-0.42-1.13-3.53-1.13-3.53
    	s-1.62-2.16-15.32-4.73l-0.56-1.69H39.76l-0.35,2.12c0,0-11.3,1.22-15.25,5.01c0,0-0.26,3.29-0.82,3.48
    	c-0.56,0.19-2.07,0.33-4.61,0.33c0,0-1.34,0.71-1.39,2.61s0,2.38,0,2.38l2.49,0.54c0,0,3.06,4.21,30.17,4.21s29.93-5.01,29.93-5.01
    	L82.68,25.76z"/>
    <path style = "opacity: 0.8" d="M49.78,86.56L49.78,86.56c-1.18,0-2.14-0.96-2.14-2.14V38.39c0-1.18,0.96-2.14,2.14-2.14h0
    	c1.18,0,2.14,0.96,2.14,2.14v46.03C51.92,85.6,50.97,86.56,49.78,86.56z"/>
    <path style = "opacity: 0.8" d="M43.17,84.72L43.17,84.72c-1,0.02-1.85-0.84-1.9-1.91l-2.03-41.81c-0.05-1.07,0.71-1.96,1.71-1.97h0
    	c1-0.02,1.85,0.84,1.9,1.91l2.03,41.81C44.93,83.82,44.16,84.7,43.17,84.72z"/>
    <path style = "opacity: 0.8" d="M57.71,84.74L57.71,84.74c1,0,1.83-0.87,1.87-1.94l1.39-41.83c0.04-1.07-0.74-1.95-1.74-1.95l0,0
    	c-1,0-1.83,0.87-1.87,1.94l-1.39,41.83C55.94,83.86,56.72,84.73,57.71,84.74z"/>
    <path style = "opacity: 0.8" d="M36.29,85.69L36.29,85.69c-0.86,0.02-1.64-0.95-1.73-2.16l-3.72-47.28c-0.1-1.21,0.53-2.21,1.39-2.23h0
    	c0.86-0.02,1.64,0.95,1.73,2.16l3.72,47.28C37.77,84.67,37.15,85.67,36.29,85.69z"/>
    <path style = "opacity: 0.8" d="M64.4,86.19L64.4,86.19c0.86-0.01,1.61-1,1.66-2.22l2.24-47.37c0.06-1.22-0.59-2.2-1.46-2.19l0,0
    	c-0.86,0.01-1.61,1-1.66,2.22L62.94,84C62.89,85.22,63.54,86.2,64.4,86.19z"/>`)
  }
}

class UploadToCloudIcon extends Icon{
  constructor(){
    super(`<path style = "opacity: 0.8" d="M30.92,77.26c0,0-30.92,11.97-30.92-10.57c0-19.65,18.5-19.37,18.5-19.37s0-18.21,17.92-13.3
  		c0,0,2.89-18.2,19.94-18.21c15.03-0.01,15.9,14.74,15.9,14.74c1.55-2.25,20.34-0.8,13.94,17.37c0,0,17.14-2.48,13.22,18.18
  		c-2.82,14.86-25.64,10.03-25.64,10.03s-2.1,5.51-19.73,7.6C32.66,86.27,30.92,77.26,30.92,77.26z"/>
  	<path style = "fill: white; opacity: 0.9" d="M30.12,62.99h10.81v20.72c3.23,0.56,7.49,0.7,13.12,0.03c2.09-0.25,3.96-0.61,5.66-1.06V62.99h10.81
  		l-20.2-21.6L30.12,62.99z"/>`)
  }
}

class LoaderIcon extends SvgPlus{
  constructor(){
    super('svg');
    this.props = {
      viewBox: "-50 -50 100 100",
    }
    this.class = "loader-icon"
    this.r = 49;

    this.buildElement();
  }



  buildElement(){
    this._progress = 0;

    // Build backdrop ellipse
    this.backdrop = new SvgPlus('ellipse');
    this.backdrop.props = {
      rx: this.r,
      ry: this.r,
      cx: 0,
      cy: 0,
      opacity: 0.5
    }

    // Build Loader path
    this.path = new SvgPath('path');
    this.path.M(new Vector(0)).L(new Vector(this.r, 0)).A(new Vector(this.r), 0, 0, 1, new Vector(this.r, 0));
    this._progressPoint = this.path.d.end;
    this.path.Z();

    this.text = new SvgPlus('text');
    this.text.props = {
      'text-anchor': 'middle',
      y: '18',
      fill: 'white',
      style: {
        'font-size': '55',
        opacity: '0.8',
        'user-select': 'none'
      }
    }

    //appendChildren
    this.appendChild(this.path);
    this.appendChild(this.backdrop);
    this.appendChild(this.text);
  }

  onclick(){
    let next = () => {
      this.progress ++;
      if (this.progress < 100){
        setTimeout(next, 120)
      }
    }
    next();
  }

  set progress(val){
    val = parseFloat(val);
    if (Number.isNaN(val) || val < 0 || val > 100){
      return;
    }


    let r = new Vector(this.r, 0);
    r = r.rotate(Math.PI*val/50);
    this._progressPoint.large_arc_flag = val > 50 ? 1 : 0;
    this._progressPoint.p = r;
    this.path.d._update();
    this._progress = val;

    this.text.innerHTML = val;
  }

  get progress(){
    return this._progress;
  }
}

class Icon extends SvgPlus{
  constructor(html){
    super('svg');
    this.props = {
      viewBox: '0 0 100 100',
      height: '1em',
    }
    let el = SvgPlus.parseSVGString(html)
    this.props = {viewBox: el.getAttribute('viewBox')}
    this.innerHTML = el.innerHTML;
    this.class = "icon"
  }

  set float(val){
    this.styles = {float: val}
  }

  set hidden(val){
    if (val){
      this.props = {visibility: 'hidden'};
      this._hidden = true;
    }else{
      this.props = {visibility: 'visible'}
      this._hidden = false;
    }
  }

  get hidden(){
    return this._hidden;
  }
}

class ContentAdminIcon extends Icon{
  constructor(){
    super(`
      <svg viewBox="0 0 100 100">
    <g>
    	<polygon style = "opacity: 0.5" points="50,37.08 22.86,28.03 11.28,24.17 11.28,30.32 11.28,65.24 50,85.41 	"/>
    	<polygon style = "opacity: 0.75" points="50,37.08 88.72,24.17 88.72,65.24 50,85.41 	"/>
    	<polygon points="50,14.59 11.28,24.17 50,37.08 88.72,24.17 	"/>
    </g>
    <polygon style = "opacity: 0.9; fill: white" points="60.65,72.82 60.65,49.56 69.03,49.56 50,27.18 30.97,49.56 39.35,49.56 39.35,72.82 "/>
    </svg>
`)
    this.class = 'content-admin-icon'
  }
}
class AdminIcon extends Icon{
  constructor(){
    super(`<svg viewBox="0 0 100 100">
    <g>
    	<g>
    		<circle cx="49.82" cy="36.79" r="9.62"/>
    		<path d="M67.31,77.86c5.13-5.13-4.41-26.47-17.49-26.47S27.2,72.73,32.34,77.86S62.17,82.99,67.31,77.86z"/>
    	</g>
    	<g style = "opacity: 0.75">
    		<circle cx="70.52" cy="30.7" r="9.62"/>
    		<path d="M88.01,71.76c5.13-5.13-4.41-26.47-17.49-26.47S47.9,66.63,53.04,71.76S82.87,76.9,88.01,71.76z"/>
    	</g>
    	<g style = "opacity: 0.5">
    		<circle cx="29.48" cy="30.7" r="9.62"/>
    		<path d="M46.96,71.76c5.13-5.13-4.41-26.47-17.49-26.47S6.86,66.63,11.99,71.76S41.83,76.9,46.96,71.76z"/>
    	</g>
    </g>
    </svg>
`)
    this.class = 'admin-icon'
  }
}


class UploadFilesIcon extends Icon{
  constructor(){
    super(`
    <svg viewBox="0 0 100 88.3">
      <g>
      	<path class="dark" d="M94.53,15.99H58.45l0.1-0.04l-9.95-4.1L5.48,11.78C2.46,11.77,0,13.54,0,15.72v0.27v4.13v61.1c0,3.02,2.45,5.47,5.47,5.47h9v1.52h11.62V86.7h48.15v1.52h11.29V86.7h9c3.02,0,5.47-2.45,5.47-5.47V21.46C100,18.44,97.55,15.99,94.53,15.99z"/>
      	<path class="light" d="M48.6,20.2L0,20.12v-4.4c0-2.18,2.46-3.95,5.48-3.94l43.12,0.07l9.95,4.1L48.6,20.2z"/>
      	<polygon class="dark" points="14.47,41.05 14.47,88.22 26.09,88.22 26.09,51.18 74.24,51.18 74.24,88.22 85.53,88.22 85.53,41.05"/>
      </g>
      <polygon class="arrow" points="50,26.43 31.59,46.12 41.44,46.12 41.44,73.57 58.56,73.57 58.56,46.12 68.41,46.12 "/>
    </svg>
    `);
  }
}

class Arrow extends Icon{
  constructor(){
    super(`
    <svg viewBox="-50 -50 200 188.3">
      <defs>
        <filter id="dropshadow" x = "-100%" y = "-100%" height="300%" width = "300%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="15"/> <!-- stdDeviation is how much to blur -->
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8"/> <!-- slope is the opacity of the shadow -->
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/> <!-- this contains the offset blurred image -->
            <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
          </feMerge>
        </filter>
      </defs>
      <polygon filter = "url(#dropshadow)" points="50,26.43 31.59,46.12 41.44,46.12 41.44,73.57 58.56,73.57 58.56,46.12 68.41,46.12 "/>
    </svg>
    `);
    this.class = "arrow";
  }
}

// LockIcon takes a firebase path, i.e. users/uid/admin
// And provides an icon to change the state of the firebase
// data boolean
class LockIcon extends Icon{
  constructor(ref){
    super(`
    <svg viewBox = "-10 -20 120 120">
      <polygon class="st0" points="24.38,50.62 33.02,54.94 33.95,98.05 25.26,93.21"/>
      <path class="st1" d="M75.62,37.82c0,0-22.22,14.99-42.61,17.12l-8.64-4.32c0,0,7.8-9.35,41.18-17.35L75.62,37.82z"/>
      <path class="st2" d="M75.62,81.27V37.82c-0.07-0.14-19.4,13.54-42.61,17.12l0.94,43.11C33.95,98.05,57.65,94.1,75.62,81.27z"/>
    </svg>`);
    this._reference = null;

    this.class = "lock closed"

    this.lockPath = new SvgPath('path');
    this.lockPath.d_string = 'M39.720,48.780C39.720,48.780,39.030,51.150,35.180,51.150S30.540,49.670,31.130,48.780C31.130,48.780,32.070,36.790,32.070,30.170c0.0000-12.050,9.1800-27.410,22.320-28.190c10.860-0.64000,14.660,10.570,14.660,16.930s0.0000,18.710,0.0000,18.710s-0.89000,2.1700-3.9000,2.0200c-3.0100-0.15000-4.9400-1.5300-4.4400-2.5200c0.49000-0.99000,0.39000-13.230,0.39000-18.120s-3.0600-11.800-9.5300-7.9000s-10.660,10.610-11.210,19.800z';
    this.lockPoint = this.lockPath.d.start.next.next.next;

    this.startC1 = this.lockPoint.c1.clone();
    this.startC2 = this.lockPoint.c2.clone();
    this.startP = this.lockPoint.p.clone();

    this.lockPath.class = "st3"
    this.reference = ref;
    this.appendChild(this.lockPath)
  }

  set reference(val){
    try{
      firebase.database().ref(val).on('value', (sc) => {
        this.state = sc.val();
      })
      this._reference = firebase.database().ref(val);
    }catch(e){
      console.log(e);
    }
  }

  get reference(){
    return this._reference;
  }

  async open(){
    this._state = null;
    this.class = "lock"
    await this.transition(true);
    this._state = true;
  }

  async close(){
    this._state = null;
    this.class = "lock closed"
    await this.transition(false);
    this._state = false;
  }

  get state(){
    return this._state;
  }

  set state(val){
    val = !!val;
    if (val && !this.state){
      this.open();
    }else if(!val && this.state){
      this.close();
    }
  }

  async setValue(value){
    if (this.reference !== null){
      try{
        await this.reference.set(!!value)
      }catch(e){
        console.log(e);
      }
    }
  }

  onclick(){
    this.setValue(!this.state);
  }

  async transition(dir){
    return new Promise((resolve, reject) => {
      let theta = 0;
      let done = false;
      let next = () => {
        theta += 0.1;

        if (theta > Math.PI){
          theta = Math.PI;
          done = true;
        }

        this.yPos = (dir ? (1 - Math.cos(theta)) : (1 + Math.cos(theta))) * 50;

        if (done){
          resolve(true)
        }else{
          window.requestAnimationFrame(next)
        }
      }
      window.requestAnimationFrame(next)

    })
  }

  set yPos(val){
    val = parseFloat(val);
    if (!Number.isNaN(val)){
      val = -20*val/100
      this.lockPoint.p = this.startP.add(new Vector(0, val))
      this.lockPoint.c1 = this.startC1.add(new Vector(0, val))
      this.lockPoint.c2 = this.startC2.add(new Vector(0, val))
      this.lockPath.d._update();
    }
  }
}

class TrashIcon extends Icon{
  constructor(){
    super(`
    <svg viewBox = "0 0 100 100">
      <path style = "opacity: 0.7" d="M22.54,28.31l6.68,55.05c0,0,1.68,8.19,20.78,7.76s21.92-7.41,21.92-7.41l5.6-56.54c0,0-11.19,3.88-27.53,3.88S22.54,28.31,22.54,28.31z"/>
      <path d="M82.68,25.76v-3.39c0,0-1.13-1.62-2.54-1.69c-1.41-0.07-3.39,0.07-3.81-0.35c-0.42-0.42-1.13-3.53-1.13-3.53s-1.62-2.16-15.32-4.73l-0.56-1.69H39.76l-0.35,2.12c0,0-11.3,1.22-15.25,5.01c0,0-0.26,3.29-0.82,3.48c-0.56,0.19-2.07,0.33-4.61,0.33c0,0-1.34,0.71-1.39,2.61s0,2.38,0,2.38l2.49,0.54c0,0,3.06,4.21,30.17,4.21s29.93-5.01,29.93-5.01L82.68,25.76z"/>
      <path style = "opacity: 0.8" d="M49.78,86.56L49.78,86.56c-1.18,0-2.14-0.96-2.14-2.14V38.39c0-1.18,0.96-2.14,2.14-2.14h0c1.18,0,2.14,0.96,2.14,2.14v46.03C51.92,85.6,50.97,86.56,49.78,86.56z"/>
      <path style = "opacity: 0.8" d="M43.17,84.72L43.17,84.72c-1,0.02-1.85-0.84-1.9-1.91l-2.03-41.81c-0.05-1.07,0.71-1.96,1.71-1.97h0c1-0.02,1.85,0.84,1.9,1.91l2.03,41.81C44.93,83.82,44.16,84.7,43.17,84.72z"/>
      <path style = "opacity: 0.8" d="M57.71,84.74L57.71,84.74c1,0,1.83-0.87,1.87-1.94l1.39-41.83c0.04-1.07-0.74-1.95-1.74-1.95l0,0c-1,0-1.83,0.87-1.87,1.94l-1.39,41.83C55.94,83.86,56.72,84.73,57.71,84.74z"/>
      <path style = "opacity: 0.8" d="M36.29,85.69L36.29,85.69c-0.86,0.02-1.64-0.95-1.73-2.16l-3.72-47.28c-0.1-1.21,0.53-2.21,1.39-2.23h0c0.86-0.02,1.64,0.95,1.73,2.16l3.72,47.28C37.77,84.67,37.15,85.67,36.29,85.69z"/>
      <path style = "opacity: 0.8" d="M64.4,86.19L64.4,86.19c0.86-0.01,1.61-1,1.66-2.22l2.24-47.37c0.06-1.22-0.59-2.2-1.46-2.19l0,0c-0.86,0.01-1.61,1-1.66,2.22L62.94,84C62.89,85.22,63.54,86.2,64.4,86.19z"/>
    </svg>`);
    this.class = 'icon trash'

  }

}

class UploadToCloudIcon extends Icon{
  constructor(){
    super(`
    <svg viewBox = "0 0 100 100">
      <path style = "opacity: 0.8" d="M30.92,77.26c0,0-30.92,11.97-30.92-10.57c0-19.65,18.5-19.37,18.5-19.37s0-18.21,17.92-13.3c0,0,2.89-18.2,19.94-18.21c15.03-0.01,15.9,14.74,15.9,14.74c1.55-2.25,20.34-0.8,13.94,17.37c0,0,17.14-2.48,13.22,18.18c-2.82,14.86-25.64,10.03-25.64,10.03s-2.1,5.51-19.73,7.6C32.66,86.27,30.92,77.26,30.92,77.26z"/>
  	  <path style = "fill: white; opacity: 0.9" d="M30.12,62.99h10.81v20.72c3.23,0.56,7.49,0.7,13.12,0.03c2.09-0.25,3.96-0.61,5.66-1.06V62.99h10.81l-20.2-21.6L30.12,62.99z"/>
    </svg>`)
    this.class = 'icon upload'

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

export {TrashIcon, UploadToCloudIcon, LoaderIcon, UploadFilesIcon, LockIcon, AdminIcon, ContentAdminIcon, Arrow}

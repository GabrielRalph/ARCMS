//
// class PhiLoader extends AnimationSvg {
//   build(){
//     this.class = "phi-loader"
//     this.innerHTML = `<svg id = "logo-loader" viewBox="0 0 474.55 132.87">
//       <style type="text/css">
//       .st0{fill:black;stroke-miterlimit:10;}
//       .lightning{
//         stroke: orange;
//         filter: url(#glow);
//         fill: none;
//         stroke-width: 2;
//         stroke-linecap: round;
//         stroke-linejoin: round;
//       }
//       .phi{
//         /* fill: #e6770d; */
//       }
//       </style>
//       <defs>
//         <filter id="glow">
//           <fegaussianblur class="blur" result="coloredBlur" stddeviation="4"></fegaussianblur>
//           <femerge>
//             <femergenode in="coloredBlur"></femergenode>
//             <femergenode in="coloredBlur"></femergenode>
//             <femergenode in="coloredBlur"></femergenode>
//             <femergenode in="SourceGraphic"></femergenode>
//           </femerge>
//         </filter>
//       </defs>
// 	<path d="M430.55,128.43h41.78L449.39,4.9h-43.91L386.8,56.18L370.42,4.9h-43.91l-22.94,123.53h41.78l10.32-57.18l18.35,57.18h27.85l18.35-57.18L430.55,128.43z M253.28,131.06c10.49,0,19.99-2.29,28.18-6.88V82.23c-6.23,5.73-14.91,9.5-24.9,9.5c-15.4,0-26.54-10.65-26.54-25.07s11.14-25.07,26.54-25.07c9.99,0,18.68,3.77,24.9,9.5V9c-8.19-4.1-17.69-6.72-28.18-6.72c-37.85,0-65.53,27.52-65.53,64.39S215.43,131.06,253.28,131.06 M129.91,128.43h41.78L148.75,4.9h-43.91L86.17,56.18L69.78,4.9H25.88L2.94,128.43h41.78l10.32-57.18l18.35,57.18h27.85l18.35-57.18L129.91,128.43z"/>
//     </svg>
//     `
//
//     this.svg = new SvgPlus(this.getElementsByTagName('svg')[0]);
//     this.svg.styles = {
//       position: 'fixed',
//       width: '40vw',
//       top: '50%',
//       left: '50%',
//       transform: 'translate(-50%, -50%)'
//     }
//     this.path = new SvgPath('path');
//     // this.path.d_string = "M430.55,128.43h41.78L449.39,4.9h-43.91L386.8,56.18L370.42,4.9h-43.91l-22.94,123.53h41.78l10.32-57.18l18.35,57.18h27.85l18.35-57.18L430.55,128.43z M253.28,131.06c10.49,0,19.99-2.29,28.18-6.88V82.23c-6.23,5.73-14.91,9.5-24.9,9.5c-15.4,0-26.54-10.65-26.54-25.07s11.14-25.07,26.54-25.07c9.99,0,18.68,3.77,24.9,9.5V9c-8.19-4.1-17.69-6.72-28.18-6.72c-37.85,0-65.53,27.52-65.53,64.39S215.43,131.06,253.28,131.06 M129.91,128.43h41.78L148.75,4.9h-43.91L86.17,56.18L69.78,4.9H25.88L2.94,128.43h41.78l10.32-57.18l18.35,57.18h27.85l18.35-57.18L129.91,128.43z"
//     this.lightning = new LightningPath(this.path, 30);
//     this.lightning.restart = () => {
//       this.resetClock();
//     }
//     this.svg.appendChild(this.lightning)
//   }
//
//   async fadeOut(){
//     return new Promise((resolve, reject) => {
//       this.styles = {
//         transition: '0.2s ease-in opacity',
//         opacity: '0'
//       }
//       setTimeout(() => {
//         this.styles = {
//           display: 'none'
//         }
//         resolve(true)
//       }, 200)
//     })
//   }
//
//   async fadeIn(){
//     return new Promise((resolve, reject) => {
//       this.styles = {
//         transition: '0.2s ease-in opacity',
//         display: 'block',
//         opacity: '1'
//       }
//       setTimeout(() => {
//         resolve(true)
//       }, 200)
//     })
//   }
// }

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

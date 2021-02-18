import {UploadAssets} from "./Contents/UploadAssets.js"

// class Test extends SvgPlus{
//   constructor(){
//     super('div');
//
//     this.padding = '8vw';
//
//     this.styles = {
//       position: "fixed",
//       top: this.padding,
//       left: this.padding,
//       bottom: this.padding,
//       right: this.padding,
//     }
//
//     this.modelViewer = this.createChild('model-viewer');
//     this.modelViewer.props = {
//       src: '',
//       'auto-rotate': true,
//       'data-js-focus-visible': true,
//       'camera-controls': true,
//       style: {
//         width: "100%",
//         height: "100%"
//       }
//     }
//   }
//
//   loadFile(file){
//     if (isGLB(file)){
//       var reader  = new FileReader();
//
//       // listen for 'load' events on the FileReader
//       reader.addEventListener("load",  () => {
//         // change the preview's src to be the "result" of reading the uploaded file (below)
//         this.modelViewer.props = {
//           src: reader.result
//         }
//       }, false);
//
//       // if there's a file, tell the reader to read the data
//       // which triggers the load event above
//       reader.readAsDataURL(file);
//     }
//   }
//
//   ondblclick(){
//     let input = new SvgPlus('INPUT');
//     input.props = {
//       type: "file",
//       styles: {
//         display: "none",
//       }
//     }
//     input.onchange = () => {
//       if (input.files.length > 0){
//         this.loadFile(input.files[0]);
//       }
//     }
//     input.click()
//   }
// }
let assets = new UploadAssets();
document.body.appendChild(assets)

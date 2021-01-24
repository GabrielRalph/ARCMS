class AddCollection extends SvgPlus{
  constructor(){
    super('div');
    this.class = "add-collection"
    this.innerHTML = `
    <svg viewBox="0 0 100 88.3">
      <g>
      	<path class="dark" d="M94.53,15.99H58.45l0.1-0.04l-9.95-4.1L5.48,11.78C2.46,11.77,0,13.54,0,15.72v0.27v4.13v61.1c0,3.02,2.45,5.47,5.47,5.47h9v1.52h11.62V86.7h48.15v1.52h11.29V86.7h9c3.02,0,5.47-2.45,5.47-5.47V21.46C100,18.44,97.55,15.99,94.53,15.99z"/>
      	<path class="light" d="M48.6,20.2L0,20.12v-4.4c0-2.18,2.46-3.95,5.48-3.94l43.12,0.07l9.95,4.1L48.6,20.2z"/>
      	<polygon class="dark" points="14.47,41.05 14.47,88.22 26.09,88.22 26.09,51.18 74.24,51.18 74.24,88.22 85.53,88.22 85.53,41.05"/>
      </g>
      <polygon class="arrow" points="50,26.43 31.59,46.12 41.44,46.12 41.44,73.57 58.56,73.57 58.56,46.12 68.41,46.12 "/>
    </svg>
    `;
    this.icon = new SvgPlus(this.firstElementChild);
    this.input = new AddCollectionInput();
    this.input.styles = {
      display: 'none'
    }
    this.appendChild(this.input);
    this.icon.onclick = () => {
      this.input.click();
    }
  }

  set ontree(callback){
    if (callback instanceof Function){
      this.input.ontree = callback;
    }
  }
}

class AddCollectionInput extends SvgPlus{

  constructor(){
    super('input');
    this.props = {
      webkitdirectory: true,
      type: 'file'
    }
    this.resetTree();
  }

  resetTree(){
    this.fileTree = {};
  }


  oninput(){
    this.makeFileTree();
    if (this.ontree instanceof Function){
      this.ontree(this.fileTree)
    }
    this.value = null;
  }

  _getPath(file){
    let path = file.webkitRelativePath;
    if (typeof path === 'string'){
      path = path.split(/\/|\./g);
    }else{
      return null;
    }
    if (path.length < 5){
      return null;
    }

    if ((/\.(fbx)|(glb)$/).test(file.name)){
      path[path.length - 2] = path[path.length - 1];
      path.pop();
      path.push(file);
      return path;
    }

    if ((/^image/).test(file.type)){
      let name = path[path.length - 2];
      if (name == 'thumbnail' ){
        path.pop();
        path.push(file);
        return path;

      }else if( (/\(([a-g]|[A-G]|\d){6}\)/).test(name)){
        path[path.length - 1] = path[path.length - 2];
        path[path.length - 2] = 'textures'
        path.push(file);
        return path;
      }
    }

    return null;
  }

  _insertFile(file){
    let path = this._getPath(file);
    if (path === null) return;
    let ref = this.fileTree;
    for (var i = 0; i < path.length - 1; i++){
      let part = path[i];

      if (i == path.length - 2){
        ref[part] = path[path.length - 1];
      }else{
        if (part in ref){
          ref = ref[part];
        }else{
          ref[part] = {};
          ref = ref[part];
        }
      }
    }
  }

  makeFileTree(){
    this.resetTree();
    if (this.files instanceof FileList && this.files.length > 0){
      for (var file of this.files){
        this._insertFile(file);
      }
    }
  }
}

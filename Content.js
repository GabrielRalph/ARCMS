Vue.component('contents', {
  data: function () {
    return{
      data: {},
      modelSrc: '',
      portrait:false,
    }
  },
  created(){
    this.getModel();
    let onResize = () => {
      this.portrait = window.innerHeight > window.innerWidth;
      console.log(this.portrait);
    }
    window.addEventListener('resize', onResize);
    onResize();
  },



  methods: {
    async getModel(){
      try{
        let ref = firebase.storage().ref('example-3d-map.glb');
        this.modelSrc = await ref.getDownloadURL();
      }catch(e){
        console.log(e);
      }
    },
    getFiles(event){
      let data = {};
      const fileList = event.target.files;
      for (var file of fileList){
        if (file.webkitRelativePath.indexOf('.usdz') != -1 || file.webkitRelativePath.indexOf('.gltf') != -1){
            let path = file.webkitRelativePath.split('/');
            path[path.length - 1] = URL.createObjectURL(file)
            this.addPath(path)
        }
      }
      console.log(this.data);
      this.$forceUpdate();
    },


    pathToObject(path_, i_ = 0){
      let recursive = (path, i) => {
        if (i == path.length - 1) return path[i];
        let data = {};
        data[path[i]] = recursive(path , i + 1);
        return data;
      }
      return recursive(path_, i_)
    },

    addPath(path){

      let recursive = (path, data = this.data, i = 0) => {
        if (i == path.length - 1){
          data = path[i];
        }
        if (path[i] in data){
          recursive(path, data[path[i]], i+1);
        }else{
          console.log( this.pathToObject(path, i + 1));
          data[path[i]] = this.pathToObject(path, i + 1);
        }
      }

       recursive(path);
    }
  },
  template: `
  <div class = "content">
    <model-viewer :class = "{portrait: portrait}" data-js-focus-visible ar camera-controls ios-src="tv_retro.usdz" :src = "modelSrc">
      <button slot="ar-button" style="background-color: white; border-radius: 4px; border: none; position: absolute; top: 16px; right: 16px; ">
          AR
      </button>
    </model-viewer>
    <div :class = "{'input-pannel': true, portrait: portrait}">
      <input webkitdirectory type="file" id="file-selector" @change = "getFiles" multiple>
      <div v-if = "data" v-for = "(model, name) in data">
        <h3>{{name}}</h3>
        <div v-for = "(sizes, size) in model">
          <h4>{{size}}</h4>
          <div v-for = "(name, color) in sizes">
            <h5>{{color}} - {{name}}</h5>
          </div>
        </div>
      </div>
    </div>
  </div>

  `
})

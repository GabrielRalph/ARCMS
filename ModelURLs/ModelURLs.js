import {SvgPlus} from '../SvgPlus/4.js'

var firebaseConfig = {
   apiKey: "AIzaSyBKpHxX0GdVnbdyW_Y3F94t9deXHg5prLQ",
   authDomain: "mcm-ar.firebaseapp.com",
   databaseURL: "https://mcm-ar-default-rtdb.firebaseio.com",
   projectId: "mcm-ar",
   storageBucket: "mcm-ar.appspot.com",
   messagingSenderId: "259610992491",
   appId: "1:259610992491:web:07701029235d3075e7362e",
   measurementId: "G-LRYD6737VE"
 };
 // Initialize Firebase
 firebase.initializeApp(firebaseConfig);

class ModelURLs extends SvgPlus{
  async getURLs(){
    let sc = await firebase.database().ref("/Assets").once("value");
    this._urls = [];
    this.parseAssets(sc.val());
    this.drawUrls();

  }

  parseAssets(obj, path = ""){
    for (let key in obj) {
      if (typeof obj[key] === "object") {
        this.parseAssets(obj[key], path + `${key}/`);
      }else if (key === "glb") {
        let names = path.split("/");
        names.pop();
        let color = names.pop();
        let size = names.pop();
        let name = names.pop();

        color = color.replace(")", "").split("(");

        this._urls.push({
          name: name,
          size: size,
          color: color[0],
          hexcolor: "#" +color[1],
          url: obj[key]
        })
      }
    }
  }

  drawUrls(){
    this.innerHTML = "";
    for (let url of this._urls) {
      let row = this.createChild("tr");
      row.createChild("td").innerHTML = url.name
      row.createChild("td").innerHTML = url.size
      row.createChild("td").innerHTML = `${url.color}<b style = "color: ${url.hexcolor}">⬤</b>`
      row.createChild("td").innerHTML = url.url
    }
  }
}


export {ModelURLs}

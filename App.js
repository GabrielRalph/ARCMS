import {Windows} from './Utilities/Windows.js'
import {Controls} from './Utilities/Controls.js'
import {PhiLoader} from './Utilities/Loader.js'
import {Content} from './Contents/Content.js'
import {Admin} from './Admin/Admin.js'
import {User} from './Utilities/User.js';

class App extends Windows{
  constructor(parent){
    super('div');
    this.class = "app"
    this.loader = new PhiLoader('div');
    this.loader.start();

    this.user = new User();

    this.controls = new Controls();
    this.controls.hidden = true;

    if (parent instanceof Element){
      parent.appendChild(this.loader)
      parent.appendChild(this.controls)
      parent.appendChild(this);
    }
    this.moveTo(new SvgPlus('div'), true);
    this.user.addEventListener('user', () => {
      this.loader.stop();
      this.onuser(this.user);
    })

  }

  updateControlButtons(mode = ''){
    let buttons = {
      logout: () => { this.user.signOut() }
    };
    if (this.user.admin && mode !== 'admin') {
      buttons['admin'] = () => {
        this.controls.shown = false;
        this.moveTo(new Admin(), true);
        this.updateControlButtons('admin');
      }
    }
    if (this.user.contentAdmin && mode !== 'content') {
      buttons['content'] = () => {
        this.controls.shown = false;
        this.moveTo(new Content(), true);
        this.updateControlButtons('content');
      }
    }
    this.controls.buttons = buttons;
  }

  onuser(user){
    this.controls.hidden = false;
    this.controls.shown = false;
    this.controls.imgSrc = user.photoURL;
    this.updateControlButtons();
  }
}

window.onload = () => {
  let app = new App(document.body);
  // console.log(document.body);
}

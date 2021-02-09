import {Windows} from './Utilities/Windows.js'
import {Controls} from './Utilities/Controls.js'
import {MCMLoader} from './Utilities/MCMLoader.js'
import {Content} from './Contents/Content.js'
import {Admin} from './Admin/Admin.js'
import {User} from './Utilities/User.js';

class App extends Windows{
  constructor(parent){
    super('div');
    this.class = "app"
    this.loader = new MCMLoader();
    this.loader.start();

    this.user = new User();

    this.controls = new Controls();
    this.controls.hidden = true;

    this.admin = new Admin();
    this.content = new Content();

    if (parent instanceof Element){
      parent.appendChild(this.loader)
      parent.appendChild(this.controls)
      parent.appendChild(this);
    }
    this.moveTo(new SvgPlus('div'), true);
    this.user.addEventListener('user', () => {
      // this.loader.stop();
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
        this.moveTo(this.admin, true);
        this.updateControlButtons('admin');
      }
    }
    if (this.user.contentAdmin && mode !== 'content') {
      buttons['content'] = () => {
        this.controls.shown = false;
        this.moveTo(this.content, true);
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

let app = new App(document.body);

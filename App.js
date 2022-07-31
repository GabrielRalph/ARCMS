import {SvgPlus} from './SvgPlus/4.js'

import {Windows} from './Utilities/Windows.js'
import {Controls} from './Utilities/Controls.js'
import {MCMLoader} from './Utilities/MCMLoader.js'
import {Content} from './Contents/Content.js'
import {Admin} from './Admin/Admin.js'
import {User} from './Firebase/User.js';
import {Viewer} from './Viewer.js';

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
      this.loader.stop();
      this.greeting();
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
        this.content.liveAssets.workPanel.rightElement = null;
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
    buttons['viewer'] = () => {
      this.moveTo(new Viewer());
    }
    this.controls.buttons = buttons;
  }

  onuser(user){
    this.controls.hidden = false;
    this.controls.shown = false;
    this.controls.imgSrc = user.photoURL;
    this.updateControlButtons();
  }

  greeting(){
    let div = new SvgPlus('div');
    div.styles = {
      position: "relative",
      width: '100%',
      height: '100%'
    }
    let name = this.user.name.split(' ');
    if (name.length > 0) name = name[0];

    let head = div.createChild('h1');
    head.innerHTML = `
    Hey ${name}, welcome to the</br>MCM House</br>3D assets managment system.
    `

    if (this.user.name == 'Gabriel Ralph') {
      head.innerHTML = `
      ♥♥ Hey cutie ♥♥</br>
      `
    }

    head.styles = {
      width: '50%',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      'text-align': 'center'
    }
    this.moveTo(div, true);
  }
}

let app = new App(document.body);

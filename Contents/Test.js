// import {DropBox} from './AddCollection.js'

import {Content} from './Content.js'
import {User} from '../Firebase/User.js'
// let uploader = new FileTreeInput();

let user = new User();
let content = new Content();

// user.attachSignOutButton(signOut)
user.addEventListener('user', () => {
  document.body.appendChild(content);
})

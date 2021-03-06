import {SvgPlus} from 'https://www.svg.plus/3.js'

import {FireAuth} from './FireAuth.js'

class User extends FireAuth{
  constructor(){
    super();
    this.default = {
      name: '',
      email: '',
      photoURL: '',
      admin: false,
      contentAdmin: false,
      uid: null,
    }
    this.data = null;

    this._hasUser = false;
    this._userRef = null;

    //When a fireAuth gets a user auth link
    this.addEventListener('user-auth', (userAuth) => {
      console.log('user authenticated');
      this.data = userAuth;
      this.syncDatabase();
      this.syncAuthToken(userAuth);
    });
  }


  syncAuthToken(userAuth){
    let ref = firebase.database().ref(`/users/${userAuth.uid}/update`);
    ref.on('value', () => {
      console.log('user authentication update');
      userAuth.getIdToken(true);
    })
  }

  get hasUser(){
    return this._hasUser
  }


  get userRef(){
    if (this.uid !== null){
      return firebase.database().ref(`users/${this.uid}`);
    }
    return null;
  }

  isValidUser(user){
    if (user === null || typeof user !== 'object') return false;
    return ('name' in user) && ('email' in user) && ('photoURL' in user) && ('admin' in user) && ('contentAdmin' in user) && ('uid' in user);
  }


  async __getDatabaseUser(){
    //If no user reference return null
    if (this.userRef === null){
      return null;
    }

    //Get user once from firebase
    try{
      let user = await this.userRef.once('value');
      return user.val();
    }catch(e){
      console.log(e);
      return null;
    }
  }

  async _checkDatabaseForUser(){
    //If no user reference return
    let user = await this.__getDatabaseUser();
    if (!this.isValidUser(user)){
      try{
        await this.userRef.set(this.data);
        console.log("user created");
      }catch(e){
        console.log(e);
        return false;
      }
    }
    return true;
  }

  set listening(val){
    if (this.userRef === null) return;
    if (val && !this.listening){
      try{
        this.userRef.on('value', (sc) => {
          this._hasUser = true;
          this.data = sc.val();
          console.log('user updated');
          this.runEventListener('user');
        })
        this._listening = true;
      }catch(e){
        this._listening = false;
      }
    }else if (!val && this.listening){
      this.userRef.off();
    }
  }



  async syncDatabase(){
    this._hasUser = false;
    let hasUser = await this._checkDatabaseForUser();
    if (hasUser) {
      this.listening = true;
    } else {
      this._hasUser = false;
    }
  }


  set data(user){
    if (user === null || typeof user !== 'object') return;

    for (var key in this.default){
      if (key in user){
        this[key] = user[key]
      }else{
        this[key] = this.default[key];
      }
    }

    if ('displayName' in user){
      this.name = user.displayName;
    }else{
      this.name = this.default.name;
    }
  }

  get data(){
    let data = {}
    for (var key in this.default){
        data[key] = this[key]
    }
    return data;
  }
}

export {User}

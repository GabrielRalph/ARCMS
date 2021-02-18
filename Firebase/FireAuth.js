var CLIENT_ID = null;//'469438762797-b0d7le9gnc9tctol5hfq2co0r2ak7o77.apps.googleusercontent.com';

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
 firebase.analytics();

class FireAuth{
  constructor(){
    this.init = true;
    this.uiConfig = {
      // Url to redirect to after a successful sign-in.
      'signInSuccessUrl': '/',
      'callbacks': {
        uiShown: function() {
          // // The widget is rendered.
          // // Hide the loader.
        }
      },
      'signInOptions': [
        // TODO(developer): Remove the providers you don't need for your app.
        {
          provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          // Required to enable ID token credentials for this provider.
          clientId: CLIENT_ID,
          customParameters: {
            // Forces account selection even when one account
            // is available.
            prompt: 'select_account'
          }
        },
      ],
      // Terms of service url.
      'tosUrl': 'https://www.google.com',
    };

    this.user = null;
    this.onuser = [];
    this['onuser-auth'] = [];
    this['onuserleave'] = [];


    // Initialize the FirebaseUI Widget using Firebase.
    this.ui = new firebaseui.auth.AuthUI(firebase.auth());

    firebase.auth().onAuthStateChanged((user) => {
      this.init = false;

      //If no user then start auth container
      if (!user){
        this.runEventListener('userleave');
          let authContainer = document.createElement('DIV');
          authContainer.setAttribute('id', 'firebaseui-auth-container');
          document.body.appendChild(authContainer);
          this.ui.start('#firebaseui-auth-container', this.uiConfig)

      }else{
        this.runEventListener('user-auth', user);
      }
    });
  }

  parseElement(elem){
    if (elem == null){
      return null
    }
    if (typeof elem === 'string'){
      return this.parseElement(document.getElementById(elem))
    }else if ((`${elem.constructor}`).indexOf('Element') != -1){
      return elem
    }else{
      return null
    }
  }



  signOut(){
    firebase.auth().signOut();
  }
  attachSignOutButton(elem){
    elem = this.parseElement(elem);
    if (elem instanceof Element){
      elem.onclick = () => {
        this.signOut();
      }
    }else{
      console.error(`${elem} is neither a valid element or id`);
    }
  }
  runEventListener(name, param){
    name = 'on' + name;
    if (!(name in this)){
      throw `${name} is not a valid event`
      return
    }
    let event_listener = this[name]
    if (event_listener instanceof Function){
      event_listener(param)
    }else if(event_listener instanceof Array){
      event_listener.forEach((callback) => {
        callback(param)
      })
    }
  }
  addEventListener(type, callback){
    type = 'on' + type;
    if (!(type in this)){
      throw `${type} is not a valid event listener`
      return
    }
    if (!(callback instanceof Function)){
      throw 'Callback must be a function'
      return
    }
    this[type].push(callback)
  }
}


class User extends FireAuth{
  constructor(){
    super();
    this.addEventListener('user-auth', (userAuth) => {
      this.getUser(userAuth)
    });
    this._hasUser = false;
  }

  get hasUser(){
    return this._hasUser
  }

  userRef(user = this){
    return firebase.database().ref(`users/${user.uid}`);
  }

  getUser(userAuth){
    if (userAuth.uid == this.uid) return;
    if (userAuth.uid != this.uid && this.hasUser) this.userRed().off()
    this._hasUser = false;
    this.userRef(userAuth).on('value', (sc) => {
      let user = sc.val()
      if (user == null){
        this.setUser(userAuth)
      }
      this.name = user.name;
      this.email = user.email;
      this.photoURL = user.photoURL;
      this.admin = user.admin;
      this.contentAdmin = user.contentAdmin;
      this.uid = user.uid;
      this._hasUser = true;
      console.log('x');
      this.runEventListener('user');
    });
  }


  setUser(userAuth){
    this.userRef(userAuth).set({
      name: userAuth.name,
      email: userAuth.email,
      photoURL: userAuth.photoURL,
      admin: false,
      uid: userAuth.uid,
      contentAdmin: false
    })
  }
}

export {firebaseConfig, FireAuth}

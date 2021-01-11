var CLIENT_ID = null;//'469438762797-b0d7le9gnc9tctol5hfq2co0r2ak7o77.apps.googleusercontent.com';

const firebaseConfig = {
    apiKey: "AIzaSyAcSRFx4iINl-ycYo8gkvVkzxqjB5t3kGg",
    authDomain: "mcmhousear.firebaseapp.com",
    databaseURL: "https://mcmhousear-default-rtdb.firebaseio.com",
    projectId: "mcmhousear",
    storageBucket: "mcmhousear.appspot.com",
    messagingSenderId: "234748191529",
    appId: "1:234748191529:web:ca908ef06b11a14389cd38"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

class FireAuth{
  constructor(signin = true){
    this.init = true;
    this.uiConfig = {
      // Url to redirect to after a successful sign-in.
      'signInSuccessUrl': '/',
      'callbacks': {
        uiShown: function() {
          // // The widget is rendered.
          // // Hide the loader.
          document.getElementById('loader').style.display = 'none';
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
    this.onuserleave = [];

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
        console.log('user');
        this.runEventListener('user', user);
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

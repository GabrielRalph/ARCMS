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

Vue.component('user', {
  props: {
    user: {
      required: true,
      type: User
    },
    options: {
      required: true,
      type: Array
    },
    value: {
      type: String,
      default: 'content'
    }
  },
  data: function() {
    return {
      isOptions: false,
      duration: 500,
      hidden: 'content',
    }
  },
  methods: {
    inputHandler(option){
      this.isOptions = false;
      this.$emit('input', option);
      setTimeout(() => {
        this.hidden = option;
      }, this.duration);
    },


    toggle(){
      if (this.isOptions){
        this.isOptions = false;
      }else{
        this.isOptions = true;
      }
    }
  },
  computed: {
    availableOptions: function(){
      return this.options.filter(e => e !== this.hidden);
    },
    hider: function(){
      return `transform: translate(${this.isOptions ? '0' : '100%'}, 0); transition: ${this.duration/1000}s ease transform;`
    }
  },
  template: `
  <div class = "user">
      <img :src = "user.photoURL" @click = "isOptions = !isOptions" />
      <div :style = "hider">
        <h1 @click = "inputHandler('logout')">logout</h1>
        <h1 v-for = "option in availableOptions" @click = "inputHandler(option)">{{option}}</h1>
      </div>
  </div>
  `
})

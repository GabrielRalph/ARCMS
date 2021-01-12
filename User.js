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

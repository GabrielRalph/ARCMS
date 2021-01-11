class User{
  constructor(auth){
    this.auth = auth;
  }

  set auth(auth){
    if (typeof auth === 'object'){
      this.name = auth.displayName;
      this.email = auth.email;
      this.photoURL = auth.photoURL;
      this.uid = auth.uid;
      this.getUser(this.uid)
    }


  }

  async getUser(uid){
    let userDatabase = await firebase.database().ref('users/' + uid).once('value');
    let user = userDatabase.val()
    if (user == null){
      this.setUser()
    }else{

    }
  }

  setUser(){
    firebase.database().ref('users/'+this.uid).set({
      name: this.name,
      email: this.email,
      photoURL: this.photoURL,
      admin: false,
      uid: this.uid,
      contentAdmin: false
    })
  }
}

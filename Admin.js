Vue.component('admin', {
  data: function () {
    return{
      users: null
    }
  },
  created(){
    firebase.database().ref('users').on('value', (sc) => {
      let users = sc.val();
      if (users != null){
        if (this.users == null || users.length != this.users.length){
          this.users = users;
        }
      }
    })
  },
  computed: {
    mobile: function() {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
  },
  template: `
  <table class = "admin" v-if = "users != null">
    <tr>
      <th>
      </th>
      <th>
        Name
      </th>
      <th v-if = "!mobile">
        Email
      </th>
      <th>
        <admin-icon></admin-icon>
      </th>
      <th>
        <content-icon></content-icon>
      </th>
    </tr>
    <tr v-for = "user in users">
      <td>
        <img :src = "user.photoURL"/>
      </td>
      <td>
        {{user.name}}
      </td>
      <td v-if = "!mobile">
        {{user.email}}
      </td>
      <td>
        <lock :fire = "'users/' + user.uid + '/admin'"></lock>
      </td>
      <td>
        <lock :fire = "'users/' + user.uid + '/contentAdmin'"></lock>
      </td>
    </tr>
  </table>
  `
})

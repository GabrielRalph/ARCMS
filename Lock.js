Vue.component('lock', {
  props: {
    fire: {
      type: String,
    }
  },
  data: function () {
    return{
      lockState: 0,
      fireRef: null,
      iconPoint: new CPoint('C31.130,48.780,32.070,36.790,32.070,30.170'),
      open: false
    }
  },

  methods: {
    lockFunction: function(x){
      return x * x;
    },

    toggleLock: function(){
      if (this.fireRef != null){
        this.fireRef.set(!this.open)
      }
    },

    animate: function(time = 400, frameRate = 50){
      let state = this.open;
      if (this.lockState == 1 && state || this.lockState == 0 && !state) return;

      let duration = (state ? (1 - this.lockState) : this.lockState)*time;
      let timePerFrame = 1000/frameRate;
      let dt = Math.round(duration / timePerFrame);
      duration = dt * timePerFrame;

      let t = 0;
      let next = () => {
        t += dt;
        let x = state ? t/duration : 1 - t/duration;
        this.lockState = this.lockFunction(x);
        if(t != duration){
          setTimeout(next, dt)
        }
      }
      setTimeout(next, dt)
    },
  },
  created(){
    this.fireRef = firebase.database().ref(this.fire);
    this.fireRef.on('value', (sc) => {
      this.open = sc.val();
      this.animate();

    })
  },
  computed: {
    path: function(){
      let anchor = this.iconPoint.clone()
      anchor.add(new Vector(0, -15*this.lockState));
      return 'M39.720,48.780C39.720,48.780,39.030,51.150,35.180,51.150S30.540,49.670,31.130,48.780' + anchor + 'c0.0000-12.050,9.1800-27.410,22.320-28.190c10.860-0.64000,14.660,10.570,14.660,16.930s0.0000,18.710,0.0000,18.710s-0.89000,2.1700-3.9000,2.0200c-3.0100-0.15000-4.9400-1.5300-4.4400-2.5200c0.49000-0.99000,0.39000-13.230,0.39000-18.120s-3.0600-11.800-9.5300-7.9000s-10.660,10.610-11.210,19.800z'
    }
  },
  template: `
  <svg class = "lock" viewBox = "0 -20 100 120" @click = "toggleLock">
    <polygon class="st0" points="24.38,50.62 33.02,54.94 33.95,98.05 25.26,93.21"/>
    <path class="st1" d="M75.62,37.82c0,0-22.22,14.99-42.61,17.12l-8.64-4.32c0,0,7.8-9.35,41.18-17.35L75.62,37.82z"/>
    <path class="st2" d="M75.62,81.27V37.82c-0.07-0.14-19.4,13.54-42.61,17.12l0.94,43.11C33.95,98.05,57.65,94.1,75.62,81.27z"/>
    <path id="lock" class="st3" :d="path"></path>
  </svg>
  `
})

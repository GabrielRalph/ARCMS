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
  <svg :class = "{lock: true, selected: this.open}" viewBox = "-10 -20 120 120" @click = "toggleLock">
    <polygon class="st0" points="24.38,50.62 33.02,54.94 33.95,98.05 25.26,93.21"/>
    <path class="st1" d="M75.62,37.82c0,0-22.22,14.99-42.61,17.12l-8.64-4.32c0,0,7.8-9.35,41.18-17.35L75.62,37.82z"/>
    <path class="st2" d="M75.62,81.27V37.82c-0.07-0.14-19.4,13.54-42.61,17.12l0.94,43.11C33.95,98.05,57.65,94.1,75.62,81.27z"/>
    <path id="lock" class="st3" :d="path"></path>
  </svg>
  `
})

Vue.component('admin-icon', {
  data: function(){
    return {
      color: 'red'
    }
  },
  template: `<svg viewBox="0 0 100 100" class = "icon">
    <g>
    	<g>
    		<circle cx="49.82" cy="36.79" r="9.62"/>
    		<path d="M67.31,77.86c5.13-5.13-4.41-26.47-17.49-26.47S27.2,72.73,32.34,77.86S62.17,82.99,67.31,77.86z"/>
    	</g>
    	<g opacity = "0.7">
    		<circle cx="70.52" cy="30.7" r="9.62"/>
    		<path d="M88.01,71.76c5.13-5.13-4.41-26.47-17.49-26.47S47.9,66.63,53.04,71.76S82.87,76.9,88.01,71.76z"/>
    	</g>
    	<g opacity = "0.5">
    		<circle cx="29.48" cy="30.7" r="9.62"/>
    		<path d="M46.96,71.76c5.13-5.13-4.41-26.47-17.49-26.47S6.86,66.63,11.99,71.76S41.83,76.9,46.96,71.76z"/>
    	</g>
    </g>
  </svg>
`
})

Vue.component('content-icon', {
  data: function(){
    return {
      color: 'red'
    }
  },
  template: `<svg viewBox="0 0 100 100" :fill = "color" class = "icon">
    <g>
      <polygon opacity = "0.2" points="50,37.08 22.86,28.03 11.28,24.17 11.28,30.32 11.28,65.24 50,85.41 	"/>
      <polygon opacity = "0.3" points="50,37.08 88.72,24.17 88.72,65.24 50,85.41 	"/>
      <polygon opacity = "0.5" points="50,14.59 11.28,24.17 50,37.08 88.72,24.17 	"/>
    </g>
    <polygon points="60.65,72.82 60.65,49.56 69.03,49.56 50,27.18 30.97,49.56 39.35,49.56 39.35,72.82 "/>
  </svg>
`
})

Vue.component('lock', {
  props: {
    open: {
      type: Boolean,
      deault: false
    },
    fire: {
      type: String,
    }
  },
  data: function () {
    return{
      lockIcon:  new Lock('svg'),
      iconPoint: new CPoint('C31.130,48.780,32.070,36.790,32.070,30.170')
    }
  },
  watch: {
    open: function (oldVal, newVal){
      this.lockIcon.open = newVal;

    }
  },
  created(){
    firebase.database().ref(this.fire).on('value', (sc) => {
      this.lockIcon
    })
  },
  computed: {
    contents: function(){
      if (this.lockIcon instanceof SVGSVGElement){
        return this.lockIcon.innerHTML
      }else{
        return ''
      }
    },
    path: function(){
      return 'M39.720,48.780C39.720,48.780,39.030,51.150,35.180,51.150S30.540,49.670,31.130,48.780' + this.iconPoint + 'c0.0000-12.050,9.1800-27.410,22.320-28.190c10.860-0.64000,14.660,10.570,14.660,16.930s0.0000,18.710,0.0000,18.710s-0.89000,2.1700-3.9000,2.0200c-3.0100-0.15000-4.9400-1.5300-4.4400-2.5200c0.49000-0.99000,0.39000-13.230,0.39000-18.120s-3.0600-11.800-9.5300-7.9000s-10.660,10.610-11.210,19.800z'
    }
  },
  template: `
  <svg class = "lock" viewBox = "0 -10 100 110" v-html = "contents">
    <polygon class="st0" points="24.38,50.62 33.02,54.94 33.95,98.05 25.26,93.21"/>
    <path class="st1" d="M75.62,37.82c0,0-22.22,14.99-42.61,17.12l-8.64-4.32c0,0,7.8-9.35,41.18-17.35L75.62,37.82z"/>
    <path class="st2" d="M75.62,81.27V37.82c-0.07-0.14-19.4,13.54-42.61,17.12l0.94,43.11C33.95,98.05,57.65,94.1,75.62,81.27z"/>
    <path id="lock" class="st3" :d="path"></path>
  </svg>
  `
})

class Lock extends SvgPlus{
  build(){
    this.innerHTML = `<g><polygon class="st0" points="24.38,50.62 33.02,54.94 33.95,98.05 25.26,93.21"/><path class="st1" d="M75.62,37.82c0,0-22.22,14.99-42.61,17.12l-8.64-4.32c0,0,7.8-9.35,41.18-17.35L75.62,37.82z"/><path class="st2" d="M75.62,81.27V37.82c-0.07-0.14-19.4,13.54-42.61,17.12l0.94,43.11C33.95,98.05,57.65,94.1,75.62,81.27z"/></g>`;
    this.lockBar = new LockBar('path');
    this.appendChild(this.lockBar);
  }
  set open(val){
    this.lockBar.open = val;
  }

}
class LockBar extends SvgPath{
		build(){
      this.props = {
        class: 'st3'
      }
      this.d.d_string = "M39.720,48.780C39.720,48.780,39.030,51.150,35.180,51.150S30.540,49.670,31.130,48.780C31.130,48.780,32.070,36.790,32.070,30.170c0.0000-12.050,9.1800-27.410,22.320-28.190c10.860-0.64000,14.660,10.570,14.660,16.930s0.0000,18.710,0.0000,18.710s-0.89000,2.1700-3.9000,2.0200c-3.0100-0.15000-4.9400-1.5300-4.4400-2.5200c0.49000-0.99000,0.39000-13.230,0.39000-18.120s-3.0600-11.800-9.5300-7.9000s-10.660,10.610-11.210,19.800z"
      this.lockStart = this.d.start.next.next.next;
			this.yval = 0;
			this.defaultSpeed = 0.3;
			this._open = false;
		}




		set open(val){
      if (this.open == null) return
			if (val){
				this.openLock();
			}else{
				this.closeLock();
			}
		}
		get open(){
			return this._open
		}

		async openLock(){
      this._open = null;
      console.log('d');
			this.speed = this.defaultSpeed;
			return new Promise((resolve, reject) => {
				let next = () => {
					this.lockStart.add(new Vector(0, -this.speed));
					this.yval += this.speed;
					this.d._update();
					if (this.yval < 10){
						window.requestAnimationFrame(next)
					}else{
						resolve(true)
					}
				}
				window.requestAnimationFrame(next)
			});
      this._open = true;
		}

		async closeLock(){
      this.open = null;
			this.speed = this.defaultSpeed;
			return new Promise((resolve, reject) => {
				let next = () => {
					this.speed += 0.05;
					this.lockStart.add(new Vector(0, this.speed));
					this.yval += -this.speed;
					this.d._update();
					if (this.yval > 0){
						window.requestAnimationFrame(next)
					}else{
						resolve(true)
					}
				}
				window.requestAnimationFrame(next)
			});
      this._open = false;
		}
	}

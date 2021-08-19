// 2D vector class
class Vector{
	constructor(x = 0, y = null){
		try{
			let form_x = this.forMate(x);
			let form_y = this.forMate(y);

			if (form_x.type === 'number' && form_y.type === 'number'){
				this.x = form_x.val;
				this.y = form_y.val;

			}else if (form_x.type === 'number' && form_y.type === null){
				this.x = form_x.val;
				this.y = form_x.val;

			}else if(form_x.type === 'array'){
				try {
					let offset = form_y.type === 'number' ? form_y.val : 0;
					if (offset + 1 >= x.length){
						throw `\nparam1[${offset + 1}] is invalid, param1.length = ${x.length} but param2 = ${offset}`
					}else if (offset < 0){
						throw `\nparam2 must be a postive integer, but param2 = ${offset}`
					}
					this.x = parseFloat(x[offset]);
					this.y = parseFloat(x[1+offset]);


					if (Number.isNaN(this.x)){
						this.x = 0;
						throw `\nparam1[${offset}] is not a valid number (x = 0)`
					}

					if (Number.isNaN(this.y)){
						this.y = 0;
						throw `\nparam1[${offset + 1}] is not a valid number (y = 0)`
					}
				}catch(e){
					e = e.replace(/param1/g, 'Array').replace(/param2/g, 'Offset')
					this.x = 0;
					this.y = 0;
					throw `given: Vector(Array, Offset = 0)${e}`
				}
			}else if (form_y.type === "object" && (form_x.type === 'object' || form_x.type === 'vector')){
				if ('x' in y && 'y' in y){
					let msg = ""

					if (y.x in x){
						this.x = parseFloat(x[y.x]);

						if (Number.isNaN(this.x)){
							this.x = 0;
							throw `given: Vector(Object, Keys)\nObject[Keys.x] is not a valid number (x = 0)`
						}
					}else{
						msg += 'Keys.x is not a key in Object (x = 0)\n'
						this.x = 0;
					}

					if (y.y in x){
						this.y = parseFloat(x[y.y]);

						if (Number.isNaN(this.y)){
							this.y = 0;
							throw `given: Vector(Object, Keys)\nObject[Keys.y] is not a valid number (y = 0)`
						}
					}else{
						msg += 'Keys.y is not a key in Object (y = 0)\n'
						this.y = 0;
					}

					if (msg.length !== 0){
						throw `given: Vector(Object, Keys)\n${msg}`
					}

				}else{
					if (form_x.type === 'vector'){
						this.x = x.x;
						this.y = y.y;
					}else{
						throw `given: Vector(Object, Keys)\nKeys must contain\nx: 'x-key'\ny: 'y-key'`
					}
				}
			}else if (form_x.type === "vector"){
				this.x = x.x;
				this.y = x.y;
			}else if(form_x.type === "object"){
				this.x = parseFloat(x.x);
				this.y = parseFloat(x.y);

				if (Number.isNaN(this.x)){
					this.x = 0;
					throw `given: Vector(Object)\nObject.x is not a valid number (x = 0)`
				}

				if (Number.isNaN(this.y)){
					this.y = 0;
					throw `given: Vector(Object)\nObject.y is not a valid number (y = 0)`
				}
			}else{
				throw `Invalid input (${form_x.type}, ${form_y.type})`
				this.x = 0;
				this.y = 0;
			}
		}catch(e){
			this.x = 0;
			this.y = 0;
			console.error(`error creating vector\n\n${e}\n\nResult: V(${this})`);
		}
		this.precision = 10;
	}

	forMate(val){
		let type = typeof val;
		let message = "";
		let error = false;
		let new_val = null
		try{
			if (val == null){
				return {type: null, message:"", val: null}
			}
			if (type == 'object'){
				if (val instanceof Array){
					type = 'array'
				}else if(val instanceof Vector){
					type = 'vector'
				}else{
					if ('x' in val && 'y' in val){

						let x = parseFloat(val.x)
						let y = parseFloat(val.y)

						type = 'vector'

						if (Number.isNaN(x)){
							type = 'object'
							message += "val.x is not a valid number\n"
						}else{
						}

						if (Number.isNaN(y)){
							type = 'object'
							message += "val.y is not a valid number\n"
						}else{
						}
					}else{
						type = "object"
					}
				}
			}else if(type == 'string'){
				let temp = parseFloat(val);
				if (!Number.isNaN(temp)){
					val = temp;
					type = 'number'
				}
			}else if(type == 'number' && !Number.isNaN(val)){
				type = 'number'
			}else{
				type = 'invalid'
			}
		}catch(e){
			throw `Error on forMate\n ${e}`
		}
		return {val: val, type: type, message: message}

	}

	round(x = 1){
		return new Vector(Math.round(this.x*Math.pow(10, x))/Math.pow(10, x), Math.round(this.y*Math.pow(10, x))/Math.pow(10, x))
	}



	add(p1 = 0, p2 = null){
		let v2;
		try{
			v2 = new Vector(p1, p2);
		}catch (e){
			throw `Error on add:\n\n${e}`
		}
		return new Vector(this.x + v2.x, this.y + v2.y)
	}
	sub(p1 = 0, p2 = null){
		let v2;
		try{
			v2 = new Vector(p1, p2);
		}catch (e){
			throw `Error on sub:\n\n${e}`
		}
		return new Vector(this.x - v2.x, this.y - v2.y)
	}

	mul(p1 = 0, p2 = null){
		let v2;
		try{
			v2 = new Vector(p1, p2);
		}catch (e){
			throw `Error on mul:\n\n${e}`
		}
		return new Vector(this.x * v2.x, this.y * v2.y)
	}

	div(p1 = 0, p2 = null){
		let v2;
		try{
			v2 = new Vector(p1, p2);
		}catch (e){
			v2 = new Vector(1, 1);
			throw `Error on div:\n\n${e}`
		}
		return new Vector(this.x / v2.x, this.y / v2.y)
	}

	addV(y){
		if (typeof y === 'number'){
			return this.add(0, y);
		}
	}
	addH(x){
		if (typeof x === 'number'){
			return this.add(x, 0);
		}
	}
	clone(){
		return this.assign();
	}

	assign(){
		return new Vector(this.x, this.y)
	}

	grad(p1 = 0, p2 = null){
		let v2;
		try{
			v2 = new Vector(p1, p2);
		}catch (e){
			v2 = new Vector(1, 1);
			throw `Error on grad:\n\n${e}`
		}

		if (v2.x - this.x == 0){
			return 10000000000
		}
		return (v2.y - this.y)/(v2.x - this.x)
	}

  norm(){
    return Math.sqrt(this.y*this.y + this.x*this.x)
  }

  arg(){
    return this.atan(this.y, this.x)
  }

	distToLine(p1, p2){
		let line = p2.sub(p1).rotate(Math.PI/2)
	  let d = line.dot(this.sub(p1))/line.norm()
	  return Math.abs(d)
	}

	// (x + iy)*(cos(t) + isin(t)) = xcos(t) - ysin(t) + i(xsin(t) + ycos(t))
  rotate(theta){
    return new Vector(this.x*Math.cos(theta) - this.y*Math.sin(theta), this.x*Math.sin(theta) + this.y*Math.cos(theta))
  }

  angleBetween(p2){
    let a = this.norm()
    let b = p2.norm()
    let c = this.distance(p2)
    if (a == 0||b == 0||c==0){return 0}
    return Math.acos((c*c - a*a - b*b)/(-2*a*b))
  }

  atan(rise, run){
    if(run == 0 && rise == 0){
      // console.error('Undefined angle for atan(0/0)');
      return 0
    }
    let theta = Math.atan(Math.abs(rise)/Math.abs(run))
    let pi = Math.PI
    if(rise > 0){
      if(run > 0){
        return theta
      }else if(run < 0){
        return pi - theta
      }else{
        return pi/2
      }
    }else if(rise < 0){
      if(run > 0){
        return theta + 3*pi/2
      }else if(run < 0){
        return theta + pi
      }else{
        return 3*pi/2
      }
    }else{
      if(run >= 0){
        return 0
      }else{
        return pi
      }
    }
  }

  dir(){
    if(this.norm() == 0){return new Vector(0,0)}
    return this.div(this.norm())
  }
  dot(p2){
    return this.x*p2.x + this.y*p2.y
  }
	dist(p2){
		return this.distance(p2)
	}
  distance(p2){
    return Math.sqrt((this.x - p2.x)*(this.x - p2.x) + (this.y - p2.y)*(this.y - p2.y))
  }
	reflect(direction){
		let newVector = this.clone();
		if (typeof direction !== "string") return newVector;
		direction = direction.toUpperCase();
		if ( direction.indexOf('V') !== -1 ){
			newVector = newVector.mul(new Vector(1, -1));
		}

	  	if( direction.indexOf('H') !== -1 ){
			newVector = newVector.mul(new Vector(-1, 1));
		}
		return newVector;
	}

	getPointAtDiv(p1, d){
		if (p1 instanceof Vector){
			if (d >= 0 && d <= 1){
				return new Vector (this.x + (p1.x - this.x)*d, this.y + (p1.y - this.y)*d)
			}
		}
	}
	isZero(){
		return (this.x == 0 && this.y == 0)
	}
	toString(){
		return `${this.x.toPrecision(this.precision)},${this.y.toPrecision(this.precision)}`
	}
}

export {Vector}

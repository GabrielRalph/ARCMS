
class Header extends SvgPlus{
  constructor(title, heading = 1){
    super('H' + heading);
    this.header = title;
  }

  set header(value){
    this.innerHTML = value;
  }
}

class VList extends SvgPlus{
  constructor(list){
    super('DIV');
    this.props = {class: 'v-list'}
    this._headerElement = this.createChild('DIV');
    this._headerElement.props = {class: 'header'}
    this._listElement = this.createChild('DIV')
    this._listElement.props = {class: 'list'}
    this._open = false;
    this.list = list;
    this.transistionName = 'linearMove'
  }

  createChildOfHead(name){
    return this._headerElement.createChild(name);
  }
  appendChildToHead(element){
    return this._headerElement.appendChild(element);
  }
  removeChildFromHead(element){
    this._headerElement.remove(element);
  }
  clearHead(){
    this._headerElement.innerHTML = "";
  }

  get list(){
    return this._list;
  }

  pushElement(element){
    if (Array.isArray(this._list)){
      this._list.push(element);
      this.list = this._list;
    }else{
      this.list = [element]
    }
  }

  removeElement(element){
    if (this._listElement.contains(element)){
      this._listElement.removeChild(element);
    }
    let newList = []
    for (var el of this._list){
      if (el !== element){
        newList.push(el);
      }
    }
    this._list = newList;
  }

  set list(list){
    this._listElement.innerHTML='';
    this._list = [];
    if (Array.isArray(list)){
      for (var element of list){
        if (element instanceof Element){
          this._list.push(element);
        }
      }
    }
  }

  get isVList(){
    return true;
  }

  get transistion(){
    let transistion = this[`${this.transistionName}`];

    if (transistion instanceof Function){
      return transistion;
    }else{
      return this._default_transistion
    }
  }

  set open(state){
    if (Array.isArray(this._list)){
      if (this.open == false && state == true){
        this.show();
      }else if(this.open == true && state == false){
        this.hide();
      }
    }
  }

  get open(){
    return this._open;
  }

  _changeState(state){
    this._open = state;
    if (this.onstatechange instanceof Function){
      this.onstatechange(state);
    }
  }

  async show(duration = 100){
    this._changeState(null);
    for (var element of this.list){
      await this.transistion(element, true, duration);
    }
    this._changeState(true);
  }

  async hide(duration = 100){
    this._changeState(null);
    for (var i = this.list.length - 1; i >= 0; i--){
      let element = this.list[i];
      await this.transistion(element, false, duration);
    }
    this._changeState(false);
  }

  async _default_transistion(element, direction, duration){
    return await this.linearMove(element, direction, duration);
  }

  async linearMove(element, direction, duration){
    if (element.isVList && element.open){
      await element.hide(duration/2)
    }
    let initTime = null;
    let move = direction ? -1 : 0;
    return new Promise((resolve, reject) => {
      let next = (dt)=>{
        if (initTime == null) initTime = dt;
        let t = dt - initTime;
        element.style.setProperty('transform', `translate(0%, ${move*100}%)`)
        element.style.setProperty('opacity', `${1 + move}`)
        if (!this._listElement.contains(element)){
          this._listElement.appendChild(element)
        }
        move = direction ? t/duration - 1 : - t/duration;
        if (move > 0 || move < -1){
          if (move < -1){
            this._listElement.removeChild(element);
          }else{
            element.style.setProperty('transform', `translate(0%, 0%)`)
            element.style.setProperty('opacity', `1`)
          }
          resolve()
        }else{
          window.requestAnimationFrame(next);
        }
      }
      window.requestAnimationFrame(next);
    })
  }
}

export {VList}
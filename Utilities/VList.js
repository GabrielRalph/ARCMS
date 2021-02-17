
class Header extends SvgPlus{
  constructor(title, heading = 1){
    super('H' + heading);
    this.header = title;
  }

  set header(value){
    this.innerHTML = value;
  }
}

/**
  VList is an extendable class used to make collapsable
  lists.
*/
class VList extends SvgPlus{
  constructor(name, master, list){
    super('DIV');
    this.props = {class: 'v-list'}
    this._headerElement = this.createChild('DIV');
    this._headerTitle = this.createChildOfHead('H1');
    this._headerElement.props = {class: 'header'}
    this._listElement = this.createChild('DIV')
    this._listElement.props = {class: 'list'}

    //Instantiate private variables
    this._name = null;
    this._open = false;

    this._master = master;

    this.name = name;
    this.list = list;
    this.transistionName = 'linearMove'
  }

  //Creates a child in the header
  createChildOfHead(name){
    return this._headerElement.createChild(name);
  }

  //Appends a child to the header
  appendChildToHead(element){
    return this._headerElement.appendChild(element);
  }

  //Removes a child from the header
  removeChildFromHead(element){
    this._headerElement.remove(element);
  }

  //Clears head
  clearHead(){
    this._headerElement.innerHTML = "";
    this.appendChildToHead(this._headerTitle);
  }

  //Adds an element to the list
  addElement(element){
    if (Array.isArray(this._list)){
      this._list.push(element);
      this.list = this._list;
    }else{
      this.list = [element]
    }
  }

  //Removes an element from the list
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

  //Runs a method using the event bus
  runEvent(eventName, params){
    if ( typeof this.master === 'object' ) {
      if ( eventName in this.master ) {
        let eventFunction = this.master[eventName];

        if ( eventFunction instanceof Function ){
          eventFunction(params);
        }
      }
    }
  }

  get master(){
    return this._master;
  }

  //Set and get the list name
  set name(name){
    this._name = null;
    this._headerElement.innerHTML = "";

    if (typeof name !== 'string') return;

    this._headerElement.innerHTML = name;
    this._name = name;
  }
  get name(){
    return this._name;
  }

  //Set the list of elements
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
  //Returns a list of all elements in the list
  get list(){
    return this._list;
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
}

export {VList}

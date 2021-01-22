
class Header extends SvgPlus{
  constructor(title, heading = 1){
    super('H' + heading);
    this.header = title;
  }

  set header(value){
    this.innerHTML = value;
  }
}


function isURL(str) {
  if (typeof str !== 'string') return false;
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
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
    this._headerElement.appendChild(element);
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
    console.log(element);
    if (Array.isArray(this._list)){
      this._list.push(element);
      this.list = this._list;
    }else{
      this.list = [element]
    }
  }

  set list(list){
    if (Array.isArray(list)){
      this._listElement.innerHTML='';
      this._list = [];
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
    if (this.open == false && state == true){
      this.show();
    }else if(this.open == true && state == false){
      this.hide();
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

class Folder extends VList{
  constructor(folder, name){
    super();
    this.props = {class: 'folder'}
    this.headerTitle = this.createChildOfHead('H1');
    // this.headerShow= this.headerElement.createChild('H2');
    // this.headerShow.innerHTML = '&#709;';

    this.folder = folder;
    this.name = name;

    this.headerTitle.addEventListener('click', () => {
      this.open = !this.open
    })
  }

  onstatechange(state){
    // let arrow = '&#709;';
    // if (state) arrow = '&#708;';
    // if (state == null) arrow = '-'
    // this.headerShow.innerHTML = arrow;
  }

  set name(name){
    this.headerTitle.innerHTML= '' + name;
  }

  get name(){
    return this.headerTitle.innerHTML;
  }

  set folder(folder){
    let elements = [];
    if (typeof folder === 'object'){
      for (var name in folder){
        let file = folder[name];
        if (typeof file === 'object'){
          let newFolder = new Folder(file, name);
          elements.push(newFolder);
        } else if (typeof file === 'string'){
          let header = new Header(file, 2);
          elements.push(header);
        }
      }
      this.list = elements;
    }
  }
}

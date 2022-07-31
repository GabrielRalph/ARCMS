import {SvgPlus} from '../SvgPlus/4.js'

class VList extends SvgPlus{
  constructor(name, master, list){
    super('DIV');
    this.props = {class: 'v-list'}
    this._headerElement = this.createChild('DIV');

    this._headerElement.props = {class: 'header'}
    this._listElement = this.createChild('DIV')
    this._listElement.props = {
      class: 'list',
    }

    this._headerTitle = this.createChildOfHead('H1');
    this._headerTitle.styles = { 'font-size': '1em'}

    this._headerTitle.ondblclick = (e) => {
      this.ontitledblclick(e)
    }

    this._headerTitle.onclick = (e) => {
      this.ontitleclick(e)
    }

    //Instantiate private variables
    this._name = null;
    this._open = true;
    this._moving = false;

    this._master = master;

    this.name = name;
    this.list = list;
    this.transistionName = 'linearMove'
  }

  //Runs a method using the event bus
  runEvent(eventName, params){
    if ( this.master == null ) return;
    if ( typeof this.master === 'object' ) {
      if ( eventName in this.master ) {
        if ( this.master[eventName] instanceof Function ){
          this.master[eventName](params);
        }
      }
    }
  }

  clear(){
    this._listElement.innerHTML = "";
  }

  async addElement(element){
    if (element instanceof Element){
      let height = this.height;
      this._listElement.styles = {
        height: `${height}px`
      }
      this._listElement.appendChild(element);
      let dh = this.height - height;
      await this.waveTransition((t) => {
        this._listElement.styles = {
          height: `${height + dh*t}`
        }
      }, 500, true)
      this._listElement.styles = {
        height: 'auto'
      }
    }
  }

  removeElement(element){
    if (element instanceof Element && this._listElement.contains(element)){
      this._listElement.removeChild(element);
    }
  }

  ontitleclick(){
  }

  ontitledblclick(){
    this.open = !this.open
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
    if (this._headerElement.contains(element)){
      this._headerElement.remove(element);
    }
  }

  //Clears head
  clearHead(){
    this._headerElement.innerHTML = "";
    this.appendChildToHead(this._headerTitle);
  }

  async show(){
    let height = this.height;
    await this.waveTransition((t) => {
      this._listElement.styles = {
        height: `${t*height}px`
      }
    }, 500, true)
    this._listElement.styles = {
      height: 'auto'
    }
  }

  async hide(){
    let height = this.height;
    await this.waveTransition((t) => {
      this._listElement.styles = {
        height: `${t*height}px`
      }
    }, 500, false)
  }

  showAll(){

  }

  set open(val){
    if (val){
      this.show();
      this._open = true;
    }else{
      this.hide();
      this._open = false;
    }
  }
  get open(){
    return this._open;
  }

  get height(){
    let bbox = this._listElement.scrollHeight;
    return bbox;
  }

  get master(){
    return this._master;
  }

  //Set and get the list name
  set name(name){
    this._name = null;
    this._headerTitle.innerHTML = "";

    if (typeof name !== 'string') return;

    this._headerTitle.innerHTML = name;
    this._name = name;
  }
  get name(){
    return this._name;
  }
}

export {VList}

class WorkPanel extends SvgPlus{
  constructor(){
    super('DIV');

    this._leftDeltaWidth = 0;
    this.buildTemplate();

    this.sliderBarWidth = '2px'
    this.sliderBoxWidth = '20px'
    this.leftWidth = '60%'
  }


  buildTemplate(){
    this.styles = {
      position: "relative",
      width: "100%",
      height: "100%",
    }

    this.left = this.createChild("DIV");
    this.left.styles = {
      position: 'absolute',
      top: '0',
      left: '0',
      bottom: '0',
      'z-index': '1',
      'overflow-y': 'scroll'
    }

    this.sliderBox = this.createChild('DIV');
    this.sliderBox.styles = {
      position: 'absolute',
      top: '0',
      bottom: '0',
      height: '100%',
      cursor: 'ew-resize',
      'z-index': '2',
      transform: 'translate(-50%, 0)'
    }
    this.sliderBar = this.sliderBox.createChild('DIV');
    this.sliderBar.styles = {
      height: '100%',
      background: '#0001',
    }

    this.right = this.createChild("DIV");
    this.right.styles = {
      position: 'absolute',
      top: '0',
      right: '0',
      bottom: '0',
      'z-index': '1',
      'overflow-y': 'scroll'
    }

    this.sliderBox.onmouseover = () => {
      this.sliderHover = true;
    }
    this.sliderBox.onmouseleave = () => {
      this.sliderHover = false;
    }

    this.onmousedown = () => {
      this.sliderSelected = this.sliderHover;
    }
    this.onmouseup = () => {
      this.sliderSelected = false;
    }

    this.onmousemove = (event) => {
      this.moveSlider(event.movementX)
    }
  }

  moveSlider(dx){
    if ( this.sliderSelected ){
      this.leftDeltaWidth += dx;
    }
  }

  updateWidth(){
    this.left.styles = {
      width: `calc(${this.leftWidth} + ${this.leftDeltaWidth}px)`
    }
    this.right.styles = {
      width: `calc(100% - ${this.leftWidth} - ${this.leftDeltaWidth}px)`
    }
    this.sliderBox.styles = {
      left: `calc(${this.leftWidth} + ${this.leftDeltaWidth}px)`
    }
  }

  appendLeftChild(child){
    return this.left.appendChild(child);
  }
  appendRightChild(child){
    return this.right.appendChild(child);
  }
  createLeftChild(param){
    return this.left.createChild(param);
  }
  createRightChild(param){
    return this.right.createLeftChild(param);
  }

  set leftWidth(width){
    this._leftWidth = width;
    this.updateWidth();
  }
  get leftWidth(){
    return this._leftWidth
  }

  set leftDeltaWidth(width){
    this._leftDeltaWidth = width;
    this.updateWidth();
  }
  get leftDeltaWidth(){
    return this._leftDeltaWidth;
  }

  set sliderBoxWidth(width){
    this._sliderBoxWidth = width;
    this.sliderBox.styles = {
      padding: `0 calc((${width} - ${this.sliderBarWidth}) / 2)`
    }
  }
  get sliderBarWidth(){
    return this._sliderBoxWidth;
  }

  set sliderBarWidth(width){
    this._sliderBarWidth = width;
    this.sliderBar.styles = {
      width: width,
    }
  }
  get sliderBarWidth(){
    return this._sliderBarWidth;
  }

  set sliderHover(value){
    if (value){
      this._sliderHover = true;
      this.sliderBar.styles = {background: '#0002'}
    }else{
      this._sliderHover = false;
      this.sliderBar.styles = {background: '#0001'}
    }
  }
  get sliderHover(){
    return this._sliderHover;
  }

  set sliderSelected(value){
    if (value){
      this._sliderSelected = true;
    }else{
      this._sliderSelected = false;
    }
  }
  get sliderSelected(){
    return !!this._sliderSelected;
  }

  set leftElement(element){
    this.left.innerHTML = ""
    if (element instanceof Element){
      this.left.appendChild(element);
      this._leftElement = element;
    }
  }
  get leftElement(){
    return this._leftElement;
  }

  set rightElement(element){
    this.right.innerHTML = ""
    if (element instanceof Element){
      this.right.appendChild(element);
      this._rightElement = element;
    }
  }
  get rightElement(){
    return this._rightElement;
  }
}

export {WorkPanel}

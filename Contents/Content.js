class Content extends SvgPlus{
  constructor(){
    super('div');
    this.class = 'content'
    this.input = new AddCollection();
    // this.appendChild(this.input);
    this.props = {
      webkitdirectory: true,
    }
    let events = ['dragenter', 'dragover', 'dragleave', 'drop']
    events.forEach(eventName => {
      this.addEventListener(eventName, (e) => {
        e.preventDefault()
        e.stopPropagation()
      }, false)
    })


    this.additions = new Collection();
    this.additions.name = "contents"
    this.appendChild(this.additions);

    this.loader = this.additions.appendChildToHead(this.input);
    this.loader.props = {fill: '#0c89ff'}

    this.input.ontree = (json) => {
      this.additions.json = json;
      this.additions.showAll();
      // console.log(this.additions);
    }
  }



  ondrop(e){
    e.preventDefault();
    var items = e.dataTransfer.items;
    this.input.getFilesFromDrop(items)
  }
}

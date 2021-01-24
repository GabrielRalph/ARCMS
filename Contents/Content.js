class Content extends SvgPlus{
  constructor(){
    super('div');
    this.class = 'content'
    this.input = new AddCollection();
    this.appendChild(this.input);

    this.additions = new Collection();
    this.additions.name = "contents"
    this.appendChild(this.additions);

    this.loader = this.additions.appendChildToHead(new LoaderIcon());
    this.loader.props = {fill: '#0c89ff'}

    this.input.ontree = (json) => {
      this.additions.json = json;
      this.additions.showAll();
      // console.log(this.additions);
    }
  }
}

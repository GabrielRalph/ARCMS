class Content extends SvgPlus{
  constructor(){
    super('div');
    this.class = 'content'
    this.input = new AddCollection();
    this.appendChild(this.input);

    this.additions = new Collection();
    this.additions.name = "contents"
    this.appendChild(this.additions);

    this.input.ontree = (json) => {
      this.additions.json = json;
      // console.log(this.additions);
    }
  }
}

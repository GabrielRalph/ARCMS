import {VList} from '../Utilities/VList.js'
import {Model} from './Model.js'
import {uploadFileToCloud, contains, isImage, isURL} from '../Utilities/Functions.js'
import {TrashIcon, UploadToCloudIcon, Arrow} from '../Utilities/Icons.js'

class Collection extends VList{
  constructor(json = null, name = '', master){
    super();
    this.master = master;

    this.class = "collection"
    this.buildElement();

    this._parentCollection = null;
    this._collection = null;
    this._mode = null;
    this._thumbnail = null;

    this.name = name;
    this.json = json;
  }

  buildElement(){
    this.headerTitle = this.createChildOfHead('H1');
    this.headerTitle.innerHTML = name;
    this.headerTitle.ondblclick = () => {
      this.open = !this.open;
    }
    this.headerTitle.onclick = () => {
      if (typeof this.master === 'object' && this.master.select instanceof Function){
        this.master.select(this);
      }
    }
  }


  clear(){
    this._collection = null;
    this.list = null;
  }


  forEach(callback){
    if (callback instanceof Function){
      for (var key in this._collection){
        callback(this._collection[key], key)
      }
    }
  }


  getAllModels(el = this){
    let models = [];
    if (SvgPlus.is(el, Collection)) {
      el.forEach((item, key) => {
        models = models.concat(this.getAllModels(item));
      });
      return models;
    }else if (SvgPlus.is(el, Model)){
      return [el];
    }
  }


  async showAll(duration = 100){
    await this.show();
    for (var element of this.list){
      if (SvgPlus.is(element, Collection)){
        await element.showAll(duration);
      }
    }
  }

  async uploadToCloud(){
    let models = this.getAllModels();
    for (var model of models){
      if ( !(await model.uploadToCloud()) ){
        return false
      }
    }
    return true
  }

  //Start syncing with firebase
  async startSync(){
    if (this.path == null) return false;
    try{
      this.clear();
      await firebase.database().ref(this.path).on('child_added', (sc) => {
        this._onSyncChildAdded(sc);
      });

      await firebase.database().ref(this.path).on('child_removed', (sc) => {
        this._onSyncChildRemoved(sc);
      });
      console.log('synced ' + this.name);
      this._synced = true;
      return true;
    }catch(e){
      console.log(e);
      return resolve(false);
    }
  }

  async _onSyncChildRemoved(sc){
    this.remove(this._collection[sc.key]);
  }

  async _onSyncChildAdded(sc){
    if (sc.key === 'thumbnail'){
      this.thumbnail = sc.val();
    }else{
      let model = new Model(sc.val(), sc.key, this.master);
      model.parentCollection = this;
      if ( await model.startSync() ){
        this.add(model);
        await this.showAll();

      } else {
        let collection = new Collection(sc.val(), sc.key, this.master);
        collection.parentCollection = this;
        if ( collection.isValid && await collection.startSync() ){
          this.add(collection);
          await this.showAll();
        }
      }
    }
  }


  async listAllStorageFiles(path = this.path){
    if (path == null) return null;
    let array = [];
    try{
      let ref = firebase.storage().ref().child(path);
      let list = await ref.listAll();

      if (list == null) return null;

      for ( var prefix of list.prefixes ){
        let sublist = await this.listAllStorageFiles(prefix.fullPath);
        if (sublist != null) array = array.concat(sublist);
      }

      for (var item of list.items ){
        array.push(item.fullPath);
      }

      return array;
    }catch(e){
      console.log(e);
      return null
    }
  }

  //Stop syncing with firebase
  async stopSync(){
    try{
      await firebase.database().ref(this.path).off();
      this._synced = false;
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  async deleteItemFromCloud(item){
    if ( this.containsItem(item) ){
      if ( Object.keys(this._collection).length === 1 ){
        if (this.parentCollection === null){
          await this._deleteItemFromCloud(item)
        }else{
          await this.deleteFromCloud();
        }
      }else{
        await this._deleteItemFromCloud(item);
      }
    }
  }

  async _deleteItemFromCloud(item){
    if (item.path === null) return;

    let files = await this.listAllStorageFiles(item.path);
    if (files !== null) {
      for (var file of files){
        try{
          await firebase.storage().ref().child(file).delete();
        }catch(e){
          console.log(e);
        }
      }
    }
    try{
      firebase.database().ref(item.path).remove();
    }catch(e){
      console.log(e);
    }
  }

  async deleteFromCloud(){
    if (this.parentCollection !== null) {
      this.parentCollection.deleteItemFromCloud(this);
    }
  }

  //Removes either a collection or model
  remove(item){
    if (SvgPlus.is(item, Collection) || SvgPlus.is(item, Model)){
      delete this._collection[item.name];
      item.parentCollection = null;
      this.removeElement(item);

      if (Object.keys(this._collection).length == 0 && this.parentCollection !== null){
        this.parentCollection.remove(this);
      }
    }
  }

  //Adds either a collection or model
  add(item, name = item.name){
    if (this._collection == null) {
      this._collection = {};
    }
    if (SvgPlus.is(item, Model) && (item.isValid || item.synced)){
      if (this._mode == null || this._mode === 'models'){

        if (this._collection == null) this._collection = {};
        this._mode = 'models'
        this.pushElement(item);

        item.parentCollection = this;
        this._collection[name] = item;
      }
    }else if (SvgPlus.is(item, Collection) && (item.isValid || item.synced)){
      if (this._mode == null || this._mode === 'category'){

        if (this._collection == null) this._collection = {};
        this._mode = 'category';
        this.pushElement(item)

        item.parentCollection = this;
        this._collection[name] = item;
      }
    }
    if (Object.keys(this._collection).length == 0){
      this._collection = null;
    }
  }

  containsItem(item){
    if ( SvgPlus.is(item, Model) || SvgPlus.is(item, Collection) ){
      if (item.name in this._collection){
        return item === this._collection[item.name];
      }
    }
    return false;
  }

  trash(){
    if (this.parentCollection !== null){
      this.parentCollection.remove(this)
    }
  }

  set selected(bool){
    if (bool) {
      this.headerTitle.styles = {
        'text-decoration': 'underline',
      }
      this._selected = true;
    }else{
      this.headerTitle.styles = {
        'text-decoration': 'none',
      }
      this._selected = false;
    }
  }
  get selected(){
    return this._selected;
  }

  set json(json){
    this.clear();
    if (json === null || json instanceof File || typeof json !== 'object' || typeof json === 'string') return;

    for (var key in json) {

      let value = json[key];

      if ( contains(key, 'thumbnail') ){
        this.thumbnail = value;
      }else{
        let model = new Model(value, key, this.master);

        if (model.isValid) {
          this.add(model)
        }else{
          let subcollection = new Collection(value, key, this.master);
          if (subcollection.isValid){
            this.add(subcollection)
          }
        }
      }
    }
  }

  set thumbnail(thumbnail){
    if (isURL(thumbnail) || isImage(thumbnail)){
      this._thumbnail = thumbnail;
    }else{
      this._thumbnail = null;
    }
  }

  get thumbnail(){
    return this._thumbnail;
  }

  set name(name){
    this.headerTitle.innerHTML = name;
    this._name = name;
  }

  get name(){
    return this._name;
  }

  get isValid(){
    return this._collection !== null;
  }

  set parentCollection(collection){
    if (SvgPlus.is(collection, Collection)){
      this._parentCollection = collection;
    }else{
      this._parentCollection = null;
    }
  }
  get parentCollection(){
    return this._parentCollection;
  }

  get path(){
    if (this.parentCollection == null){
      return this.name;
    }else{
      return this.parentCollection.path + '/' + this.name;
    }
  }

  get synced(){
    return !!this._synced;
  }
}

class ThumbnailLoader extends SvgPlus{
  constructor(master, collection){
    super('DIV');
    this.class = "thumbnail-loader"

    this._name = this.createChild('H1');

    this._imageLoader = new ImageLoader(master, collection);
    this.appendChild(this._imageLoader);

    this.master = master;
    this.collection = collection;
  }

  set name(name){
    this._name.innerHTML = name;
  }

  set collection(collection){
    if (SvgPlus.is(collection, Collection)){
      this._collection = collection;
      this.name = collection.name;
    }
  }

  get collection(){
    return this._collection;
  }

}

class ImageLoader extends SvgPlus{
  constructor(master, collection){
    super('DIV');
    this.styles = {
      position: "relative"
    }

    this.master = master;

    this._input = this.createChild("INPUT");
    this._input.props ={
      type: "file",
      accept: "image/*",
      style: {
        display: "none"
      }
    }
    this.styles = {display: "none"}
    this._thumbnailImg = this.createChild('IMG');
    this._thumbnailImg.onload = () => {
      this.styles = {display: "inherit"}
    }
    this.thumbnail = '../Assets/thumbnail.jpg';

    this._upload = new Arrow();
    this._upload.styles = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: 'translate(-50%, -50%) scale(3)',
      transition: "0.3s cubic-bezier(0.3642, 0, 0.6358, 1) transform",
      cursor: "pointer"
    }

    this._status = new SvgPlus('DIV');
    this._status.styles = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: 'translate(-50%, -50%)',
      'line-height': '3em',
      width: '3em',
      'text-align': 'center',
      background: '#0008',
      color: 'white',
      'border-radius': '1.5em'
    }
    this.collection = collection;

    this.appendChild(this._upload)
  }

  set status(num){
    if (num === false) {
      if ( !this.contains(this._upload) )this.appendChild(this._upload)
      if ( this.contains(this._status) )this._status.remove();
      return;
    }

    num = parseInt(num);
    if (Number.isNaN(num)){
      if ( this.contains(this._upload) )this._upload.remove();
      if ( this.contains(this._status) )this._status.remove();
      return;
    }

    this._status.innerHTML = num + '%';
    if ( this.contains(this._upload) )this._upload.remove();
    if ( !this.contains(this._status) )this.appendChild(this._status);
  }


  async onclick(){
    let files = await this.getInputFiles();
    if (files.length === 1){
      let thumbnailFile = files[0];
      if (thumbnailFile.size < 300000){
        if (await this.uploadToCloud(thumbnailFile) ){
          this.status = true;
          console.log('uploaded thumbnail to ' + this.collection.name);
        }else{
          alert("An error occured whilst uploading");
          this.status = false;
        }
      }else{
        alert("Image size must be less than 300Kb");
      }
    }
  }

  async getInputFiles(){
    return new Promise((resolve, reject) => {
      this._input.oninput = (e) => {
        resolve(this._input.files);
      }
      this._input.click();
    })
  }

  async uploadToCloud(file){
    if ( !(file instanceof File )) return false;
    let path = this.path;
    if (path === null){
      return false;
    }

    let name = file.name.split(/\./);
    if (name.length === 2) name = "thumbnail." + name[1];

    let link = await uploadFileToCloud(file, path, (status) => {
      this.status = status;
    }, name);

    if (link !== null) {
      this.thumbnail = link;
      try{
        await firebase.database().ref(path + '/thumbnail').set(link);
        return true;
      }catch(e){
        console.log(e);
        return false;
      }
    }
  }

  onmouseover(){
    this._upload.styles = {
      transform: 'translate(-50%, -50%) scale(5)',
    }
  }

  onmouseleave(){
    this._upload.styles = {
      transform: 'translate(-50%, -50%) scale(3)',
    }
  }


  get path(){
    if (this.collection !== null){
      return this.collection.path;
    }else{
      return null;
    }
  }

  set collection(collection){
    if ( SvgPlus.is(collection, Collection) ){
      this._collection = collection;
      this.thumbnail = collection.thumbnail;
    }else{
      this._collection = null;
    }
  }

  get collection(){
    return this._collection;
  }


  set thumbnail(url){
    this._thumbnailImg.props = {
      src: url
    }
    this._thumbnail = url;
  }
  get thumbnail(){
    return this._thumbnail
  }

}

export {Collection, ThumbnailLoader}

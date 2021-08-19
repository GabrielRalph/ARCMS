import {SvgPlus} from '../3.js'

import {uploadFileToCloud, deleteFilesFromCloud, contains, isImage, isURL, getExt} from '../Utilities/Functions.js'
import {VList} from '../Utilities/VList.js'
import {Arrow} from '../Utilities/Icons.js'
import {Model, LiveModel} from './Model.js'

class Collection extends VList{
  constructor(json = null, name = '', master){
    super(name, master);
    this.class = "collection"

    this._parentCollection = null;
    this._collection = null;
    this._mode = null;
    this._thumbnail = null;

    this.json = json;
  }

  ontitleclick(){
    this.runEvent('oncollectionclick', this)
  }

  trash(){
    if (this.parentCollection !== null){
      this.parentCollection.remove(this);
    }
  }

  async uploadToCloud(){
    if ( !this.isValid )return;

    for (var key in this._collection){
      let item = this._collection[key];
      if ( !(await item.uploadToCloud()) ){
        return false;
      }
    }

    return true;
  }

  async deleteFromCloud(){
    return await deleteFilesFromCloud(this.path);
  }

  //Removes either a collection or model
  remove(item){
    if (SvgPlus.is(item, Collection) || SvgPlus.is(item, Model)){
      delete this._collection[item.name];
      item.parentCollection = null;
      this.removeElement(item);

      if (!this.isValid && this.parentCollection !== null){
        this.parentCollection.remove(this);
      }
    }
  }

  //Adds either a collection or model
  add(item){
    if ( ( SvgPlus.is(item, Collection) || SvgPlus.is(item, Model) ) && item.isValid ){
      this.addElement(item);
      item.parentCollection = this;
      this._collection[item.name] = item;
    }
  }

  get uploading(){
    for (var key in this._collection){
      if (this._collection[key].uploading) return true;
    }
    return false;
  }

  set json(json){
    this.clear();
    this._collection = {};

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


    this.show();
  }

  //Set and get thumbnail
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

  //returns true if there are more than one valid models or collections
  get isValid(){
    return  this.count > 0;
  }

  //set and get parent collection
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


  //get path of this collection
  get path(){
    if (this.name === null) return null;
    if (this.parentCollection == null) return this.name;
    return this.parentCollection.path + '/' + this.name;
  }

  get fireRef(){
    if (this.name === null) return null;
    return firebase.database().ref(this.path);
  }

  get count(){
    return Object.keys(this._collection).length;
  }

  get filesAreValid(){
    for (var key in this._collection){
      if (this._collection[key].filesAreValid) return true;
    }
    return false;
  }
}

class CollectionInfoForm extends SvgPlus{
  constructor(collection){
    super('DIV');
    this.class = 'info-form'
    this._name = this.createChild('H1');

    this._imageLoader = new ImageLoader(collection);
    this.appendChild(this._imageLoader);

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
  constructor(item){
    super('DIV');
    this._path = null;

    this.styles = {
      position: "relative"
    }

    this._input = this.createChild("INPUT");
    this._input.props ={
      type: "file",
      accept: "image/png, image/jpeg",
      style: {
        display: "none"
      }
    }
    this.styles = {display: "none"}

    this._thumbnailImg = this.createChild('IMG');
    this._thumbnailImg.styles = {
      width: '100%'
    }
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

    this.item = item;

    this.appendChild(this._upload)
  }

  set item(item){
    if (item === null || typeof item !== 'object') return;

    if ('thumbnail' in item){
      this.thumbnail = item.thumbnail;
    }

    if ('path' in item){
      this._path = item.path;
    }

    this._item = item;
  }

  get item(){
    return this._item;
  }

  get path(){
    return this._path;
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
      if (thumbnailFile.size < 2000000){
        if (await this.uploadToCloud(thumbnailFile) ){
          this.status = true;
          console.log('uploaded thumbnail to ' + this.item.name);
        }else{
          alert("An error occured whilst uploading");
          this.status = false;
        }
      }else{
        alert("Image size must be less than 2mb");
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

    let name = "thumbnail" + getExt(file);

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

class LiveCollection extends Collection{

  async startSync(){
    if ( this.synced ) return false;
    if ( this.fireRef === null ) return false;
    return new Promise(async (resolve, reject) => {
      try{
        await this.fireRef.on('child_added', async (sc) => {
          if (sc.key == 'thumbnail'){
            this.thumbnail = sc.val();
          }else{
            await this._onSyncChildAdded(sc);
            resolve(this.isValid);
          }
        })
        await this.fireRef.on('child_removed', (sc) => {
          this._onSyncChildRemoved(sc);
        })

        await this.fireRef.child('thumbnail').on('value', (sc) => {
          this.thumbnail = sc.val();
        })

        this._synced = true;
      }catch(e){
        resolve(false);
        this._synced = false;
      }

      setTimeout(() => {
        resolve(false)
        this._synced = false;
       }, 5000);
    })
  }

  async _onSyncChildAdded(sc){
    let model = new LiveModel(null, sc.key, this.master);
    model.parentCollection = this;
    if (await model.startSync()){
      this.add(model);
      return true;
    }

    let collection = new LiveCollection(null, sc.key, this.master);
    collection.parentCollection = this;
    if (await collection.startSync()){
      this.add(collection);
      return true;
    }
    return false;
  }

  async _onSyncChildRemoved(sc){
    let key = sc.key;
    if (key in this._collection){
      let item = this._collection[key];
      item.stopSync();

      if (this.count == 1){
        if (this.parentCollection !== null){
          await this.deleteFromCloud();
        }
      }else{
        this.remove(this._collection[key])
      }
    }
  }

  async stopSync(){
    if ( !this.synced ) return false;
    try{
      await this.fireRef.off();
      this._synced = false;
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  get synced(){
    return !!this._synced;
  }
}

export {Collection, ImageLoader, LiveCollection, CollectionInfoForm}

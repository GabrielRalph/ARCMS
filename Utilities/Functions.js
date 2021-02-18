function isJSON(json){
  if (json === null) return false;

  if (json instanceof File) {
    return false;
  }

  if (typeof json === 'object') {
    return true;
  }

  return false;
}

async function loadURL(file){
  if (!(file instanceof File)) return null;
  return new Promise((resolve, reject) => {
    var reader  = new FileReader();

    // listen for 'load' events on the FileReader
    reader.addEventListener("load",  () => {
      resolve(reader.result)
    }, false);

    // if there's a file, tell the reader to read the data
    // which triggers the load event above
    reader.readAsDataURL(file);

    setTimeout(() => {resolve(null)}, 1000);

  })
}

async function listAllStorageFiles(path){
  if (path == null) return null;
  let array = [];
  try{
    let ref = firebase.storage().ref().child(path);
    let list = await ref.listAll();

    if (list == null) return null;

    for ( var prefix of list.prefixes ){
      let sublist = await listAllStorageFiles(prefix.fullPath);
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

async function deleteFilesFromCloud(path){
  let files = await listAllStorageFiles(path);
  if (files === null) return false;

  for ( var file of files ){
    try{
      await firebase.storage().ref().child(file).delete();
    }catch(e){
      console.log(e);
    }
  }

  try{
    await firebase.database().ref(path).remove();
    return true;
  }catch(e){
    console.log(e);
    return false;
  }
}


function getExt(file){
  if (file instanceof File){
    let filename = file.name.split(".");
    if (filename && filename.length > 1){
      return "." + filename[filename.length - 1]
    }
  }
  return "";
}

//isFBX returns true if the given param is an FBX file
function isFBX(file){
  if (file instanceof File){
    return (/\.fbx$/).test(file.name)
  }
  return false;
}

//isUSDZ returns true if the given param is an USDZ file
function isUSDZ(file){
  if (file instanceof File){
    return (/\.usdz$/).test(file.name)
  }
  return false;
}

//isGLB returns true if the given param is a GLB file
function isGLB(file){
  if (file instanceof File){
    return (/\.glb$/).test(file.name)
  }
  return false;
}

//Returns true is a string is a url
function isURL(str) {
  if (typeof str !== 'string') return false;
  var pattern = new RegExp('^(https?:\\/\\/firebasestorage)'); // fragment locator
  return !!pattern.test(str);
}

//Returns true if param is an image file
function isImage(image) {
  if (image instanceof File) {
    return (/^image/).test(image.type);
  }else{
    return false;
  }
}

function isThumbanil(thumbnail){
  if ( isImage(thumbnail) ) {
    return contains(thumbnail.name, 'thumbnail');
  }
  return false;
}

//Check string contains substring
function contains(string, value){
  let regex = new RegExp(value);
  return regex.test(string)
}

// Upload file to firebase storage bucket
async function uploadFileToCloud(file, path, statusCallback, filename = file.name){
  path = `${path}`
  if ( !(file instanceof File) || typeof path !== 'string' ){
    console.log('invalid file');
    return null;
  }
  return new Promise((resolve, reject) => {

    try{
      var uploadTask = firebase.storage().ref().child(path + '/' + filename).put(file);
    }catch(e){
      console.log(e);
      resolve(null)
    }

    uploadTask.on('state_changed', (snapshot) => {

      // Observe state change events such as progress, pause, and resume
      let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      if (statusCallback instanceof Function) {
        statusCallback(progress);
      }

    }, function(error) {
      resolve(null);
    }, function() {
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        resolve(downloadURL);
      });
    });
  })
}

export {loadURL, deleteFilesFromCloud, listAllStorageFiles, isJSON, getExt, isThumbanil, isGLB, isUSDZ, isFBX, isURL, isImage, uploadFileToCloud, contains}

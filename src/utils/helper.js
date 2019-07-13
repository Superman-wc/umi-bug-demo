export function isInternalAuthority(id, appId = '') {
  return ['ROLE_ADMIN', 'ROLE_APPADMIN', 'ROLE_DEFAULT', 'ROLE_USER', `ROLE_${appId.toUpperCase()}_ADMIN`].indexOf(id) >= 0;
}

export function isAdminAuthority(id, appId = '') {
  return ['ROLE_ADMIN', 'ROLE_APPADMIN', `ROLE_${appId.toUpperCase()}_ADMIN`].indexOf(id) >= 0;
}

export function toArray(list) {
  return Array.prototype.slice.call(list || [], 0);
}

export function copyFields(object={}, fields=[]){
  return fields.reduce((map, key)=>{
    map[key] = object[key];
    return map;
  }, {})
}

export function delay(time=0){
  return new Promise(resolve=>setTimeout(resolve, time));
}

export function inElectron(){
  const match = navigator.userAgent.match(/(Electron)\/(\d+\.\d+\.\d+)/);
  if(match){
    return {[match[1]]: match[2]};
  }
  return null;
}

export function inMac(){
  const match = navigator.userAgent.match(/(Mac OS X) (\d+\_\d+\_\d+)/);
  if(match){
    return {[match[1]]: match[2]};
  }
  return null;
}


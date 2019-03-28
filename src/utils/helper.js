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

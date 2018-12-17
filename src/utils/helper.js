export function isInternalAuthority(id, appId = '') {
  return ['ROLE_ADMIN', 'ROLE_APPADMIN', 'ROLE_DEFAULT', 'ROLE_USER', `ROLE_${appId.toUpperCase()}_ADMIN`].indexOf(id) >= 0;
}

export function isAdminAuthority(id, appId = '') {
  return ['ROLE_ADMIN', 'ROLE_APPADMIN', `ROLE_${appId.toUpperCase()}_ADMIN`].indexOf(id) >= 0;
}

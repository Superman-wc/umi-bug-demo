import request from '../utils/request';


export async function login(data) {
  return request('/admin/1.0/login', {data, method: 'POST'});
}

export async function modify(data) {
  return request('/admin/1.0/login/modify-password', {data, method: 'PUT'});
}


export async function item({id}) {
  return request('/admin/api/auth/profile/' + id, {method: 'GET'});
}

export async function create(data) {
  return request('/admin/api/auth/profile', {data, method: 'POST'});
}





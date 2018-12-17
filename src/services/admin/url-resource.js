import request from '../../utils/request';

export async function list(data) {
  return request('/api/1.0/admin/urlResource', {data: {s: 30, ...data}, method: 'GET'});
}

export async function all(data) {
  return request('/api/1.0/admin/urlResource', {data: {s: 10000, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/1.0/admin/urlResource/' + id, {method: 'GET'});
}

export async function modify(data) {
  return request('/api/1.0/admin/urlResource/' + data.id, {data, method: 'PUT'});
}

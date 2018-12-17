import request from '../../utils/request';

export async function list(data) {
  return request('/api/1.0/admin/authority', {data: {s: 30, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/1.0/admin/authority/' + id, {method: 'GET'});
}

export async function modify(data) {
  return request('/api/1.0/admin/authority/' + data.id, {data, method: 'PUT'});
}


export async function create(data) {
  return request('/api/1.0/admin/authority', {data, method: 'POST'});
}


export async function remove({id}) {
  return request('/api/1.0/admin/authority/' + id, {method: 'DELETE'});
}

import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/klass', {data: {s: 30, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/8queen/klass/' + id, {method: 'GET'});
}

export async function modify(data) {
  return request('/api/8queen/klass/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/8queen/klass', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/8queen/klass/' + id, {method: 'DELETE'});
}

export async function excelImport({excelUrl}) {
  return request('/api/8queen/klass/import', {data: {excelUrl}, method: 'POST'})
}


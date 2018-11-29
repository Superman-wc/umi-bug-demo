import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/room', {data: {s: 30, ...data}, method: 'GET'});
}

export async function modify(data) {
  return request('/api/8queen/room/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/8queen/room', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/8queen/room/' + id, {method: 'DELETE'});
}

export async function excelImport({excelUrl}) {
  return request('/api/8queen/room/import', {data: {excelUrl}, method: 'POST'});
}

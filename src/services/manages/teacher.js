import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/teacher', { data: { s: 30, ...data }, method: 'GET' });
}

export async function modify(data) {
  return request('/api/8queen/teacher/' + data.id, { data, method: 'PUT' });
}

export async function create(data) {
  return request('/api/8queen/teacher', { data, method: 'POST' });
}

export async function remove({ id }) {
  return request('/api/8queen/teacher/' + id, { method: 'DELETE' });
}

export async function excelImport({excelUrl}){
  return request('/api/8queen/teacher/import', {data:{excelUrl}, method:'POST'})
}

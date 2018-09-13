import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/school', { data: { s: 30, ...data }, method: 'GET' });
}

export async function modify(data) {
  return request('/api/8queen/school/' + data.id, { data, method: 'PUT' });
}

export async function create(data) {
  return request('/api/8queen/school', { data, method: 'POST' });
}

export async function remove({ id }) {
  return request('/api/8queen/school/' + id, { method: 'DELETE' });
}

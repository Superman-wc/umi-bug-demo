import request from '../../utils/request';

export async function list(data) {
  return request('/api/hii/1.0/admin/school/adminBuilding', {data: {s: 30, ...data}, method: 'GET'});
}

export async function modify(data) {
  return request('/api/hii/1.0/admin/school/adminBuilding/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/hii/1.0/admin/school/adminBuilding', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/hii/1.0/admin/school/adminBuilding/' + id, {method: 'DELETE'});
}

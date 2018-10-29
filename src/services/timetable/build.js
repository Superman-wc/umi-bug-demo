import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/lecture_plan', {data, method: 'GET'});
}

export async function modify(data) {
  return request('/api/8queen/lecture_plan/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/8queen/lecture_plan', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/8queen/lecture_plan/' + id, {method: 'DELETE'});
}


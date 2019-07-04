import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/lecture/teacher', {data, method: 'GET'});
}

export async function modify(data) {
  return request('/api/8queen/lecture/' + data.id + '/op/substitute', {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/8queen/lecture/teacher', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/8queen/lecture/teacher/' + id, {method: 'DELETE'});
}

export async function available({id}) {
  return request(`/api/8queen/lecture/${id}/op/available`, {method: 'GET'});
}


export async function swap(data) {
  return request(`/api/8queen/lecture/${data.id}/op/swap`, {data, method: 'PUT'});
}

export async function cancel(data){
  return request(`/api/8queen/lecture/${data.id}/op/cancel`, {data, method: 'PUT'});
}

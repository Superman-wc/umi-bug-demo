import request from '../../utils/request';


export async function list(data) {
  return request('/api/examiner/1.0/sheet', {data: {s: 30, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/examiner/1.0/sheet/' + id, {method: 'GET'});
}

export async function modify(data) {
  return request('/api/examiner/1.0/sheet/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/examiner/1.0/sheet', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/examiner/1.0/sheet/' + id, {method: 'DELETE'});
}

export async function analyze({id}) {
  return request('/api/examiner/1.0/analyze/'+id, {method: 'GET'});
}
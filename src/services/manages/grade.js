import request from '../../utils/request';
import gradeCache from '../../caches/manages/grade';

export async function list(data) {
  return request('/api/8queen/grade', { data: { s: 30, ...data }, method: 'GET' });
}

export async function modify(data) {
  return request('/api/8queen/grade/' + data.id, { data, method: 'PUT' }).then(res=>{
    gradeCache.clear();
    return res;
  });
}

export async function create(data) {
  return request('/api/8queen/grade', { data, method: 'POST' }).then(res=>{
    gradeCache.clear();
    return res;
  });
}

export async function remove({ id }) {
  return request('/api/8queen/grade/' + id, { method: 'DELETE' }).then(res=>{
    gradeCache.clear();
    return res;
  });
}

import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/subject', {data: {s: 30, ...data}, method: 'GET'});
}


export async function create({subjectIds}) {
  return request('/api/8queen/subject', {data: {subjectIds}, method: 'POST'});
}


export async function all() {
  return request('/api/8queen/subject-all', {method: 'GET'});
}

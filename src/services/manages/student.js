import request from '../../utils/request';

export async function list(data) {
  return request('/api/8queen/student', {data: {s: 30, ...data}, method: 'GET'});
}

export async function modify(data) {
  return request('/api/8queen/student/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/8queen/student', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/8queen/student/' + id, {method: 'DELETE'});
}

export async function excelImport({klassId, gradeId, studentImportList}) {
  return request('/api/8queen/student/import', {data: {klassId, gradeId, studentImportList}, method: 'POST'})
}

export async function position({klassId, studentId, type=1,}) {
  return request('/api/hii/1.0/admin/school/studentPosition', {data: {studentId, unitId: klassId, type,}, method: 'GET'})
}

import request from '../../utils/request';

/**
 * 教师列表
 * @param gradeId 年级ID
 * @param subjectId 科目ID
 * @param p 分页页码
 * @param s 分页大小
 * @returns {Promise<*>}
 */
export async function list({gradeId, subjectId, p = 1, s = 30} = {}) {
  return request('/api/8queen/teacher', {data: {gradeId, subjectId, p, s}, method: 'GET'});
}

export async function modify(data) {
  return request('/api/8queen/teacher/' + data.id, {data, method: 'PUT'});
}

export async function create(data) {
  return request('/api/8queen/teacher', {data, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/8queen/teacher/' + id, {method: 'DELETE'});
}

export async function excelImport({teacherImportList}) {
  return request('/api/8queen/teacher/import', {data: {teacherImportList}, method: 'POST'})
}

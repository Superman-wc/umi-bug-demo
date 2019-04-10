import request from '../../utils/request';

/**
 * 考务教室列表
 * @param {type} 1-教学  2-宿舍
 */
export async function doorPlate({type}) {
  return request('/api/8queen/doorPlate', {data: {type}, method: 'GET'})
}

/**
 * 教师列表
 * @param {gradeIndex}
 */
export async function teachersByGradeIndex({gradeIndex}) {
  return request('/api/8queen/teacher', {data: {gradeIndex, s: 10000}, method: 'GET'})
}

/**
 * 考务安排提交
 * endDay 结束日期（时间戳）
 * examType
 * name 当前考务名称
 * startDay 开始日期
 * uuid
 */
export async function createExam(data) {
  return request('/api/8queen/exam/operate', {data, method: 'POST'});
}

/**
 * 考试场地-教师更新
 */
export async function updateTeacher(data) {
  return request(`/api/8queen/exam/operate/${data.roomId}/${data.examinationSubjectId}`, {data, method: 'PUT'});
}

/**
 * 考试场地-教师删除
 */
export async function removeTeacher({roomId, examinationSubjectId, uuid}) {
  return request(`/api/8queen/exam/operate/${roomId}/${examinationSubjectId}/${uuid}`, {method: 'DELETE'});
}

/**
 * 智能分配学生
 * examinationInfoList  考务信息json字符串
 * gradeIndex  类型 10高一， 11高二， 12高三
 * uuid
 */
export async function distributionStudent(data) {
  return request('/api/8queen/exam/student', {data, method: 'POST'});
}

/**
 * 考试科目
 * gradeIndex  类型 10高一， 11高二， 12高三
 */
export async function listSubject(data) {
  return request('/api/8queen/exam/subject', {data, method: 'GET'});
}

/**
 * 教师列表
 * gradeIndex  年级ID
 * uuid
 */
export async function getTeacher({gradeIndex}) {
  return request('/api/8queen/exam/teacher', {data: {gradeIndex}, method: 'GET'});
}

/**
 * 考务创建-教师
 * monitorNum  监考数
 * uuid
 */
export async function distributionTeacher(data) {
  return request('/api/8queen/exam/teacher', {data, method: 'POST'});
}

/**
 * 考务管理列表
 * examType  考试类型 0-期末考  1-期中考  2-月考
 * gradeId 年级id
 * releaseStatus  1-发布  0-未发布
 */
export async function listExam(data) {
  return request('/api/8queen/examActive', {data: {s: 30, ...data}, method: 'GET'});
}

/**
 * 考务预览
 * id  考务id
 */
export async function examDetail(data) {
  return request('/api/8queen/examActive/' + data.id, {method: 'GET'});
}

/**
 * 考务导出
 * id  考务id
 */
export async function examDetailExport({id}) {
  return request('/api/8queen/examActive/export', {data: {id}, method: 'GET'});
}

/**
 * 考务上下线
 * id  考务id
 */
export async function examPublishOffline({id}) {
  return request('/api/8queen/examActive/' + id, {method: 'PUT'});
}

/**
 * 考务删除
 * id  考务id
 */
export async function examRemove({id}) {
  return request('/api/8queen/examActive/' + id, {method: 'DELETE'});
}

/**
 * 考务详情-教师更新
 * examinationPlaceId 考场id
 * teacherList  array[string]  教师id集合
 */
export async function updateTeacherInDetail(data) {
  return request(`/api/8queen/examActive/operate/${data.examinationPlaceId}`, {data, method: 'PUT'});
}

/**
 * 考务详情-教师删除
 * examinationPlaceId 考场id
 */
export async function removeTeacherInDetail({examinationPlaceId}) {
  return request(`/api/8queen/examActive/operate/${examinationPlaceId}`, {method: 'DELETE'});
}

/**
 * 考务学生
 * examinationPlaceId 考场id
 */
export async function listStudent(data) {
  return request('/api/8queen/examActive/student', {data, method: 'GET'});
}

/**
 * 考务教师
 * examinationPlaceId 考场id
 * examinationId  考务id
 */
export async function listTeacher(data) {
  return request('/api/8queen/examActive/teacher', {data, method: 'GET'});
}

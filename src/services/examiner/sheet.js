import request from '../../utils/request';


export async function list({editorId, p=1, s=30,}={}) {
  return request('/api/examiner/1.0/sheet', {data: {p, s, editorId}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/examiner/1.0/sheet/' + id, {method: 'GET'});
}

export async function modify(data) {
  return request('/api/examiner/1.0/sheet/' + data.id, {data, method: 'PUT'});
}

export async function create({url, sig}) {
  return request('/api/examiner/1.0/sheet', {data: {url, sig}, method: 'POST'});
}

export async function remove({id}) {
  return request('/api/examiner/1.0/sheet/' + id, {method: 'DELETE'});
}

export async function analyze({ids}) {
  return request('/api/examiner/1.0/analyze', {data: {ids}, method: 'GET'});
}

/**
 * 微信通知老师答题卡上传已经完成
 * @param unitId
 * @param editorId
 * @param unitName
 * @param editorTitle
 * @param subjectName
 * @returns {Promise<any>}
 */
export async function notifyToTeacher({unitId, editorId, unitName, editorTitle, subjectName}){
  console.log(`微信通知unitId=${unitId}editorId=${ editorId}, ${unitName}, ${subjectName}, ${editorTitle}`);
  return request('/api/hii/1.0/examinationNotify', {data:{unitId, editorId}, method:'POST'});
}

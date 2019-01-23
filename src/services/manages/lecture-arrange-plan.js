import request from "../../utils/request";

/**
 * 排课方案列表分页
 * @param gradeId 年级ID
 * @param semesterId 学期ID
 * @param p 分页页码
 * @param s 分页大小
 * @returns {Promise<*>}
 */
export async function list({gradeId, semesterId, p = 1, s = 30}) {
  return request('/api/8queen/lectureArrangePlan', {data: {gradeId, semesterId, p, s}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/8queen/lectureArrangePlan/' + id, {method: 'GET'});
}

/**
 * 选班排课方案发布
 * @param id  方案ID
 * @returns {Promise<*>}
 */
export async function release({id}) {
  return request('/api/8queen/arrangePlan/release', {data: {id}, method: 'POST'});
}

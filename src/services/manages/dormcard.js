import request from '../../utils/request';

/**
 * 宿舍卡列表
 *
 * @param data
 * @returns {Promise<*>}
 */
export async function list(data) {
  return request('/api/hii/1.0/admin/school/dormitoryCard', {data: {s: 30, ...data}, method: 'GET'});
}

/**
 * 开卡
 * @param id 学生id
 * @returns {Promise<*>}
 */
export async function modify({id}) {
  return request('/api/hii/1.0/admin/school/dormitoryCard/' + id, {data: {id}, method: 'PUT'});
}

import request from "../../utils/request";

/**
 * 分班方案列表分页
 * @param electionExamination 类型 false-学考 ture-选考
 * @param p                   当前页
 * @param s                   分页大小
 * @param gradeId             年级ID
 * @param semesterId          学期ID
 * @returns {Promise<*>}
 */
export async function list({electionExamination, p = 1, s = 30, gradeId, semesterId,}) {
  return request('/api/8queen/studentArrangePlan', {
    data: {electionExamination, p, s, gradeId, semesterId,},
    method: 'GET'
  });
}

export async function item({id}) {
  return request('/api/8queen/studentArrangePlan/' + id, {method: 'GET'});
}

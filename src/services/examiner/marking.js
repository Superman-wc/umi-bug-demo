import request from '../../utils/request';

/**
 * 手动阅卷
 * @param id              [必须] 答题卡ID
 * @param questionNum     [可选] 问题编号
 * @param studentId       [可选] 学生ID
 * @returns {Promise<any>}
 */
export async function item({id, questionNum, studentId}) {
  return request('/api/8queen/examiner/' + id, {data: {questionNum, studentId}, method: 'GET'});
}

/**
 * 阅卷给分
 * @param id              [必须] 答题卡题目记录ID
 * @param score           [必须] 得分
 * @returns {Promise<any>}
 */
export async function marking({id, score}) {
  return request('/api/8queen/examiner/record/' + id, {data: {score}, method: 'PUT'});
}

/**
 *
 * @param id              [必须] 答题卡ID
 * @param questionNum     [必须] 题号
 * @param auditStatus     [可选] 0-所有 1-未评分 2-已评分
 * @returns {Promise<any>}
 */
export async function student({id, questionNum, auditStatus}) {
  return request('/api/8queen/examiner/student', {
    data: {editorId: id, questionNum, auditStatus}, method: 'GET'
  }).then(res=>{
    if(res.result && res.result.list){
      console.log(res);
    }
    return res;
  });
}


export async function getDownloadUrl({id}) {
  return request('/api/8queen/examiner/export', {data: {id}, method: 'GET'});
}

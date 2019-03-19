import request from '../../utils/request';


export async function list(data) {
  return request('/api/hii/1.0/admin/school/wenYin', {data: {s: 30, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/hii/1.0/admin/school/wenYin/' + id, {method: 'GET'});
}

export async function modify(data) {
  return request('/api/hii/1.0/admin/school/wenYin/' + data.id, {data, method: 'PUT'});
}

export async function notice({id, status}){
  return request('/api/hii/1.0/admin/school/wenYin/' + id, {data:{status}, method: 'PATCH'});
}

/**
 *
 * @param editorId  答题卡Id
 * @param name      答题卡名称
 * @param requirement 打印要求
 * @param count 打印数量
 * @param fileUrl 文件地址
 * @returns {Promise<*>}
 */
export async function create({editorId, name, requirement, count, fileUrl}) {
  return request(
    '/api/hii/1.0/admin/school/wenYin',
    {
      data: {
        examinerEditorId: editorId,
        name,
        requirement,
        num: count,
        fileUrl,
      },
      method: 'POST'
    }
  );
}

export async function remove({id}) {
  return request('/api/hii/1.0/admin/school/wenYin/' + id, {method: 'DELETE'});
}


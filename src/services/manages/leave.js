import request from '../../utils/request';

export async function list(data) {
  return request('/api/hii/1.0/admin/askForLeave', {data: {dateTime: Date.now(), s: 30, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/hii/1.0/admin/askForLeave/' + id, {method: 'GET'});
}

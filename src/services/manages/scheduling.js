import request from '../../utils/request';

export async function create(data) {
  return request('/api/8queen/online_lecture/normal', {
    data: {
      config: JSON.stringify(data)
    }, method: 'POST'
  })
}

import request from '../../utils/request';

function transform(item){
  try {
    if (item.data) {
      item.data = JSON.parse(item.data);
    }
    if (item.print) {
      item.print = JSON.parse(item.print);
    }
    if (item.pages) {
      item.pages = JSON.parse(item.pages);
    }
  }catch(ex){
    console.error(ex);
  }
  return item;
}

export async function list(data) {
  return request('/api/examiner/1.0/answer', {data: {s: 30, ...data}, method: 'GET'});
}

export async function item({id}) {
  return request('/api/examiner/1.0/answer/' + id, {method: 'GET'}).then(res=>{
    if(res.result){
      res.result = transform(res.result);
    }
    return res;
  });
}

export async function modify(data) {
  return request('/api/examiner/1.0/answer/' + data.id, {data, method: 'PUT'}).then(res=>{
    if(res.result){
      res.result = transform(res.result);
    }
    return res;
  });
}

export async function create(data) {
  return request('/api/examiner/1.0/answer', {data, method: 'POST'}).then(res=>{
    if(res.result){
      res.result = transform(res.result);
    }
    return res;
  });
}

export async function remove({id}) {
  return request('/api/examiner/1.0/answer/' + id, {method: 'DELETE'});
}

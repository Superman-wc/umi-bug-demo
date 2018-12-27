import request from '../utils/request';


export async function login(data) {
  return request('/api/1.0/admin/authenticate', {data, method: 'POST'});
}

export async function item({id}) {
  return request('/admin/api/auth/profile/' + id, {method: 'GET'});
}

export async function create(data) {
  return request('/admin/api/auth/profile', {data, method: 'POST'});
}

export async function modify(data) {
  return request('/admin/api/auth/profile/' + data.id, {data, method: 'PUT'});
}

export async function menu(data) {
  return request('/api/1.0/admin/auth/menu/my-menu', {data,method: 'GET'}).then(res=>{
    if(res.result.menus){
      res.result.menus.push({
        category: "管理",
        controllerName: "/manages/device",
        id: -1,
        link: "/manages/device",
        title: "设备管理",
      });
      res.result.menus.push({
        category: "管理",
        controllerName: "/manages/notice",
        id: -2,
        link: "/manages/notice",
        title: "新闻公告",
      });
      res.result.menus.push({
        category: "排课",
        controllerName: "/timetable/build",
        id: -2,
        link: "/timetable/build",
        title: "构建课表",
      });
    }
    return res;
  });
}

export async function dataImportPermission() {
  return request('/admin/api/auth/dataImport/permission/my-permission', {method: 'GET'});
}

export async function admissionRebuildCheck(){
  return request('/admin/api/auth/admission/rebuild/check', {method:'GET'});
}

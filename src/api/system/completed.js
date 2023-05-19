import request from '@/utils/request'

// 查询已办列表
export function listCompleted(query) {
  return request({
    url: '/system/task/list',
    method: 'get',
    params: query
  })
}

// 查询已办详细
export function getCompleted(id) {
  return request({
    url: '/system/completed/' + id,
    method: 'get'
  })
}

// 新增已办
export function addCompleted(data) {
  return request({
    url: '/system/completed',
    method: 'post',
    data: data
  })
}

// 修改已办
export function updateCompleted(data) {
  return request({
    url: '/system/completed',
    method: 'put',
    data: data
  })
}

// 删除已办
export function delCompleted(id) {
  return request({
    url: '/system/completed/' + id,
    method: 'delete'
  })
}

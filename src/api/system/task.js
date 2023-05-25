import request from '@/utils/request'

// 查询待办列表
export function listTask(query) {
  return request({
    url: '/system/task/list',
    method: 'get',
    params: query
  })
}

// 查询待办详细
export function getTask(id) {
  return request({
    url: '/system/task/' + id,
    method: 'get'
  })
}

// 根据用户 ID 和是否已支付查询详细项目信息
export function listByCollaboratorId(query) {
  return request({
    url: '/system/task/selectAllByCollaboratorId',
    method: 'get',
    params: query,
  })
}

// 新增待办
export function addTask(data) {
  return request({
    url: '/system/task',
    method: 'post',
    data: data
  })
}

// 修改待办
export function updateTask(data) {
  return request({
    url: '/system/task',
    method: 'put',
    data: data
  })
}

// 删除待办
export function delTask(id) {
  return request({
    url: '/system/task/' + id,
    method: 'delete'
  })
}

// 完成待办
export function paymentProject(id) {
  return request({
    url: '/system/task/updateIsCompleteById',
    method: 'post',
    params: {
      id: id
    }
  })
}

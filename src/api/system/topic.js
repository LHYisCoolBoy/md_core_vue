import request from '@/utils/request'

// 查询题目列表
export function listTopic(query) {
  return request({
    url: '/system/topic/list',
    method: 'get',
    params: query
  })
}

// 查询题目详细
export function getTopic(id) {
  return request({
    url: '/system/topic/' + id,
    method: 'get'
  })
}

// 新增题目
export function addTopic(data) {
  return request({
    url: '/system/topic',
    method: 'post',
    data: data
  })
}

// 修改题目
export function updateTopic(data) {
  return request({
    url: '/system/topic',
    method: 'put',
    data: data
  })
}

// 删除题目
export function delTopic(id) {
  return request({
    url: '/system/topic/' + id,
    method: 'delete'
  })
}

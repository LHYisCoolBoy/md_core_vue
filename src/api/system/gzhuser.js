import request from '@/utils/request'

// 查询公众号用户名列表
export function listGzhuser(query) {
  return request({
    url: '/system/gzhuser/list',
    method: 'get',
    params: query
  })
}

// 查询公众号用户名详细
export function getGzhuser(id) {
  return request({
    url: '/system/gzhuser/' + id,
    method: 'get'
  })
}

// 新增公众号用户名
export function addGzhuser(data) {
  return request({
    url: '/system/gzhuser',
    method: 'post',
    data: data
  })
}

// 修改公众号用户名
export function updateGzhuser(data) {
  return request({
    url: '/system/gzhuser',
    method: 'put',
    data: data
  })
}

// 删除公众号用户名
export function delGzhuser(id) {
  return request({
    url: '/system/gzhuser/' + id,
    method: 'delete'
  })
}

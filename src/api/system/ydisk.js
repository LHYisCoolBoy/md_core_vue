import request from '@/utils/request'

// 查询捷电网盘列表
export function listYdisk(query) {
  return request({
    url: '/system/ydisk/list',
    method: 'get',
    params: query
  })
}

// 查询捷电网盘详细
export function getYdisk(id) {
  return request({
    url: '/system/ydisk/' + id,
    method: 'get'
  })
}

// 新增捷电网盘
export function addYdisk(data) {
  return request({
    url: '/system/ydisk',
    method: 'post',
    data: data
  })
}

// 修改捷电网盘
export function updateYdisk(data) {
  return request({
    url: '/system/ydisk',
    method: 'put',
    data: data
  })
}

// 删除捷电网盘
export function delYdisk(id) {
  return request({
    url: '/system/ydisk/' + id,
    method: 'delete'
  })
}

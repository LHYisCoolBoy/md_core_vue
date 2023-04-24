import request from '@/utils/request'

// 查询推荐配置列表
export function listMdconfig(query) {
  return request({
    url: '/system/mdconfig/list',
    method: 'get',
    params: query
  })
}

//文章下拉选项接口
export function optonlist(query) {
  return request({
    url: '/system/essay/nameList',
    method: 'get',
    params: query
  })
}

// 查询推荐配置详细
export function getMdconfig(id) {
  return request({
    url: '/system/mdconfig/' + id,
    method: 'get'
  })
}

// 新增推荐配置
export function addMdconfig(data) {
  return request({
    url: '/system/mdconfig',
    method: 'post',
    data: data
  })
}

// 修改推荐配置
export function updateMdconfig(data) {
  return request({
    url: '/system/mdconfig',
    method: 'put',
    data: data
  })
}

// 删除推荐配置
export function delMdconfig(id) {
  return request({
    url: '/system/mdconfig/' + id,
    method: 'delete'
  })
}

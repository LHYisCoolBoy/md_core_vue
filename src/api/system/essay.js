import request from '@/utils/request'

// 查询文章列表
export function listEssay(query) {
  return request({
    url: '/system/essay/list',
    method: 'get',
    params: query
  })
}

// 查询文章详细
export function getEssay(id) {
  return request({
    url: '/system/essay/' + id,
    method: 'get'
  })
}

// 新增文章
export function addEssay(data) {
  return request({
    url: '/system/essay',
    method: 'post',
    data: data
  })
}

// 修改文章
export function updateEssay(data) {
  return request({
    url: '/system/essay',
    method: 'put',
    data: data
  })
}

// 删除文章
export function delEssay(id) {
  return request({
    url: '/system/essay/' + id,
    method: 'delete'
  })
}

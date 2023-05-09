import request from '@/utils/request'

// 查询视频信息列表
export function listVideos(query) {
  return request({
    url: '/system/videos/list',
    method: 'get',
    params: query
  })
}

// 查询视频信息详细
export function getVideos(id) {
  return request({
    url: '/system/videos/' + id,
    method: 'get'
  })
}

// 新增视频信息
export function addVideos(data) {
  return request({
    url: '/system/videos',
    method: 'post',
    data: data
  })
}

// 修改视频信息
export function updateVideos(data) {
  return request({
    url: '/system/videos',
    method: 'put',
    data: data
  })
}

// 删除视频信息
export function delVideos(id) {
  return request({
    url: '/system/videos/' + id,
    method: 'delete'
  })
}

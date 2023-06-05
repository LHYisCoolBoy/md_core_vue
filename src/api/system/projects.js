import request from '@/utils/request'

// 查询项目列表
export function listProjects(query) {
  return request({
    url: '/system/projects/list',
    method: 'get',
    params: query
  })
}

// 查询与当前用户有关系的项目信息的数量
export function getMessageByUserIdCount(userId) {
  return request({
    url: '/system/projects/selectByCollaboratorIdCount',
    method: 'get',
    params: {
      userId: userId,
    }
  })
}

// 根据部门 ID 查询更多用户信息
export function listProjectsByDeptId(query) {
  return request({
    url: '/system/projects/selectAllByDeptId',
    method: 'get',
    params: query
  })
}

// 查询项目详细
export function getProjects(id) {
  return request({
    url: '/system/projects/' + id,
    method: 'get'
  })
}

// 新增项目
export function addProjects(data) {
  return request({
    url: '/system/projects',
    method: 'post',
    data: data
  })
}

// 修改项目
export function updateProjects(data) {
  return request({
    url: '/system/projects',
    method: 'put',
    data: data
  })
}

// 删除项目
export function delProjects(id) {
  return request({
    url: '/system/projects/' + id,
    method: 'delete'
  })
}

// 网盘上传
export function upFile(data) {
  return request({
    url: '/ydisk/upload',
    method: 'post',
    data: data
  })
}

// 网盘切片上传整合
export function mergeFile(data) {
  return request({
    url: '/ydisk/merge',
    method: 'post',
    data: data
  })
}
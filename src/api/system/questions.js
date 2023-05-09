import request from '@/utils/request'

// 查询问卷答题列表
export function listQuestions(query) {
  return request({
    url: '/system/questions/list',
    method: 'get',
    params: query
  })
}

// 查询问卷答题详细
export function getQuestions(id) {
  return request({
    url: '/system/questions/' + id,
    method: 'get'
  })
}

// 新增问卷答题
export function addQuestions(data) {
  return request({
    url: '/system/questions',
    method: 'post',
    data: data
  })
}

// 修改问卷答题
export function updateQuestions(data) {
  return request({
    url: '/system/questions',
    method: 'put',
    data: data
  })
}

// 删除问卷答题
export function delQuestions(id) {
  return request({
    url: '/system/questions/' + id,
    method: 'delete'
  })
}

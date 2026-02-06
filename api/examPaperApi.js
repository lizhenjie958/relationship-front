import { request } from '@/utils/request.js';

// 获取试卷详情
export function getExamPaperDetail(data = {}) {
  return request({
    url: '/examPaper/queryDetail',
    method: 'POST',
    data
  });
}

// 生成试卷
export function generateExamPaper(data = {}) {
  return request({
    url: '/examPaper/generate',
    data
  });
}

// 查询试卷列表
export function queryExamPaperList(data = {}) {
  return request({
    url: '/examPaper/queryList',
    method: 'POST',
    data
  });
}

// 删除试卷
export function deleteExamPaper(data = {}) {
  return request({
    url: '/examPaper/delete',
    method: 'POST',
    data
  });
}

// 认领试卷
export function claimExamPaper(data = {}) {
  return request({
    url: '/examPaper/claim',
    method: 'POST',
    data
  });
}

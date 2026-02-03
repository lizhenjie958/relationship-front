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

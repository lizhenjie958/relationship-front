import { request } from '@/utils/request.js';

// 查询答题记录列表
export function queryAnswerPaperList(data = {}) {
  return request({
    url: '/answerPaper/queryList',
    method: 'POST',
    data
  });
}

// 查询答题记录详情
export function queryAnswerPaperDetail(data = {}) {
  return request({
    url: '/answerPaper/queryDetail',
    method: 'POST',
    data
  });
}

// 完成答题
export function completeAnswer(data = {}) {
  return request({
    url: '/answerPaper/completeAnswer',
    method: 'POST',
    data
  });
}

// 查询最近进行中的答题记录
export function queryLatestAnswering(data = {}) {
  return request({
    url: '/answerPaper/queryLatestAnswering',
    method: 'POST',
    data
  });
}

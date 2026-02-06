import { request } from '@/utils/request.js';

// 查询签到日历
export function queryCheckinCalendar(data = {}) {
  return request({
    url: '/answerStatistics/checkinCalendar',
    method: 'POST',
    data
  });
}

// 查询每日答题统计
export function queryDataByDay(data = {}) {
  return request({
    url: '/answerStatistics/dataByDay',
    method: 'POST',
    data
  });
}

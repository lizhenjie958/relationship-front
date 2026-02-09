import { request } from '@/utils/request.js';

// 查询会员信息
export function queryMember(data = {}) {
  return request({
    url: '/member/queryMember',
    method: 'POST',
    data
  });
}

// 兑换会员
export function redeemMember(data = {}) {
  return request({
    url: '/member/redeem',
    method: 'POST',
    data
  });
}

// 查询会员获取记录列表
export function queryAccessRecordList(data = {}) {
  return request({
    url: '/member/queryAccessRecordList',
    method: 'POST',
    data
  });
}

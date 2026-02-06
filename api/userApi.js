import { request } from '@/utils/request.js';

// 更新用户信息
export function updateUser(data = {}) {
  return request({
    url: '/user/updateUser',
    method: 'POST',
    data
  });
}

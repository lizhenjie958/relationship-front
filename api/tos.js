import { request } from '../utils/request';

// 获取 TOS 预签名凭证
export async function getTosCredential(params) {
  try {
    const response = await request({
      url: '/tos/credential',
      method: 'POST',
      data: params
    });
    return response;
  } catch (error) {
    console.error('获取 TOS 预签名凭证失败:', error);
    throw error;
  }
}

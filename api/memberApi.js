import { request } from '@/utils/request.js';

/**
 * 查询会员信息
 * @returns {Promise} - 返回会员信息
 */
export const queryMember = () => {
	return request({
		url: '/member/queryMember',
		method: 'POST',
		data: {}
	});
};

/**
 * 兑换码兑换会员
 * @param {Object} data - 请求参数
 * @param {string} data.redeemCode - 兑换码
 * @returns {Promise} - 返回兑换结果
 */
export const redeemMember = (data) => {
	return request({
		url: '/member/redeemMember',
		method: 'POST',
		data: data
	});
};

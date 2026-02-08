import { request } from '@/utils/request.js';

/**
 * 查询当前活动
 * @param {Object} data - 请求参数
 * @param {string} data.activityType - 活动类型
 * @returns {Promise} - 返回活动信息
 */
export const queryCurrentActivity = (data) => {
	return request({
		url: '/activity/currentActivity',
		method: 'POST',
		data: data
	});
};

/**
 * 参加活动
 * @param {Object} data - 请求参数
 * @param {number} data.activityId - 活动ID
 * @returns {Promise} - 返回参加结果
 */
export const participateActivity = (data) => {
	return request({
		url: '/activity/participate',
		method: 'POST',
		data: data
	});
};

/**
 * 查询参加记录
 * @param {Object} data - 请求参数
 * @param {number} data.activityId - 活动ID
 * @returns {Promise} - 返回参加记录
 */
export const queryParticipateRecord = (data) => {
	return request({
		url: '/activity/queryParticipateRecord',
		method: 'POST',
		data: data
	});
};

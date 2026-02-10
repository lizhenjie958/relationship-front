import { sign } from "./signUtil.js";
import { getToken, clearToken, loginByWechat, needReLogin } from "./auth.js";
import { getBaseUrl } from "@/config/env.js";

/**
 * 格式化日期时间，去掉秒
 * @param {string|Date} date - 日期字符串或Date对象
 * @returns {string} 格式化后的时间字符串 (yyyy-MM-dd HH:mm)
 */
export function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export async function request(config = {}) {
    // 验证配置参数
    if (!config.url) {
        throw new Error('请求配置必须包含 url 参数');
    }
    
    // 检查是否需要登录
    if (!getToken()) {
        try {
            await loginByWechat();
        } catch (error) {
            console.error('自动登录失败:', error);
            return Promise.reject(error);
        }
    }
    
    const timestamp = new Date().getTime();
    const {
        url,
        method = "POST",
        data = {}
    } = config;
    
    try {
        // 生成签名
        const signature = sign(timestamp);
        
        // 获取当前环境的baseUrl
        const baseUrl = getBaseUrl();
        
        return new Promise((resolve, reject) => {
            uni.request({
                url: baseUrl + url,
                method,
                data,
                header: {
                    "token": getToken() || "",
                    "sign": signature,
                    "timestamp": timestamp
                },
                success: async res => {
                    const responseData = res.data;
                    
                    // 检查是否需要重新登录
                    if (responseData.code !== 200 && needReLogin(responseData.code)) {
                        // 清除本地token
                        clearToken();
                        
                        try {
                            // 重新登录
                            await loginByWechat();
                            // 重新发起请求
                            const retryResponse = await request(config);
                            resolve(retryResponse);
                        } catch (error) {
                            console.error('重新登录失败:', error);
                            reject(error);
                        }
                    } else {
                        resolve(responseData);
                    }
                },
                fail: err => {
                    console.error('请求失败:', err);
                    reject(err);
                }
            });
        });
    } catch (error) {
        console.error('请求异常:', error);
        return Promise.reject(error);
    }
}

// 导出baseUrl获取函数，供其他模块使用
export { getBaseUrl };

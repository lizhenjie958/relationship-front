import { sign, generateTraceId } from "./signUtil.js";
import { getToken, clearToken, loginByWechat, needReLogin } from "./auth.js";
import { getBaseUrl } from "@/config/env.js";

// 登录锁，防止loginByWechat被多次调用
let loginPromise = null;

// 带锁的登录函数
const loginWithLock = async () => {
    if (loginPromise) {
        // 如果正在登录中，等待登录完成
        return loginPromise;
    }
    
    // 创建新的登录Promise
    loginPromise = loginByWechat().finally(() => {
        // 登录完成后清除锁
        loginPromise = null;
    });
    
    return loginPromise;
};

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
            await loginWithLock();
        } catch (error) {
            console.error('自动登录失败:', error);
            return Promise.reject(error);
        }
    }
    
    const timestamp = new Date().getTime();
    const traceid = generateTraceId();
    const {
        url,
        method = "POST",
        data = {}
    } = config;

    try {
        // 生成签名（包含traceid）
        const signature = sign(timestamp, traceid);

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
                    "timestamp": timestamp,
                    "traceid": traceid
                },
                success: async res => {
                    // 检查HTTP状态码
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        console.error('HTTP错误:', res.statusCode, res.data);
                        uni.showToast({
                            title: `服务器错误(${res.statusCode})`,
                            icon: 'none',
                            duration: 2000
                        });
                        reject(new Error(`HTTP ${res.statusCode}`));
                        return;
                    }
                    
                    const responseData = res.data;
                    
                    // 检查是否需要重新登录
                    if (responseData.code !== 200 && needReLogin(responseData.code)) {
                        // 清除本地token
                        clearToken();
                        
                        try {
                            // 重新登录（使用锁防止多次调用）
                            await loginWithLock();
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
                    // 显示错误提示
                    uni.showToast({
                        title: '网络请求失败，请检查网络',
                        icon: 'none',
                        duration: 2000
                    });
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

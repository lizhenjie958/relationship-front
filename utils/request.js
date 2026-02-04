// 使用Vite环境变量
const domain = import.meta.env.VITE_API_DOMAIN || "http://60bj4820ma68.vicp.fun";
import { sign } from "./signUtil.js";
import { getToken, clearToken, loginByWechat, needReLogin } from "./auth.js";

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
        const signature = sign(data, timestamp);
        
        return new Promise((resolve, reject) => {
            uni.request({
                url: domain + url,
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
        console.error('请求配置错误:', error);
        return Promise.reject(error);
    }
}
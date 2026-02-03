// 使用Vite环境变量
const domain = import.meta.env.VITE_API_DOMAIN || "http://60bj4820ma68.vicp.fun";
import { sign } from "./signUtil.js";

export function request(config = {}) {
    // 验证配置参数
    if (!config.url) {
        throw new Error('请求配置必须包含 url 参数');
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
                    "token": "123456",
                    "sign": signature,
                    "timestamp": timestamp
                },
                success: res => {
                    resolve(res.data);
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
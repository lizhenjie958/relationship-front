// 使用Vite环境变量
const domain = import.meta.env.VITE_API_DOMAIN || "http://60bj4820ma68.vicp.fun";
import { sign } from "./signUtil.js";

// 存储键名
const TOKEN_KEY = 'wx_token';
const USER_ID_KEY = 'wx_userId';

// 获取存储的token
export function getToken() {
    return "S267hGjdmTtsa4EW7IMc5SLsZ8lIwKk9lA7SKFYwFoIuNvCWTfUx5qvLrcFueUpwgeZ56DoSIhfNipoweJjhlNSJ22s6XEXFPaDEJhHHIsc=";
    // return uni.getStorageSync(TOKEN_KEY);
}

// 存储token
export function setToken(token) {
  uni.setStorageSync(TOKEN_KEY, token);
}

// 清除token
export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY);
  uni.removeStorageSync(USER_ID_KEY);
}

// 获取用户ID
export function getUserId() {
  return uni.getStorageSync(USER_ID_KEY);
}

// 存储用户ID
export function setUserId(userId) {
  uni.setStorageSync(USER_ID_KEY, userId);
}

// 检查是否已登录
export function isLoggedIn() {
  return !!getToken();
}

// 微信登录
export async function loginByWechat() {
  try {
    // 1. 获取微信登录授权码
    const loginResult = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      });
    });
    
    if (!loginResult.code) {
      throw new Error('获取微信授权码失败');
    }
    
    const openIdAuthCode = loginResult.code;
    const data = { openIdAuthCode };
    const timestamp = new Date().getTime();
    const signature = sign(data, timestamp);
    
    // 2. 调用后端登录接口
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: domain + '/auth/loginByWx',
        method: 'POST',
        data,
        header: {
          "sign": signature,
          "timestamp": timestamp
        },
        success: res => {
          resolve(res.data);
        },
        fail: err => {
          console.error('登录请求失败:', err);
          reject(err);
        }
      });
    });
    
    if (response.code === 200 && response.data) {
	      // 3. 存储token和userId
	      const { token, userId } = response.data;
	      setToken(token);
	      setUserId(userId);
	      console.log('登录成功，用户ID:', userId);
	      return response.data;
	    } else {
	      throw new Error(response.msg || '登录失败');
	    }
  } catch (error) {
    console.error('微信登录失败:', error);
    clearToken();
    throw error;
  }
}

// 检查是否需要重新登录
export function needReLogin(code) {
  return code >= 1001 && code <= 1100;
}

// 获取当前用户信息
export async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const data = {};
    const timestamp = new Date().getTime();
    const signature = sign(data, timestamp);
    
    const response = await new Promise((resolve, reject) => {
      uni.request({
        url: domain + '/user/currentUser',
        method: 'POST',
        data,
        header: {
          "token": token,
          "sign": signature,
          "timestamp": timestamp
        },
        success: res => {
          resolve(res.data);
        },
        fail: err => {
          console.error('获取用户信息失败:', err);
          reject(err);
        }
      });
    });
    
    if (response.code === 200 && response.data) {
      // 不更新用户ID，用户ID始终来自登录接口
      return response.data;
    } else {
      throw new Error(response.msg || '获取用户信息失败');
    }
  } catch (error) {
    console.error('获取当前用户信息失败:', error);
    throw error;
  }
}

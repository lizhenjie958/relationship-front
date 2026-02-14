// 环境配置中心 - 手动切换环境

// 默认环境 - 修改此值切换环境: 'prod' 或 'dev'
const DEFAULT_ENV = 'prod';

// 统一配置不同环境的请求地址
const ENV_CONFIG = {
    // 生产环境
    prod: {
        baseUrl: 'https://relationship.muchunfeng.top/api',
        name: '生产环境'
    },
    // 本地/开发环境
    dev: {
        baseUrl: 'https://db857b3.r32.cpolar.top',
        name: '本地环境'
    }
};

/**
 * 获取当前环境配置
 * @returns {Object} 当前环境配置对象
 */
export function getEnvConfig() {
    const config = ENV_CONFIG[DEFAULT_ENV];
    return {
        ...config,
        env: DEFAULT_ENV
    };
}

/**
 * 获取当前环境的baseUrl
 * @returns {string} 当前环境的请求基础地址
 */
export function getBaseUrl() {
    return ENV_CONFIG[DEFAULT_ENV].baseUrl;
}

/**
 * 获取当前环境名称
 * @returns {string} 当前环境名称
 */
export function getEnvName() {
    return ENV_CONFIG[DEFAULT_ENV].name;
}

/**
 * 获取当前环境key
 * @returns {string} 当前环境key
 */
export function getCurrentEnv() {
    return DEFAULT_ENV;
}

// 导出环境配置对象
export { ENV_CONFIG, DEFAULT_ENV };

// 默认导出
export default {
    getEnvConfig,
    getBaseUrl,
    getEnvName,
    getCurrentEnv,
    ENV_CONFIG,
    DEFAULT_ENV
};

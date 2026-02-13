
// 环境配置中心

// 默认环境
const DEFAULT_ENV = 'prod';

// 统一配置不同环境的请求地址
const ENV_CONFIG = {
    // 生产环境
    prod: {
        baseUrl: 'https://relationship.muchunfeng.top',
        name: '生产环境'
    },
    // 本地/开发环境
    dev: {
        baseUrl: 'http://db857b3.r32.cpolar.top',
        name: '本地环境'
    }
};


// 本地存储的key
const STORAGE_KEY = 'app_env_config';

/**
 * 获取当前环境配置
 * @returns {Object} 当前环境配置对象
 */
export function getEnvConfig() {
    try {
        // 优先从本地存储读取
        const savedConfig = uni.getStorageSync(STORAGE_KEY);
        if (savedConfig && savedConfig.env && ENV_CONFIG[savedConfig.env]) {
            return {
                ...ENV_CONFIG[savedConfig.env],
                env: savedConfig.env
            };
        }
        
        // 默认返回生产环境
        return {
            ...ENV_CONFIG[DEFAULT_ENV],
            env: DEFAULT_ENV
        };
    } catch (error) {
        console.error('获取环境配置失败:', error);
        return {
            ...ENV_CONFIG[DEFAULT_ENV],
            env: DEFAULT_ENV
        };
    }
}

/**
 * 获取当前环境的baseUrl
 * @returns {string} 当前环境的请求基础地址
 */
export function getBaseUrl() {
    const config = getEnvConfig();
    return config.baseUrl;
}

/**
 * 获取当前环境名称
 * @returns {string} 当前环境名称
 */
export function getEnvName() {
    const config = getEnvConfig();
    return config.name;
}

/**
 * 获取当前环境key
 * @returns {string} 当前环境key
 */
export function getCurrentEnv() {
    const config = getEnvConfig();
    return config.env;
}

/**
 * 切换环境
 * @param {string} env - 环境key (production/local)
 * @returns {boolean} 是否切换成功
 */
export function switchEnv(env) {
    if (!ENV_CONFIG[env]) {
        console.error(`环境 ${env} 不存在`);
        return false;
    }
    
    try {
        uni.setStorageSync(STORAGE_KEY, { env });
        console.log(`已切换到环境: ${ENV_CONFIG[env].name} (${ENV_CONFIG[env].baseUrl})`);
        return true;
    } catch (error) {
        console.error('切换环境失败:', error);
        return false;
    }
}

/**
 * 重置为默认环境
 */
export function resetEnv() {
    try {
        uni.removeStorageSync(STORAGE_KEY);
        console.log('已重置为默认环境');
        return true;
    } catch (error) {
        console.error('重置环境失败:', error);
        return false;
    }
}

/**
 * 获取所有可用环境列表
 * @returns {Array} 环境列表
 */
export function getEnvList() {
    return Object.keys(ENV_CONFIG).map(key => ({
        key,
        ...ENV_CONFIG[key]
    }));
}

// 导出环境配置对象
export { ENV_CONFIG, DEFAULT_ENV, STORAGE_KEY };

// 默认导出
export default {
    getEnvConfig,
    getBaseUrl,
    getEnvName,
    getCurrentEnv,
    switchEnv,
    resetEnv,
    getEnvList,
    ENV_CONFIG,
    DEFAULT_ENV,
    STORAGE_KEY
};

import md5 from 'md5';

// 跨环境兼容的 Base64 编码函数
function base64Encode(str) {
    if (typeof btoa !== 'undefined') {
        // 浏览器环境 - 使用现代方法
        try {
            return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
                return String.fromCharCode('0x' + p1);
            }));
        } catch (e) {
            // 降级方案
            return btoa(str);
        }
    } else if (typeof Buffer !== 'undefined') {
        // Node.js 环境
        return Buffer.from(str).toString('base64');
    } else {
        // 其他环境，实现简单的 Base64 编码
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';
        let i = 0;
        while (i < str.length) {
            const c1 = str.charCodeAt(i++) & 0xff;
            const c2 = i < str.length ? str.charCodeAt(i++) & 0xff : 0;
            const c3 = i < str.length ? str.charCodeAt(i++) & 0xff : 0;
            const enc1 = c1 >> 2;
            const enc2 = ((c1 & 3) << 4) | (c2 >> 4);
            const enc3 = ((c2 & 15) << 2) | (c3 >> 6);
            const enc4 = c3 & 63;
            output += chars.charAt(enc1) + chars.charAt(enc2) + 
                      (i > str.length + 1 ? '=' : chars.charAt(enc3)) + 
                      (i > str.length ? '=' : chars.charAt(enc4));
        }
        return output;
    }
}

export function sign(data, timestamp) {
    // 创建数据副本并添加 timestamp
    const signData = { ...(data || {}), timestamp };
    
    // 按键名进行字典序排序
    const sortedKeys = Object.keys(signData).sort();
    
    // 过滤掉空值并构建键值对数组
    const signPairs = sortedKeys
        .map(key => {
            const value = signData[key];
            return value !== null && value !== undefined ? `${key}=${value}` : null;
        })
        .filter(Boolean);
    
    // 验证签名对不为空
    if (signPairs.length === 0) {
        throw new Error('签名数据对不能为空');
    }
    
    // 用&连接所有键值对
    const signRaw = signPairs.join('&');
    const signRawWithRelation = "relationship=8905e6ee&" + signRaw;
    
    // Base64编码
    const base64Encoded = base64Encode(signRawWithRelation);
    
    // MD5哈希计算
    const md5Hash = md5(base64Encoded);
    
    return md5Hash;
}
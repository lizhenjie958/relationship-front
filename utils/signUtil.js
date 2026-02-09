import md5 from 'md5';

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
    // MD5哈希计算（使用 md5 npm 包）
    const md5Hash = md5(signRawWithRelation);

    return md5Hash;
}

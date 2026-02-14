import md5 from 'md5';

/**
 * 生成不带横线的UUID
 * @returns {string} 32位UUID字符串
 */
function generateUUID() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 生成签名
 * @param {number} timestamp - 时间戳
 * @param {string} traceid - 追踪ID
 * @returns {string} MD5签名
 */
export function sign(timestamp, traceid) {
    const signRawWithRelation = "relationship=y6y4a9xx&timestamp=" + timestamp + "&traceid=" + traceid;
    const md5Hash = md5(signRawWithRelation);
    return md5Hash;
}

/**
 * 生成traceid
 * @returns {string} 32位UUID字符串
 */
export function generateTraceId() {
    return generateUUID();
}

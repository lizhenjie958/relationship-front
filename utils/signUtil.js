// MD5 implementation
function md5(str) {
    function rotl(n, k) {
        return (n << k) | (n >>> (32 - k));
    }

    function toHex(i) {
        const hexcase = 0;
        const hex_tab = hexcase ? '0123456789ABCDEF' : '0123456789abcdef';
        return hex_tab.charAt((i >> 4) & 0x0F) + hex_tab.charAt(i & 0x0F);
    }

    function md5cycle(x, k) {
        let a = x[0];
        let b = x[1];
        let c = x[2];
        let d = x[3];

        a += (b & c | ~b & d) + k[0] + 0xd76aa478;
        a = rotl(a, 7);
        a += b;
        b += (c & d | ~c & a) + k[1] + 0xe8c7b756;
        b = rotl(b, 12);
        b += c;
        c += (d & a | ~d & b) + k[2] + 0x242070db;
        c = rotl(c, 17);
        c += d;
        d += (a & b | ~a & c) + k[3] + 0xc1bdceee;
        d = rotl(d, 22);
        d += a;

        a += (b & d | ~b & c) + k[4] + 0xf57c0faf;
        a = rotl(a, 7);
        a += b;
        b += (c & a | ~c & d) + k[5] + 0x4787c62a;
        b = rotl(b, 12);
        b += c;
        c += (d & b | ~d & a) + k[6] + 0xa8304613;
        c = rotl(c, 17);
        c += d;
        d += (a & c | ~a & b) + k[7] + 0xfd469501;
        d = rotl(d, 22);
        d += a;

        a += (b ^ c ^ d) + k[8] + 0x698098d8;
        a = rotl(a, 7);
        a += b;
        b += (c ^ d ^ a) + k[9] + 0x8b44f7af;
        b = rotl(b, 12);
        b += c;
        c += (d ^ a ^ b) + k[10] + 0xffff5bb1;
        c = rotl(c, 17);
        c += d;
        d += (a ^ b ^ c) + k[11] + 0x895cd7be;
        d = rotl(d, 22);
        d += a;

        a += (c ^ (b | ~d)) + k[12] + 0x6b901122;
        a = rotl(a, 7);
        a += b;
        b += (d ^ (c | ~a)) + k[13] + 0xfd987193;
        b = rotl(b, 12);
        b += c;
        c += (a ^ (d | ~b)) + k[14] + 0xa679438e;
        c = rotl(c, 17);
        c += d;
        d += (b ^ (a | ~c)) + k[15] + 0x49b40821;
        d = rotl(d, 22);
        d += a;

        return [a, b, c, d];
    }

    let nblk = ((str.length + 8) >> 6) + 1;
    let blks = new Array(nblk * 16);
    for (let i = 0; i < nblk * 16; i++) {
        blks[i] = 0;
    }
    for (let i = 0; i < str.length; i++) {
        blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    blks[str.length >> 2] |= 0x80 << ((str.length % 4) * 8);
    blks[nblk * 16 - 2] = str.length * 8;

    let md5 = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
    let k = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    for (let i = 0; i < nblk; i++) {
        let kk = new Array(16);
        for (let j = 0; j < 16; j++) {
            kk[j] = blks[i * 16 + j];
        }
        let t = md5cycle(md5, kk);
        for (let j = 0; j < 4; j++) {
            md5[j] += t[j];
        }
    }

    let result = '';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            result += toHex((md5[i] >> (j * 8)) & 0x000000FF);
        }
    }

    return result;
}

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
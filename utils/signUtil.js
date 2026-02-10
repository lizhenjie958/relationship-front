import md5 from 'md5';

export function sign(timestamp) {
    const signRawWithRelation = "relationship=8905e6ee&timestamp=" + timestamp ;
    const md5Hash = md5(signRawWithRelation);
    return md5Hash;
}

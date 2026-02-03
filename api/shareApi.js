import {request} from "@/utils/request.js"

// 准备分享
export function readyShare(data = {}){
	return request({url:"/shareRecord/readyShare",data, method: "POST"})
}

// 完成分享
export function completeShare(data = {}){
	return request({url:"/shareRecord/completeShare",data, method: "POST"})
}

// 查询分享目标路径
export function queryTargetPath(data = {}){
	return request({url:"/shareRecord/queryTargetPath",data, method: "POST"})
}
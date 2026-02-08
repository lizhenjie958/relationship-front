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

// 添加分享记录
export function addShareRecord(data = {}){
	return request({url:"/shareRecord/addRecord",data, method: "POST"})
}

// 查询分享记录列表
export function queryShareRecordList(data = {}){
	return request({url:"/shareRecord/queryList",data, method: "POST"})
}

// 停止分享
export function stopShare(data = {}){
	return request({url:"/shareRecord/stopShare",data, method: "POST"})
}
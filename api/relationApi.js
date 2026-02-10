import {request} from "@/utils/request.js"

// 分页查询关系列表
export function queryRelationshipList(data = {}){
	return request({url:"/relationship/queryList",data})
}

// 新增关系
export function addRelationship(data = {}){
	return request({url:"/relationship/add",data})
}

// 查询关系详情
export function queryRelationshipDetail(data = {}){
	return request({url:"/relationship/queryDetail",data})
}

// 更新关系
export function updateRelationship(data = {}){
	return request({url:"/relationship/update",data})
}

// 生成试题
export function generateExamPaper(data = {}){
	return request({url:"/examPaper/generate",data})
}

// 复制关系
export function copyRelationship(data = {}){
	return request({url:"/relationship/copy",data})
}

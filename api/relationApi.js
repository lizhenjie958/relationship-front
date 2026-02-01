import {request} from "@/utils/request.js"
export function queryProtagonistPage(data = {}){
	return request({url:"/protagonist/queryPage",data})
}

export function getTosCredential(data = {}){
	return request({url:"/tos/credential",data})
}

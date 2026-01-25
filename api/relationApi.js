import {request} from "@/utils/request.js"
export function queryProtagonistPage(data = {}){
	return request({url:"/protagonist/queryPage",data})
}
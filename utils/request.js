const domain = "http://127.0.0.1:8888";
export function request(config={}){
	const {
		url,
		method = "POST",
		data ={},
	} = config;
	return new Promise((resolve, reject) =>{
		uni.request({
			url: domain+url,
			method,
			data,
			header:{
				"mcf-token":""
			},
			success:res =>{
				resolve(res.data);
			},
			fail:err=>{
				reject(err);
			}
		})
	})
}
import { getTosCredential } from '/api/tos.js';

// 生成文件名
export function generateFileName(tempFilePath) {
	const timestamp = Date.now();
	const randomStr = Math.random().toString(36).substring(2, 8);
	const extension = tempFilePath.split('.').pop();
	return `${timestamp}_${randomStr}.${extension}`;
}

// 解析返回值结构
export function parseResponse(response) {
	let credentialData = response;
	
	// 尝试多种可能的返回值结构
	if (response.data) {
		// 结构: response.data
		credentialData = response.data;
	} else if (response.result) {
		// 结构: response.result
		credentialData = response.result;
	}
	
	// 额外检查: 如果 credentialData 仍然是完整的响应对象，尝试其他可能的路径
	if (credentialData.code !== undefined && credentialData.data) {
		credentialData = credentialData.data;
	}
	
	return credentialData;
}

// 上传文件
export async function uploadFile(tempFilePath) {
	let loadingShown = false;
	try {
		// 显示加载提示
		uni.showLoading({ title: '上传中...', mask: true });
		loadingShown = true;

		// 1. 生成文件名
		const fileName = generateFileName(tempFilePath);
		console.log('生成的文件名:', fileName);
		
		// 2. 从后端获取预签名凭证
		console.log('开始获取预签名凭证...');
		const response = await getTosCredential({ fileName });
		
		// 解析返回值
		const credentialData = parseResponse(response);
		
		// 检查必要字段
		if (!credentialData.policy || !credentialData.signature || !credentialData.algorithm) {
			throw new Error(`预签名凭证格式错误 - 缺少必要字段: policy=${!!credentialData.policy}, signature=${!!credentialData.signature}, algorithm=${!!credentialData.algorithm}`);
		}
		
		// 3. 构建 TOS 上传参数
		const tosUploadUrl = "https://zz-mxj-material.tos-cn-beijing.volces.com";
		
		// 从 originPolicy 中解析 key 值
		let policyKey = '';
		if (credentialData.originPolicy) {
			try {
				const originPolicyObj = JSON.parse(credentialData.originPolicy);
				if (originPolicyObj.conditions && Array.isArray(originPolicyObj.conditions)) {
					for (const condition of originPolicyObj.conditions) {
						if (condition.key) {
							policyKey = condition.key;
							break;
						}
					}
				}
			} catch (e) {
				console.error('解析 originPolicy 失败:', e);
			}
		}
		if(!policyKey){
			throw new Error('从 originPolicy 中解析出的 key 值为空');
		}
		
		// 提取 zz-mxj-material/ 之后的部分用于构建完整 URL
		let imagePath = policyKey;
		const prefix = 'zz-mxj-material/';
		if (imagePath.startsWith(prefix)) {
			imagePath = imagePath.substring(prefix.length);
			console.log('提取后的 imagePath:', imagePath);
		}
		
		// 确保返回完整的图片访问路径
		const fullImageUrl = `https://zz-mxj-material.tos-cn-beijing.volces.com/${imagePath}`;
		console.log('完整图片访问路径:', fullImageUrl);
		
		// 构建 formData - 火山引擎 TOS 签名上传格式
		const formData = {
			'key': policyKey,
			'policy': credentialData.policy,
			'x-tos-algorithm': credentialData.algorithm,
			'x-tos-credential': credentialData.credential,
			'x-tos-date': credentialData.date,
			'x-tos-signature': credentialData.signature
		};
		
		// 4. 执行上传
		const uploadTask = await new Promise((resolve, reject) => {
			uni.uploadFile({
				url: tosUploadUrl,
				filePath: tempFilePath,
				name: 'file',
				formData: formData,
				header: {
					'Content-Type': 'multipart/form-data'
				},
				success: (uploadRes) => {
					console.log('上传结果:', uploadRes);
					if (uploadRes.statusCode === 200 || uploadRes.statusCode === 204) {
						resolve(uploadRes);
					} else {
						reject(new Error(`上传失败: ${uploadRes.statusCode}`));
					}
				},
				fail: (err) => {
					console.error('上传任务失败:', err);
					reject(err);
				}
			});
		});
		
		// 上传成功
		uni.showToast({ title: '上传成功', icon: 'success' });
		return { policyKey, fullImageUrl };
	} catch (error) {
		console.error('上传失败:', error);
		uni.showToast({ title: `上传失败: ${error.message}`, icon: 'none' });
		return null;
	} finally {
		if (loadingShown) {
			uni.hideLoading();
		}
	}
}

// 上传文件（带进度监控）
export function uploadWithProgress(tempFilePath, onProgress) {
	return new Promise(async (resolve, reject) => {
		let loadingShown = false;
		let uploadTask = null;
		
		try {
			// 1. 生成文件名
			const fileName = generateFileName(tempFilePath);
			console.log('生成的文件名:', fileName);
			
			// 2. 从后端获取预签名凭证
			console.log('开始获取预签名凭证...');
			const response = await getTosCredential({ fileName });
			
			// 解析返回值
			const credentialData = parseResponse(response);
			
			// 检查必要字段
			if (!credentialData.policy || !credentialData.signature || !credentialData.algorithm) {
				throw new Error(`预签名凭证格式错误 - 缺少必要字段: policy=${!!credentialData.policy}, signature=${!!credentialData.signature}, algorithm=${!!credentialData.algorithm}`);
			}
			
			// 3. 构建 TOS 上传参数
			const tosUploadUrl = 'https://zz-mxj-material.tos-cn-beijing.volces.com';
			
			// 从 originPolicy 中解析 key 值
			let policyKey = '';
			if (credentialData.originPolicy) {
				try {
					const originPolicyObj = JSON.parse(credentialData.originPolicy);
					if (originPolicyObj.conditions && Array.isArray(originPolicyObj.conditions)) {
						for (const condition of originPolicyObj.conditions) {
							if (condition.key) {
								policyKey = condition.key;
								break;
							}
						}
					}
				} catch (e) {
					console.error('解析 originPolicy 失败:', e);
				}
			}
			if (!policyKey) {
				throw new Error('从 originPolicy 中解析出的 key 值为空');
			}
		
			// 提取 zz-mxj-material/ 之后的部分用于构建完整 URL
			let imagePath = policyKey;
			const prefix = 'zz-mxj-material/';
			if (imagePath.startsWith(prefix)) {
				imagePath = imagePath.substring(prefix.length);
				console.log('提取后的 imagePath:', imagePath);
			}
			
			// 确保返回完整的图片访问路径
			const fullImageUrl = `https://zz-mxj-material.tos-cn-beijing.volces.com/${imagePath}`;
			console.log('完整图片访问路径:', fullImageUrl);
			
			// 构建 formData - 火山引擎 TOS 签名上传格式
			const formData = {
				'key': policyKey,
				'policy': credentialData.policy,
				'x-tos-algorithm': credentialData.algorithm,
				'x-tos-credential': credentialData.credential,
				'x-tos-date': credentialData.date,
				'x-tos-signature': credentialData.signature
			};
			
			// 4. 执行上传
			uploadTask = uni.uploadFile({
				url: tosUploadUrl,
				filePath: tempFilePath,
				name: 'file',
				formData: formData,
				header: {
					'Content-Type': 'multipart/form-data'
				},
				success: (uploadRes) => {
					console.log('上传结果:', uploadRes);
					if (uploadRes.statusCode === 200 || uploadRes.statusCode === 204) {
						// 上传成功
						uni.showToast({ title: '上传成功', icon: 'success' });
						resolve({ policyKey, fullImageUrl });
					} else {
						reject(new Error(`上传失败: ${uploadRes.statusCode}`));
					}
				},
				fail: (err) => {
					console.error('上传任务失败:', err);
					reject(err);
				}
			});
			
			// 5. 监听上传进度
			uploadTask.onProgressUpdate((res) => {
				const percent = res.progress;
				if (onProgress) {
					onProgress(percent);
				}
			});
		} catch (error) {
			console.error('上传失败:', error);
			uni.showToast({ title: `上传失败: ${error.message}`, icon: 'none' });
			reject(error);
		}
	});
}

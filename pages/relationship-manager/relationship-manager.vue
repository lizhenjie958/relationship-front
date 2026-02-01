<template>
	<view class="container">
		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<view v-else>

		<!-- 编辑禁用提示 -->
		<view v-if="editDisabled && relationshipId" class="disabled-tip">
			<text class="disabled-icon">⚠️</text>
			<text class="disabled-text">获取详情失败，禁止编辑</text>
			<button class="refresh-btn" @click="fetchRelationshipDetail(relationshipId)">
				<text class="refresh-icon">🔄</text>
				<text class="refresh-text">重新加载</text>
			</button>
		</view>

		<view class="header">
			<view class="avatar-info">
				<!-- 头像 -->
				<view class="avatar-section">
					<view class="avatar-wrapper" @click="!editDisabled && chooseUserAvatar" :class="{ 'disabled': editDisabled }">
						<image v-if="userInfo.avatar" :src="userInfo.avatar" class="user-avatar"></image>
						<view v-else class="user-avatar-placeholder">
							<text class="placeholder-text">点击上传</text>
						</view>
						<view class="avatar-edit-icon">
							<text class="edit-icon">📷</text>
						</view>
					</view>
				</view>
				
				<!-- 姓名 -->
				<view class="info-section">
					<text class="info-label">姓名</text>
					<view class="info-content">
						<view v-if="!editState.name" class="info-value" @click="!editDisabled && (editState.name = true)" :class="{ 'disabled': editDisabled }">
							{{ userInfo.name || '点击修改' }}
							<text class="edit-hint">✏️</text>
						</view>
						<input v-else 
							v-model="userInfo.name" 
							class="info-input" 
							@blur="editState.name = false"
							@keyup.enter="editState.name = false"
							placeholder="请输入姓名"
							auto-focus
							:disabled="editDisabled"
						/>
					</view>
				</view>
				
				<!-- 备注 -->
				<view class="info-section remark-section">
					<text class="info-label">备注</text>
					<view class="info-content">
						<view v-if="!editState.remark" class="info-value remark-value" @click="!editDisabled && (editState.remark = true)" :class="{ 'disabled': editDisabled }">
							{{ userInfo.remark || '点击修改' }}
							<text class="edit-hint">✏️</text>
						</view>
						<textarea v-else 
							v-model="userInfo.remark" 
							class="info-textarea" 
							@blur="editState.remark = false"
							placeholder="请输入备注"
							rows="3"
							auto-focus
							:disabled="editDisabled"
						/>
					</view>
				</view>
			</view>
		</view>

		<view class="table-container">
			<view class="table-header">
				<view class="table-cell relation-header">关系</view>
				<view class="table-cell avatar-header">头像</view>
				<view class="table-cell action-header">操作</view>
			</view>

			<view class="table-body">
				<view v-for="(item, index) in relationList" :key="index" class="table-row">
					<view class="table-cell">
						<view class="input-wrapper">
							<input 
								v-model="item.relation" 
								class="relation-input" 
								placeholder="请输入关系"
								:class="{ 'error': item.error && !item.relation, 'disabled': editDisabled }"
								:disabled="editDisabled"
							/>
							<view v-if="item.error && !item.relation" class="error-hint">请填写关系</view>
						</view>
					</view>
					<view class="table-cell">
						<view class="avatar-cell">
							<view class="relation-avatar-wrapper" @click="!editDisabled && chooseAvatar(index)" :class="{ 'disabled': editDisabled }">
								<image v-if="item.avatar" :src="item.avatar" class="avatar-image" mode="aspectFill"></image>
								<view v-else class="avatar-placeholder">
									<text class="placeholder-text">点击上传</text>
								</view>
								<view class="avatar-edit-icon small">
									<text class="edit-icon">📷</text>
								</view>
							</view>
						</view>
					</view>
					<view class="table-cell">
						<view class="action-buttons">
							<button class="action-btn add-btn" @click="!editDisabled && addRow(index)" :disabled="editDisabled" :class="{ 'disabled': editDisabled }">
								<text class="btn-icon">+</text>
							</button>
							<button class="action-btn delete-btn" @click="!editDisabled && deleteRow(index)" :disabled="editDisabled" :class="{ 'disabled': editDisabled }">
								<text class="btn-icon">-</text>
							</button>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="footer">
			<button class="save-btn" @click="saveData" :disabled="editDisabled" :class="{ 'disabled': editDisabled }">
				<text class="save-btn-text">保存</text>
			</button>
		</view>

		</view>
	</view>
</template>

<script setup>
	import { ref, reactive } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { uploadFile, uploadWithProgress } from '../../utils/upload';
	import { addRelationship, queryRelationshipDetail, updateRelationship } from '../../api/relationApi';

	// 用户信息
	const userInfo = reactive({
		name: '',
		remark: '',
		avatar: ''
	});

	// 编辑状态
	const editState = reactive({
		name: false,
		remark: false
	});

	// 关系列表
	const relationList = ref([
		{ relation: '', avatar: '' }
	]);

	// 当前编辑的关系ID
	const relationshipId = ref(null);
	// 编辑禁用状态
	const editDisabled = ref(false);
	// 加载状态
	const loading = ref(false);

	// 初始化数据
	onLoad((options) => {
		if (options.id) {
			// 有ID参数，说明是编辑操作
			relationshipId.value = options.id;
			// 调用查询详情接口获取数据
			fetchRelationshipDetail(options.id);
		}
	});

	// 获取关系详情
	const fetchRelationshipDetail = async (id) => {
		loading.value = true;
		editDisabled.value = true;
		try {
			const response = await queryRelationshipDetail({ id });
			console.log('查询详情响应:', response);
			
			if (response && response.code === 200 && response.data) {
				const data = response.data;
				// 更新用户信息
				userInfo.name = data.protagonist || '';
				userInfo.avatar = data.picUrl || '';
				userInfo.remark = data.remark || '';
				
				// 更新关系列表
				if (data.relationList && data.relationList.length > 0) {
					relationList.value = data.relationList.map(item => ({
						relation: item.relationName || '',
						avatar: item.picUrl || '',
						error: false
					}));
				} else {
					relationList.value = [{ relation: '', avatar: '' }];
				}
				// 获取成功，允许编辑
				editDisabled.value = false;
			} else {
				uni.showToast({ 
					title: '获取详情失败，禁止编辑', 
					icon: 'none',
					duration: 2000
				});
				// 获取失败，禁止编辑
				editDisabled.value = true;
			}
		} catch (error) {
			console.error('获取详情失败:', error);
			uni.showToast({ 
				title: '获取详情失败，禁止编辑', 
				icon: 'none',
				duration: 2000
			});
			// 获取失败，禁止编辑
			editDisabled.value = true;
		} finally {
			loading.value = false;
		}
	};

	// 添加行
	const addRow = (index) => {
		relationList.value.splice(index + 1, 0, { relation: '', avatar: '' });
	};

	// 删除行
	const deleteRow = (index) => {
		if (relationList.value.length > 1) {
			relationList.value.splice(index, 1);
		}
	};



	// 通用上传函数
	const uploadImage = async (tempFilePath, showProgress = false) => {
		try {
			let uploadResult;
			if (showProgress) {
				// 使用带进度的上传函数
				uploadResult = await uploadWithProgress(tempFilePath, (percent) => {
					console.log(`上传进度: ${percent}%`);
				});
			} else {
				// 使用基础上传函数
				uploadResult = await uploadFile(tempFilePath);
			}
			return uploadResult;
		} catch (error) {
			console.error('上传失败:', error);
			throw error;
		}
	};

	// 选择关系头像
	const chooseAvatar = async (index) => {
		try {
			const res = await uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera']
			});

			console.log('选择图片结果:', res);
			
			if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				const tempFilePath = res.tempFilePaths[0];
				console.log('临时图片路径:', tempFilePath);
				
				// 临时显示本地图片，提升用户体验
				relationList.value[index].avatar = tempFilePath;
				console.log('设置临时图片后:', relationList.value[index]);
				
				// 使用通用上传函数
				const uploadResult = await uploadImage(tempFilePath, true);

				console.log('上传结果:', uploadResult);
				
				if (uploadResult) {
					// 上传成功，保存对象键和 policyKey
					relationList.value[index].avatar = uploadResult.fullImageUrl;
					relationList.value[index].policyKey = uploadResult.policyKey;
					relationList.value[index].error = false;
					console.log('上传成功后更新图片路径:', relationList.value[index]);
				} else {
					// 上传失败，清除临时图片
					relationList.value[index].avatar = '';
					relationList.value[index].policyKey = '';
					console.log('上传失败，清除临时图片');
				}
			} else {
				console.error('未选择图片');
				uni.showToast({
					title: '未选择图片',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('选择头像失败:', error);
			uni.showToast({
				title: '选择图片失败',
				icon: 'none'
			});
		}
	};

	// 选择用户头像
	const chooseUserAvatar = async () => {
		try {
			const res = await uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera']
			});

			console.log('选择用户图片结果:', res);
			
			if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				const tempFilePath = res.tempFilePaths[0];
				console.log('用户临时图片路径:', tempFilePath);
				
				// 临时显示本地图片，提升用户体验
				userInfo.avatar = tempFilePath;
				console.log('设置用户临时图片后:', userInfo);
				
				// 使用通用上传函数
				const uploadResult = await uploadImage(tempFilePath, false);

				console.log('用户上传结果:', uploadResult);
				
				if (uploadResult) {
					// 上传成功，保存对象键和 policyKey
					userInfo.avatar = uploadResult.fullImageUrl;
					userInfo.policyKey = uploadResult.policyKey;
					console.log('用户上传成功后更新图片路径:', userInfo);
				} else {
					// 上传失败，清除临时图片
					userInfo.avatar = '';
					userInfo.policyKey = '';
					console.log('用户上传失败，清除临时图片');
				}
			} else {
				console.error('未选择用户图片');
				uni.showToast({
					title: '未选择图片',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('选择用户头像失败:', error);
			uni.showToast({
				title: '选择图片失败',
				icon: 'none'
			});
		}
	};



	// 保存数据
	const saveData = async () => {
		console.log('开始保存数据');
		let isValid = true;
		
		// 验证关系数据
		relationList.value.forEach(item => {
			item.error = !item.relation;
			if (!item.relation) {
				isValid = false;
			}
		});
		
		if (!isValid) {
			uni.showToast({ title: '请填写所有关系', icon: 'none' });
			return;
		}
		
		try {
			// 准备API请求数据
			const requestData = {
				id: relationshipId.value,
				protagonist: userInfo.name || '',
				picUrl: userInfo.avatar || '',
				remark: userInfo.remark || '',
				relationList: relationList.value.map(item => ({
					relationName: item.relation || '',
					picUrl: item.avatar || ''
				}))
			};
			
			console.log('准备提交的数据:', requestData);
			console.log('relationshipId.value:', relationshipId.value);
			
			// 根据是否存在ID决定调用哪个接口
			let response;
			if (relationshipId.value) {
				// 调用更新关系接口
				console.log('调用更新关系接口');
				response = await updateRelationship(requestData);
			} else {
				// 调用新增关系接口
				console.log('调用新增关系接口');
				response = await addRelationship(requestData);
			}
			
			console.log('API响应结果:', response);
			
			// 处理响应
			if (response && response.code === 200) {
				uni.showToast({ 
					title: '保存成功', 
					icon: 'success',
					duration: 1500,
					complete: () => {
						// 保存成功后返回到列表页
						setTimeout(() => {
							uni.navigateBack({
								delta: 1,
								success: () => {
									console.log('返回列表页成功');
								}
							});
						}, 1000);
					}
				});
			} else {
				uni.showToast({ 
					title: response?.msg || '保存失败', 
					icon: 'none' 
				});
			}
		} catch (error) {
			console.error('保存数据失败:', error);
			uni.showToast({ title: '保存失败，请重试', icon: 'none' });
		}
	};
</script>

<style scoped>
	/* 全局样式变量 - 微信小程序风格 */
	:root {
		--primary-color: #07C160;
		--primary-light: #E8F5E9;
		--primary-dark: #05A850;
		--success-color: #07C160;
		--warning-color: #FF9500;
		--danger-color: #FF3B30;
		--text-color: #333333;
		--text-color-secondary: #666666;
		--text-color-light: #999999;
		--border-color: #E5E5E5;
		--border-color-light: #F0F0F0;
		--background-color: #F7F7F7;
		--card-background: #FFFFFF;
		--shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		--shadow-md: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		--shadow-lg: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
		--border-radius-sm: 8rpx;
		--border-radius-md: 12rpx;
		--border-radius-lg: 20rpx;
		--border-radius-full: 9999rpx;
		--spacing-xs: 10rpx;
		--spacing-sm: 20rpx;
		--spacing-md: 30rpx;
		--spacing-lg: 40rpx;
		--spacing-xl: 50rpx;
	}

	/* 加载状态 */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
		min-height: 80vh;
	}

	.loading-spinner {
		width: 60rpx;
		height: 60rpx;
		border: 4rpx solid var(--border-color-light);
		border-top-color: var(--primary-color);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 20rpx;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.loading-text {
		font-size: 28rpx;
		color: var(--text-color-secondary);
	}

	/* 编辑禁用提示 */
	.disabled-tip {
		background-color: var(--warning-color);
		color: white;
		padding: 20rpx;
		border-radius: var(--border-radius-md);
		margin-bottom: var(--spacing-md);
		display: flex;
		align-items: center;
		gap: 15rpx;
		box-shadow: var(--shadow-sm);
	}

	.disabled-icon {
		font-size: 32rpx;
	}

	.disabled-text {
		flex: 1;
		font-size: 26rpx;
		font-weight: 500;
	}

	.refresh-btn {
		background-color: rgba(255, 255, 255, 0.2);
		color: white;
		border: 2rpx solid rgba(255, 255, 255, 0.4);
		border-radius: var(--border-radius-sm);
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		transition: all 0.3s ease;
	}

	.refresh-btn:hover {
		background-color: rgba(255, 255, 255, 0.3);
	}

	.refresh-btn:active {
		background-color: rgba(255, 255, 255, 0.4);
		transform: scale(0.95);
	}

	.refresh-icon {
		font-size: 20rpx;
	}

	.refresh-text {
		font-size: 22rpx;
	}

	/* 禁用状态样式 */
	.avatar-wrapper.disabled,
	.relation-avatar-wrapper.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.info-value.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.info-value.disabled:active {
		background-color: var(--border-color-light);
		transform: none;
	}

	.relation-input.disabled,
	.info-input:disabled,
	.info-textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--border-color-light);
	}

	.action-btn.disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-btn.disabled:active {
		transform: none;
		box-shadow: none;
	}

	.save-btn.disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background-color: var(--text-color-light);
	}

	.save-btn.disabled:active {
		transform: none;
		box-shadow: none;
	}

	/* 容器样式 */
	.container {
		padding: var(--spacing-md);
		background-color: var(--background-color);
		min-height: 100vh;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
	}

	/* 头部卡片 */
	.header {
		background-color: var(--card-background);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
		box-shadow: var(--shadow-sm);
		transition: all 0.3s ease;
	}

	.header:active {
		box-shadow: var(--shadow-md);
		transform: translateY(-2rpx);
	}

	/* 头像信息 */
	.avatar-info {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* 头像部分 */
	.avatar-section {
		margin-bottom: var(--spacing-lg);
		position: relative;
	}

	/* 头像包装器 */
	.avatar-wrapper {
		position: relative;
		cursor: pointer;
	}

	/* 用户头像 */
	.user-avatar {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		border: 4rpx solid var(--primary-light);
		box-shadow: var(--shadow-sm);
		transition: all 0.3s ease;
	}

	.avatar-wrapper:active .user-avatar {
		transform: scale(0.95);
	}

	/* 头像占位符 */
	.user-avatar-placeholder {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		border: 4rpx dashed var(--border-color-light);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary-light);
		transition: all 0.3s ease;
	}

	.avatar-wrapper:active .user-avatar-placeholder {
		background-color: rgba(7, 193, 96, 0.15);
		transform: scale(0.95);
	}

	/* 占位符文本 */
	.placeholder-text {
		font-size: 26rpx;
		color: var(--primary-color);
		font-weight: 500;
	}

	/* 头像编辑图标 */
	.avatar-edit-icon {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 3rpx solid white;
		transition: all 0.3s ease;
	}

	.avatar-edit-icon.small {
		width: 40rpx;
		height: 40rpx;
	}

	.edit-icon {
		font-size: 30rpx;
	}

	.avatar-edit-icon.small .edit-icon {
		font-size: 20rpx;
	}

	/* 信息部分 */
	.info-section {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-bottom: var(--spacing-md);
		padding: 0 var(--spacing-xs);
	}

	.remark-section {
		margin-bottom: 0;
	}

	/* 信息标签 */
	.info-label {
		font-size: 26rpx;
		color: var(--text-color-secondary);
		margin-bottom: var(--spacing-xs);
		font-weight: 500;
	}

	/* 信息内容 */
	.info-content {
		width: 100%;
	}

	/* 信息值 */
	.info-value {
		font-size: 28rpx;
		color: var(--text-color);
		min-height: 56rpx;
		line-height: 56rpx;
		padding: 0 var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--border-color-light);
	}

	.info-value:active {
		background-color: var(--primary-light);
	}

	/* 编辑提示 */
	.edit-hint {
		font-size: 24rpx;
		opacity: 0.7;
	}

	/* 备注值 */
	.remark-value {
		min-height: 120rpx;
		line-height: 40rpx;
		white-space: pre-wrap;
		padding: var(--spacing-sm);
		text-align: left;
	}

	/* 输入框 */
	.info-input {
		width: 100%;
		font-size: 28rpx;
		color: var(--text-color);
		border: 2rpx solid var(--border-color);
		border-radius: var(--border-radius-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		transition: all 0.3s ease;
		background-color: var(--card-background);
		min-height: 70rpx;
		box-sizing: border-box;
		min-width: 200rpx;
	}

	/* 信息内容容器 */
	.info-content {
		width: 100%;
		min-width: 200rpx;
	}

	.info-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 4rpx var(--primary-light);
	}

	/* 文本域 */
	.info-textarea {
		width: 100%;
		font-size: 28rpx;
		color: var(--text-color);
		border: 2rpx solid var(--border-color);
		border-radius: var(--border-radius-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		transition: all 0.3s ease;
		background-color: var(--card-background);
		min-height: 140rpx;
		resize: none;
		line-height: 40rpx;
		box-sizing: border-box;
	}

	.info-textarea:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 4rpx var(--primary-light);
	}

	/* 表格容器 */
	.table-container {
		background-color: var(--card-background);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		box-shadow: var(--shadow-sm);
		transition: all 0.3s ease;
	}

	.table-container:active {
		box-shadow: var(--shadow-md);
	}

	/* 表格头部 */
	.table-header {
		display: flex;
		border-bottom: 2rpx solid var(--border-color-light);
		padding-bottom: var(--spacing-sm);
		margin-bottom: var(--spacing-md);
	}

	.table-header .table-cell {
		font-size: 26rpx;
		font-weight: 600;
		color: var(--text-color-secondary);
		text-align: center;
		padding: var(--spacing-xs) 0;
	}

	/* 表格行 */
	.table-row {
		display: flex;
		align-items: center;
		margin-bottom: var(--spacing-md);
		padding: var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: all 0.3s ease;
		background-color: var(--border-color-light);
	}

	.table-row:active {
		background-color: var(--primary-light);
	}

	/* 表格单元格 */
	.table-cell {
		flex: 1;
		text-align: center;
		padding: 0 var(--spacing-xs);
	}

	.table-cell:first-child {
		flex: 3;
		text-align: left;
	}

	/* 输入框包装器 */
	.input-wrapper {
		width: 100%;
		min-width: 200rpx;
	}

	/* 关系输入框 */
	.relation-input {
		width: 100%;
		font-size: 26rpx;
		color: var(--text-color);
		border: 2rpx solid var(--border-color);
		border-radius: var(--border-radius-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		transition: all 0.3s ease;
		background-color: var(--card-background);
		box-sizing: border-box;
		min-width: 180rpx;
		min-height: 70rpx;
	}

	.relation-input:focus {
		outline: none;
		border-color: var(--primary-color);
		box-shadow: 0 0 0 4rpx var(--primary-light);
	}

	.relation-input.error {
		border-color: var(--danger-color);
	}

	.relation-input.error:focus {
		box-shadow: 0 0 0 4rpx rgba(255, 59, 48, 0.1);
	}

	/* 错误提示 */
	.error-hint {
		font-size: 22rpx;
		color: var(--danger-color);
		margin-top: var(--spacing-xs);
		padding-left: var(--spacing-md);
	}

	/* 头像单元格 */
	.avatar-cell {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 关系头像包装器 */
	.relation-avatar-wrapper {
		position: relative;
		cursor: pointer;
	}

	/* 头像图片 */
	.avatar-image {
		width: 100rpx;
		height: 100rpx;
		border-radius: var(--border-radius-md);
		border: 2rpx solid var(--border-color-light);
		box-shadow: var(--shadow-sm);
		transition: all 0.3s ease;
	}

	.relation-avatar-wrapper:active .avatar-image {
		transform: scale(0.95);
	}

	/* 头像占位符 */
	.avatar-placeholder {
		width: 100rpx;
		height: 100rpx;
		border-radius: var(--border-radius-md);
		border: 2rpx dashed var(--border-color-light);
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--primary-light);
		transition: all 0.3s ease;
	}

	.relation-avatar-wrapper:active .avatar-placeholder {
		background-color: rgba(7, 193, 96, 0.15);
		transform: scale(0.95);
	}

	/* 操作按钮 */
	.action-buttons {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: center;
	}

	/* 操作按钮 */
	.action-btn {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xs);
		border: none;
		border-radius: var(--border-radius-sm);
		transition: all 0.3s ease;
		min-width: 80rpx;
	}

	/* 添加按钮 */
	.add-btn {
		background-color: var(--success-color);
		color: white;
	}

	.add-btn:active {
		background-color: #05A850;
		transform: scale(0.95);
	}

	/* 删除按钮 */
	.delete-btn {
		background-color: var(--danger-color);
		color: white;
	}

	.delete-btn:active {
		background-color: #CC2920;
		transform: scale(0.95);
	}

	/* 按钮图标 */
	.btn-icon {
		font-size: 32rpx;
		font-weight: bold;
	}

	/* 按钮文本 */
	.btn-text {
		font-size: 20rpx;
		margin-top: 4rpx;
	}

	/* 底部按钮 */
	.footer {
		padding: var(--spacing-md) 0;
		display: flex;
		justify-content: center;
	}

	/* 保存按钮 */
	.save-btn {
		width: 80%;
		height: 96rpx;
		border-radius: var(--border-radius-full);
		background-color: var(--primary-color);
		color: white;
		font-size: 32rpx;
		font-weight: 600;
		border: none;
		transition: all 0.3s ease;
		box-shadow: var(--shadow-sm);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.save-btn:active {
		background-color: var(--primary-dark);
		transform: scale(0.98);
		box-shadow: var(--shadow-md);
	}

	/* 保存按钮文本 */
	.save-btn-text {
		font-size: 32rpx;
		font-weight: 600;
	}

	/* 响应式设计 */
	@media (max-width: 750rpx) {
		.container {
			padding: var(--spacing-sm);
		}

		.header {
			padding: var(--spacing-md);
		}

		.table-container {
			padding: var(--spacing-sm);
		}

		.table-row {
			padding: var(--spacing-sm);
		}

		.save-btn {
			width: 90%;
			height: 88rpx;
			font-size: 30rpx;
		}

		.user-avatar {
			width: 180rpx;
			height: 180rpx;
		}

		.user-avatar-placeholder {
			width: 180rpx;
			height: 180rpx;
		}

		.avatar-image {
			width: 90rpx;
			height: 90rpx;
		}

		.avatar-placeholder {
			width: 90rpx;
			height: 90rpx;
		}
	}
</style>
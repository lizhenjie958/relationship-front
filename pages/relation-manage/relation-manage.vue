<template>
	<view class="container">
		<view class="header">
			<view class="avatar-info">
				<!-- 头像 -->
				<view class="avatar-section">
					<image v-if="userInfo.avatar" :src="userInfo.avatar" class="user-avatar" @click="chooseUserAvatar"></image>
					<view v-else class="user-avatar-placeholder" @click="chooseUserAvatar">
						<text>点击上传</text>
					</view>
				</view>
				
				<!-- 姓名 -->
				<view class="info-section">
					<text class="info-label">姓名：</text>
					<view v-if="!editState.name" class="info-value" @click="editState.name = true">
						{{ userInfo.name || '点击修改' }}
					</view>
					<input v-else 
						v-model="userInfo.name" 
						class="info-input" 
						@blur="editState.name = false"
						@keyup.enter="editState.name = false"
						placeholder="请输入姓名"
					/>
				</view>
				
				<!-- 备注 -->
				<view class="info-section remark-section">
					<text class="info-label">备注：</text>
					<view v-if="!editState.remark" class="info-value remark-value" @click="editState.remark = true">
						{{ userInfo.remark || '点击修改' }}
					</view>
					<textarea v-else 
						v-model="userInfo.remark" 
						class="info-textarea" 
						@blur="editState.remark = false"
						placeholder="请输入备注"
						rows="3"
					/>
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
						<input 
							v-model="item.relation" 
							class="relation-input" 
							placeholder="请输入关系"
							:class="{ 'error': item.error && !item.relation }"
						/>
					</view>
					<view class="table-cell">
						<view class="avatar-cell">
							<image v-if="item.avatar" :src="item.avatar" class="avatar-image" mode="aspectFill" @click="chooseAvatar(index)"></image>
							<view v-else class="avatar-placeholder" @click="chooseAvatar(index)">
								<text>点击上传</text>
							</view>
						</view>
					</view>
					<view class="table-cell">
						<view class="action-buttons">
					<button class="add-row-btn" @click="addRow(index)">+</button>
					<button class="delete-btn" @click="deleteRow(index)">-</button>
				</view>
					</view>
				</view>
			</view>
		</view>

		<view class="footer">
			<button class="save-btn" @click="saveData">保存</button>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, reactive } from 'vue';

	// 用户信息
	const userInfo = reactive({
		name: '姓名',
		avatar: '',
		remark: ''
	});
	
	// 编辑状态
	const editState = reactive({
		name: false,
		remark: false
	});

	// 关系列表
	const relationList = ref([
		{ relation: '', avatar: '', error: false },
		{ relation: '', avatar: '', error: false }
	]);

	// 新增关系
	const addRow = (index) => {
		relationList.value.splice(index + 1, 0, { relation: '', avatar: '', error: false });
	};

	// 删除关系
	const deleteRow = (index) => {
		if (relationList.value.length > 1) {
			relationList.value.splice(index, 1);
		} else {
			uni.showToast({
				title: '至少保留一行',
				icon: 'none'
			});
		}
	};

	// 选择关系头像
	const chooseAvatar = (index) => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];
				relationList.value[index].avatar = tempFilePath;
			},
			fail: () => {
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		});
	};

	// 选择用户头像
	const chooseUserAvatar = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: (res) => {
				const tempFilePath = res.tempFilePaths[0];
				userInfo.avatar = tempFilePath;
			},
			fail: () => {
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				});
			}
		});
	};

	// 保存数据
	const saveData = () => {
		let isValid = true;
		
		relationList.value.forEach(item => {
			if (!item.relation.trim() && !item.avatar) {
				return;
			}
			if (!item.relation.trim() || !item.avatar) {
				item.error = true;
				isValid = false;
			} else {
				item.error = false;
			}
		});

		if (!isValid) {
			uni.showToast({
				title: '关系和头像为必填项',
				icon: 'none'
			});
			return;
		}

		const filteredList = relationList.value.filter(item => {
			return item.relation.trim() && item.avatar;
		});

		if (filteredList.length === 0) {
			uni.showToast({
				title: '请至少填写一条有效数据',
				icon: 'none'
			});
			return;
		}

		console.log('保存的数据:', { userInfo: userInfo, relations: filteredList });
		
		uni.showToast({
			title: '保存成功',
			icon: 'success'
		});

		relationList.value = filteredList;
	};

	// 页面加载
	onMounted(() => {
		// 获取页面参数
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const id = currentPage.options.id;
		if (id) {
			console.log('获取到的id:', id);
			// 这里可以根据id获取数据
		}
	});
</script>

<style scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	.header {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.avatar-info {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 24rpx;
			padding: 30rpx;
		}

		.avatar-section {
			position: relative;
		}

		.user-avatar {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			border: 4rpx solid #e0e0e0;
			cursor: pointer;
			transition: transform 0.2s ease;
			object-fit: cover;
		}

		.user-avatar:hover {
			transform: scale(1.05);
		}

		.user-avatar-placeholder {
			width: 160rpx;
			height: 160rpx;
			border-radius: 50%;
			background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 24rpx;
			color: #999;
			border: 4rpx dashed #e0e0e0;
			cursor: pointer;
			transition: all 0.2s ease;
		}

		.user-avatar-placeholder:hover {
			background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
			transform: scale(1.05);
		}

		.info-section {
			display: flex;
			align-items: flex-start;
			gap: 16rpx;
			width: 100%;
			padding: 0 20rpx;
		}

		.remark-section {
			margin-top: 12rpx;
		}

		.info-label {
			font-size: 28rpx;
			font-weight: 600;
			color: #333;
			min-width: 80rpx;
			line-height: 1.4;
		}

		.info-value {
			font-size: 28rpx;
			color: #666;
			flex: 1;
			line-height: 1.4;
			padding: 8rpx 12rpx;
			border-radius: 8rpx;
			transition: background-color 0.2s ease;
			cursor: pointer;
		}

		.info-value:hover {
			background-color: #f8f9fa;
		}

		.remark-value {
			white-space: pre-wrap;
			word-break: break-all;
			min-height: 80rpx;
		}

		.info-input {
			flex: 1;
			padding: 12rpx 16rpx;
			border: 2rpx solid #1890ff;
			border-radius: 8rpx;
			font-size: 28rpx;
			color: #333;
			background-color: #fff;
		}

		.info-input:focus {
			outline: none;
			box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.1);
		}

		.info-textarea {
			flex: 1;
			padding: 16rpx;
			border: 2rpx solid #1890ff;
			border-radius: 8rpx;
			font-size: 28rpx;
			color: #333;
			background-color: #fff;
			min-height: 120rpx;
			resize: none;
		}

		.info-textarea:focus {
			outline: none;
			box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.1);
		}

	.table-container {
		background-color: #fff;
		border-radius: 12rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.table-header {
		display: flex;
		background-color: #f8f8f8;
		border-bottom: 2rpx solid #e0e0e0;
	}

	.table-cell {
		padding: 20rpx;
		display: flex;
		align-items: center;
	}

	.relation-header {
		flex: 1;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.avatar-header {
		flex: 1;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.action-header {
		flex: 0.8;
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.table-body {
		background-color: #fff;
	}

	.table-row {
		display: flex;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.table-row:last-child {
		border-bottom: none;
	}

	.relation-input {
		width: 100%;
		height: 60rpx;
		padding: 0 20rpx;
		border: 1rpx solid #e0e0e0;
		border-radius: 8rpx;
		font-size: 26rpx;
		background-color: #fff;
	}

	.relation-input.error {
		border-color: #ff4d4f;
		background-color: #fff1f0;
	}

	.avatar-cell {
		width: 100%;
	}

	.avatar-image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		border: 2rpx solid #e0e0e0;
		cursor: pointer;
		transition: transform 0.2s ease;
	}

	.avatar-image:hover {
		transform: scale(1.05);
	}

	.avatar-placeholder {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20rpx;
		color: #999;
		border: 2rpx dashed #e0e0e0;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.avatar-placeholder:hover {
		background-color: #e9ecef;
		transform: scale(1.05);
	}

	.action-buttons {
			display: flex;
			gap: 12rpx;
			align-items: center;
		}

		.add-row-btn {
			width: 56rpx;
			height: 56rpx;
			font-size: 32rpx;
			background-color: #52c41a;
			color: #fff;
			border: none;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			transition: all 0.2s ease;
			font-weight: 300;
		}

		.add-row-btn:hover {
			transform: scale(1.1);
			box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
		}

		.delete-btn {
			width: 56rpx;
			height: 56rpx;
			font-size: 32rpx;
			background-color: #ff4d4f;
			color: #fff;
			border: none;
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			transition: all 0.2s ease;
			font-weight: 300;
		}

		.delete-btn:hover {
			transform: scale(1.1);
			box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.3);
		}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #fff;
		padding: 20rpx;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		display: flex;
		justify-content: center;
	}

	.save-btn {
		width: 80%;
		height: 80rpx;
		background-color: #1890ff;
		color: #fff;
		border: none;
		border-radius: 8rpx;
		font-size: 28rpx;
		font-weight: bold;
	}
</style>
<template>
	<view class="user-container">
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<view class="user-header">
					<!-- 头像和会员标识 -->
					<view class="avatar-container" @click="chooseAvatar">
						<image :src="avatarUrl" class="user-avatar" />
						<image v-if="isMember" :src="'/static/images/member.png'" class="member-badge" />
					</view>
					<template v-if="!isEditing">
					<view class="user-name-container" @click="startEditing">
						<text class="user-name">{{ userName }}</text>
						<uni-icons type="compose" size="24rpx" color="#999" class="edit-icon" />
					</view>
				</template>
				<template v-else>
					<view class="edit-container">
						<input 
							v-model="editedName" 
							class="edit-input" 
							@keyup.enter="saveUserName"
							@keyup.esc="cancelEditing"
							autofocus
						/>
						<button class="save-btn" @click="saveUserName">保存</button>
					</view>
				</template>
				</view>
			</view>
		</view>
		
		<!-- 功能列表 -->
		<view class="function-list">
			<!-- 答题记录 -->
			<view class="function-item" @click="navigateToAnswerList">
				<view class="function-icon answer-icon">
					<text class="icon-text">📝</text>
				</view>
				<view class="function-info">
					<text class="function-title">答题记录</text>
					<text class="function-desc">查看历史答题情况</text>
				</view>
				<view class="function-arrow">
					<text class="arrow-text">→</text>
				</view>
			</view>
			
			<!-- 我的题库 -->
			<view class="function-item" @click="navigateToQuestionBank">
				<view class="function-icon bank-icon">
					<text class="icon-text">📚</text>
				</view>
				<view class="function-info">
					<text class="function-title">我的题库</text>
					<text class="function-desc">管理个人试题库</text>
				</view>
				<view class="function-arrow">
					<text class="arrow-text">→</text>
				</view>
			</view>
			
			<!-- 联系客服 -->
			<view class="function-item contact-item">
				<view class="function-icon service-icon">
					<uni-icons type="weixin" size="40rpx" color="#28b389"></uni-icons>
				</view>
				<view class="function-info">
					<text class="function-title">联系客服</text>
					<text class="function-desc">获取帮助和支持</text>
				</view>
				<view class="function-arrow">
					<uni-icons type="right" size="30rpx" color="#aaa"></uni-icons>
				</view>
				<!-- #ifdef MP -->
				<button class="contact-btn" open-type="contact"></button>
				<!-- #endif -->
			</view>
		</view>
		
		<!-- 分享解锁会员权益 -->
		<view class="share-section">
			<view class="share-card">
				<view class="share-header">
					<text class="share-title">解锁会员权益</text>
					<text class="share-badge">限时活动</text>
				</view>
				<view class="share-content">
					<text class="share-desc">分享给26位好友注册，即可获得永久会员</text>
					<text class="share-reward">永久会员权益</text>
				</view>
				<button class="share-button" @click="shareApp">
					<text class="share-button-text">立即分享</text>
				</button>
			</view>
		</view>
		
		<!-- 版本信息 -->
		<view class="version-info">
			<text class="version-text">版本 1.0.0</text>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed } from 'vue';
	import { getCurrentUser, getUserId } from '@/utils/auth.js';
	import { request } from '@/utils/request.js';
	import { uploadFile } from '@/utils/upload.js';
	import { updateUser } from '@/api/userApi.js';
	
	// 是否为会员
	const isMember = ref(false); // 默认非会员
	
	// 用户名相关
	const userName = ref('微信用户');
	const isEditing = ref(false);
	const editedName = ref(userName.value);
	// 头像相关
	const avatar = ref('');
	const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20user%20avatar%20simple%20modern%20design&image_size=square';
	const avatarUrl = computed(() => avatar.value || defaultAvatar);
	// 用户ID
	const userId = ref('');
	
	// 获取当前用户信息
	const fetchCurrentUser = async () => {
		try {
			const userInfo = await getCurrentUser();
			userName.value = userInfo.username || '微信用户';
			editedName.value = userName.value;
			// 获取头像
			avatar.value = userInfo.avatar || '';
			// 检查是否为会员
			isMember.value = userInfo.userType === 1;
		} catch (error) {
			console.error('获取用户信息失败:', error);
		}
		finally {
			// 始终从存储中获取用户ID
			const storedUserId = getUserId();
			if (storedUserId) {
				userId.value = storedUserId;
				console.log('用户ID:', userId.value);
			}
		}
	};
	
	// 页面加载时获取用户信息
	onMounted(async () => {
		await fetchCurrentUser();
	});
	
	// 跳转到答题记录
	const navigateToAnswerList = () => {
		uni.navigateTo({
			url: '/pages/answer-paper-list/answer-paper-list',
			success: (res) => {
				console.log('跳转成功:', res);
			},
			fail: (err) => {
				console.error('跳转失败:', err);
				uni.showToast({
					title: '页面不存在',
					icon: 'none'
				});
			}
		});
	};
	
	// 跳转到我的题库
	const navigateToQuestionBank = () => {
		uni.navigateTo({
			url: '/pages/exam-paper-list/exam-paper-list',
			success: (res) => {
				console.log('跳转成功:', res);
			},
			fail: (err) => {
				console.error('跳转失败:', err);
				uni.showToast({
					title: '页面不存在',
					icon: 'none'
				});
			}
		});
	};
	
	// 联系客服
	const contactService = () => {
		// 使用uni-app的API打开微信小程序客服
		uni.openCustomerServiceChat({
			corpId: '', // 企业ID，非企业小程序不需要
			url: 'https://work.weixin.qq.com/kfid/kfcxxxxx', // 客服链接，需要在微信小程序后台配置
			showMessageCard: true,
			success: (res) => {
				console.log('打开客服成功:', res);
			},
			fail: (err) => {
				console.error('打开客服失败:', err);
				// 失败时提示用户
				uni.showToast({
					title: '客服功能暂不可用',
					icon: 'none'
				});
			}
		});
	};
	
	// 分享应用
	const shareApp = () => {
		uni.showModal({
			title: '分享解锁会员',
			content: '请点击右上角的「...」按钮，选择「发送给朋友」或「分享到朋友圈」，分享此应用给好友，超过26位好友注册即可获得永久会员权益！',
			confirmText: '我知道了',
			showCancel: false,
			success: (res) => {
				if (res.confirm) {
					// 用户确认后，引导用户点击右上角分享
					console.log('用户已了解分享方式');
				}
			}
		});
	};
	
	// 开始编辑用户名
	const startEditing = () => {
		isEditing.value = true;
		editedName.value = userName.value;
	};
	
	// 保存用户名
	const saveUserName = async () => {
		const trimmedName = editedName.value.trim();
		if (!trimmedName) {
			uni.showToast({
				title: '用户名不能为空',
				icon: 'none'
			});
			return;
		}
		
		// 判断前后是否变动，未变动则不触发接口
		if (trimmedName === userName.value) {
			isEditing.value = false;
			return;
		}
		
		// 更新用户名
		userName.value = trimmedName;
		isEditing.value = false;
		
		// 调用更新接口
		await onUserNameUpdated(userName.value);
	};
	
	// 取消编辑
	const cancelEditing = () => {
		isEditing.value = false;
	};
	
	// 选择头像
	const chooseAvatar = () => {
		uni.chooseImage({
			count: 1,
			sizeType: ['compressed'],
			sourceType: ['album', 'camera'],
			success: async (res) => {
				const tempFilePaths = res.tempFilePaths;
				const tempFilePath = tempFilePaths[0];
				
				// 使用 TOS 上传工具类上传图片
				const uploadResult = await uploadFile(tempFilePath);
				
				if (uploadResult && uploadResult.fullImageUrl) {
					// 更新头像显示
					avatar.value = uploadResult.fullImageUrl;
					// 调用更新用户接口保存头像 URL
					await updateUserInfo({
						username: userName.value,
						avatar: uploadResult.fullImageUrl
					});
				}
			},
			fail: (err) => {
				console.error('选择头像失败:', err);
			}
		});
	};

	// 更新用户信息
	const updateUserInfo = async (userData) => {
		try {
			const response = await updateUser(userData);
			
			if (response.code === 200) {
				uni.showToast({
					title: '更新成功',
					icon: 'success'
				});
			} else {
				uni.showToast({
					title: response.msg || '更新失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('更新用户信息失败:', error);
			uni.showToast({
				title: '更新失败',
				icon: 'none'
			});
		}
	};

	// 用户名更新事件
	const onUserNameUpdated = async (newName) => {
		console.log('用户名已更新:', newName);
		// 调用更新用户接口
		await updateUserInfo({
			username: newName,
			avatar: avatar.value
		});
	};

	// 微信小程序分享给好友 - 微信会自动识别此函数，无需导出
    onShareAppMessage(() => {
		const sharePath = `/pages/index/index?inviterId=${userId.value}`;
		return {
			title: '推荐一款好用的学习工具',
			desc: '快来和我一起学习，分享即可获得永久会员权益！超过26位好友注册即可获得永久会员权益！',
			path: sharePath,
			imageUrl: ''
		};
    })

	// 微信小程序分享到朋友圈 - 微信会自动识别此函数，无需导出
	onShareTimeline(()=>{
		const sharePath = `/pages/index/index?inviterId=${userId.value}`;
		return {
			title: '推荐一款好用的学习工具',
			desc: '快来和我一起学习，分享即可获得永久会员权益！超过26位好友注册即可获得永久会员权益！',
			path: sharePath,
			imageUrl: ''
		};
	})


</script>

<style lang="scss" scoped>
	.user-container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}
	
	
	
	/* 用户信息卡片 */
	.user-card {
		background: linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%);
		border-radius: 24rpx;
		padding: 36rpx;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-bottom: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.2);
	}
	
	
	
	.user-info {
		text-align: left;
		color: #2c3e50;
	}
	
	.user-header {
				display: flex;
				align-items: center;
				gap: 16rpx;
			}

			/* 头像容器 */
			.avatar-container {
				position: relative;
				cursor: pointer;
			}

			/* 用户头像 */
			.user-avatar {
				width: 80rpx;
				height: 80rpx;
				border-radius: 50%;
				object-fit: cover;
				border: 3rpx solid #fff;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
				transition: all 0.3s ease;
			}

			.avatar-container:active .user-avatar {
				transform: scale(0.95);
			}

			/* 会员标识 */
			.member-badge {
				position: absolute;
				top: -8rpx;
				right: -8rpx;
				width: 36rpx;
				height: 36rpx;
				object-fit: contain;
				z-index: 1;
			}

			.user-name {
				font-size: 36rpx;
				font-weight: 600;
				color: #2c3e50;
			}

	/* 用户名容器样式 */
	.user-name-container {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 8rpx 12rpx;
		border-radius: 8rpx;
		transition: background-color 0.3s ease;
	}

	.user-name-container:active {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.edit-icon {
		margin-left: 4rpx;
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	.user-name-container:hover .edit-icon {
		opacity: 1;
	}

	/* 编辑功能样式 */
	.edit-container {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.edit-input {
		flex: 1;
		padding: 12rpx 16rpx;
		border: 2rpx solid #1890ff;
		border-radius: 8rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #2c3e50;
		background-color: rgba(255, 255, 255, 0.8);
	}

	/* 保存按钮样式 */
	.save-btn {
		padding: 12rpx 24rpx;
		background-color: #1890ff;
		color: #fff;
		border: none;
		border-radius: 8rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.3s ease;
	}

	.save-btn:hover {
		background-color: #40a9ff;
	}

	.save-btn:active {
		background-color: #096dd9;
	}
	
	/* 功能列表 */
	.function-list {
		background-color: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	}
	
	.function-item {
		display: flex;
		align-items: center;
		padding: 32rpx 24rpx;
		border-bottom: 2rpx solid #f1f3f5;
		transition: all 0.3s ease;
		cursor: pointer;
	}
	
	.function-item:hover {
		background-color: #f8f9fa;
	}
	
	.function-item:last-child {
		border-bottom: none;
	}
	
	.function-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 24rpx;
	}
	
	.answer-icon {
		background: linear-gradient(135deg, #faad14 0%, #ffd666 100%);
	}
	
	.bank-icon {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
	}
	
	.service-icon {
		background: linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%);
	}
	
	.icon-text {
		font-size: 40rpx;
	}
	
	.function-info {
		flex: 1;
	}
	
	.function-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 4rpx;
		display: block;
	}
	
	.function-desc {
		font-size: 24rpx;
		color: #666;
		display: block;
	}
	
	.function-arrow {
		color: #909399;
	}
	
	.arrow-text {
	font-size: 28rpx;
}

/* 联系客服按钮 */
.contact-item {
	position: relative;
}

.contact-btn {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	padding: 0;
	margin: 0;
	background: transparent;
	border: none;
	z-index: 10;
}

.contact-btn::after {
	border: none;
}

/* 分享解锁会员权益 */
	.share-section {
		margin-bottom: 40rpx;
	}
	
	.share-card {
		background: linear-gradient(135deg, #f0f5ff 0%, #f9f0ff 100%);
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 4rpx 16rpx rgba(114, 46, 209, 0.2);
	}
	
	.share-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}
	
	.share-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #722ed1;
	}
	
	.share-badge {
		padding: 8rpx 16rpx;
		background-color: rgba(114, 46, 209, 0.1);
		border-radius: 16rpx;
		font-size: 20rpx;
		color: #722ed1;
	}
	
	.share-content {
		margin-bottom: 32rpx;
	}
	
	.share-desc {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 8rpx;
		display: block;
	}
	
	.share-reward {
		font-size: 32rpx;
		font-weight: 600;
		color: #722ed1;
		display: block;
	}
	
	.share-button {
		width: 100%;
		padding: 24rpx;
		background: linear-gradient(135deg, #722ed1 0%, #eb2f96 100%);
		color: #fff;
		border: none;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 16rpx rgba(114, 46, 209, 0.3);
	}
	
	.share-button:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 24rpx rgba(114, 46, 209, 0.4);
	}
	
	.share-button:active {
		transform: translateY(0);
	}
	
	.share-button-text {
		line-height: 1;
	}
	
	/* 版本信息 */
	.version-info {
		text-align: center;
		padding: 20rpx 0;
	}
	
	.version-text {
		font-size: 24rpx;
		color: #909399;
	}
</style>
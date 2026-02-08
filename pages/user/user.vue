<template>
	<view class="user-container">
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-info">
				<view class="user-header">
					<!-- 头像和会员标识 -->
					<view class="avatar-container" @click="chooseAvatar">
						<image :src="avatarUrl" class="user-avatar" />
						<image v-if="userType === 2" :src="'/static/images/member.png'" class="member-badge" />
						<image v-else :src="'/static/images/member-n.png'" class="member-badge" />
					</view>
					<template v-if="!isEditing">
				<view class="user-name-container" @click="startEditing">
					<text class="user-name" :class="{ 'vip-name': userType === 2 }">{{ userName }}</text>
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
		
		<!-- 会员权益卡片 -->
		<view class="vip-section" v-if="userType !== 2">
			<view class="vip-card" @click="showVipBenefits">
				<view class="vip-header">
					<view class="vip-icon">
						<text class="vip-icon-text">👑</text>
					</view>
					<view class="vip-info">
						<text class="vip-title">开通VIP会员</text>
						<text class="vip-desc">解锁专属权益</text>
					</view>
				</view>
				<view class="vip-arrow">
					<text class="arrow-text">→</text>
				</view>
			</view>
		</view>

		<view class="vip-section" v-else>
			<view class="vip-card active" @click="showVipBenefits">
				<view class="vip-header">
					<view class="vip-icon active">
						<text class="vip-icon-text">👑</text>
					</view>
					<view class="vip-info">
						<text class="vip-title">VIP会员</text>
						<text class="vip-desc">已解锁全部权益</text>
					</view>
				</view>
				<view class="vip-badge">永久</view>
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
			</view>

			<!-- 我的邀请码 -->
			<view class="function-item" @click="openInviteCodeDialog">
				<view class="function-icon invite-icon">
					<text class="icon-text">🎁</text>
				</view>
				<view class="function-info">
					<text class="function-title">我的邀请码</text>
					<text class="function-desc">{{ hasInviter ? '已绑定邀请人 ✓' : '邀请好友获奖励' }}</text>
				</view>
				<!-- 已绑定标识 -->
				<view v-if="hasInviter" class="bound-indicator">
					<view class="bound-dot"></view>
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

		<!-- 邀请码弹窗 -->
		<view v-if="showInviteCodeDialog" class="dialog-overlay" @click="closeInviteCodeDialog">
			<view class="invite-dialog" @click.stop>
				<view class="dialog-header">
					<text class="dialog-title">我的邀请码</text>
					<view class="close-btn" @click="closeInviteCodeDialog">
						<text class="close-icon">✕</text>
					</view>
				</view>

				<view class="dialog-content">
					<!-- 二维码区域 -->
					<view class="qr-section">
						<view class="qr-container">
							<image :src="qrCodeUrl" class="qr-image" mode="aspectFit" />
						</view>
						<text class="qr-tip">扫码邀请好友</text>
					</view>

					<!-- 邀请码展示 -->
					<view class="invite-code-section">
						<text class="invite-label">我的邀请码</text>
						<view class="invite-code-box">
							<text class="invite-code">{{ inviteCode || '加载中...' }}</text>
							<view class="copy-btn" @click="copyInviteCode">
								<text class="copy-text">复制</text>
							</view>
						</view>
					</view>

					<!-- 填写邀请码区域（未绑定用户显示） -->
					<view v-if="!hasInviter" class="bind-section">
						<view class="divider">
							<text class="divider-text">或</text>
						</view>
						<view class="bind-options">
							<view class="bind-btn scan-btn" @click="scanInviteCode">
								<text class="btn-icon">📷</text>
								<text class="btn-text">扫码</text>
							</view>
							<view class="bind-btn input-btn" @click="openInputDialog">
								<text class="btn-icon">✏️</text>
								<text class="btn-text">填写</text>
							</view>
						</view>
					</view>

					<!-- 已绑定提示 -->
					<view v-else class="bound-section">
						<view class="bound-card">
							<view class="bound-header">
								<view class="bound-avatar">
									<text class="bound-avatar-icon">👤</text>
								</view>
								<view class="bound-info">
									<text class="bound-title">已绑定邀请人</text>
									<text class="bound-id">邀请人ID: {{ inviterId }}</text>
								</view>
							</view>
							<view class="bound-divider"></view>
							<view class="bound-status">
								<text class="status-icon">🔒</text>
								<text class="status-text">邀请关系已锁定，不可更改</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 填写邀请码弹窗 -->
		<view v-if="showScanDialog" class="dialog-overlay" @click="closeScanDialog">
			<view class="input-dialog" @click.stop>
				<view class="dialog-header">
					<text class="dialog-title">填写邀请码</text>
					<view class="close-btn" @click="closeScanDialog">
						<text class="close-icon">✕</text>
					</view>
				</view>

				<view class="dialog-content">
					<view class="input-section">
						<text class="input-label">请输入邀请码（8位字符）</text>
						<input
							v-model="inputInviteCode"
							class="invite-input"
							placeholder="请输入8位邀请码"
							maxlength="8"
						/>
					</view>
					<text class="input-tip">邀请码只能绑定一次，请确认无误</text>
					<button class="confirm-btn" @click="confirmBindInviter">确认绑定</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed } from 'vue';
	import { onLoad } from '@dcloudio/uni-app';
	import { getCurrentUser, getUserId, setUserType } from '@/utils/auth.js';
	import { uploadFile } from '@/utils/upload.js';
	import { updateUser, maintainInviter } from '@/api/userApi.js';

	// 用户类型 0-普通用户 1-会员 2-非会员
	const userType = ref(0);

	// 用户名相关
	const userName = ref('微信用户');
	const isEditing = ref(false);
	const editedName = ref(userName.value);
	// 头像相关
	const avatar = ref('');
	const defaultAvatar = '/static/images/avatar.png';
	const avatarUrl = computed(() => avatar.value || defaultAvatar);
	// 用户ID
	const userId = ref('');
	// 邀请码相关
	const inviteCode = ref('');
	const inviterId = ref('');
	const hasInviter = ref(false);

	// 弹窗显示状态
	const showInviteCodeDialog = ref(false);
	const showScanDialog = ref(false);
	const inputInviteCode = ref('');

	// 获取当前用户信息
	const fetchCurrentUser = async () => {
		try {
			const userInfo = await getCurrentUser();
			userName.value = userInfo.username || '微信用户';
			editedName.value = userName.value;
			// 获取头像
			avatar.value = userInfo.avatar || '';
			// 获取用户类型
			if (userInfo.userType !== undefined) {
				userType.value = userInfo.userType;
				setUserType(userInfo.userType);
			}
			// 获取邀请码和邀请人信息
			inviteCode.value = userInfo.inviteCode || '';
			inviterId.value = userInfo.inviterId || 0;
			// 邀请人ID大于0表示已绑定
			hasInviter.value = userInfo.inviterId > 0;
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
			// 停止下拉刷新
			uni.stopPullDownRefresh();
		}
	};
	
	// 页面加载时获取用户信息
	onMounted(async () => {
		await fetchCurrentUser();
	});

	// 页面加载时处理参数
	onLoad((options) => {
		// 处理自动填写邀请码（从首页跳转过来）
		if (options.autoFillInviteCode) {
			console.log('收到自动填写邀请码参数:', options.autoFillInviteCode);
			// 校验邀请码长度
			if (options.autoFillInviteCode.length !== 8) {
				uni.showToast({
					title: '邀请码格式错误',
					icon: 'none'
				});
				return;
			}
			// 延迟打开弹窗，等待页面数据加载完成
			setTimeout(() => {
				inputInviteCode.value = options.autoFillInviteCode;
				showScanDialog.value = true;
				// 清除本地存储的待处理邀请码
				uni.removeStorageSync('pending_invite_code');
			}, 500);
		}
	});

	// 下拉刷新
	onPullDownRefresh(async () => {
		console.log('用户页面下拉刷新');
		await fetchCurrentUser();
	});

	// 打开邀请码弹窗
	const openInviteCodeDialog = () => {
		showInviteCodeDialog.value = true;
	};

	// 关闭邀请码弹窗
	const closeInviteCodeDialog = () => {
		showInviteCodeDialog.value = false;
	};

	// 关闭填写邀请码弹窗
	const closeScanDialog = () => {
		showScanDialog.value = false;
		inputInviteCode.value = '';
	};

	// 打开填写邀请码弹窗
	const openInputDialog = () => {
		closeInviteCodeDialog();
		setTimeout(() => {
			showScanDialog.value = true;
		}, 200);
	};

	// 复制邀请码
	const copyInviteCode = () => {
		if (!inviteCode.value) return;
		uni.setClipboardData({
			data: inviteCode.value,
			success: () => {
				uni.showToast({
					title: '邀请码已复制',
					icon: 'success'
				});
			}
		});
	};

	// 扫码邀请码
	const scanInviteCode = () => {
		uni.scanCode({
			success: (res) => {
				console.log('扫码结果:', res);
				// 解析扫码结果，提取邀请码
				const scannedCode = res.result;
				if (scannedCode) {
					// 如果扫码结果是URL，尝试提取邀请码参数
					let code = scannedCode;
					if (scannedCode.includes('?')) {
						const params = new URLSearchParams(scannedCode.split('?')[1]);
						code = params.get('inviteCode') || scannedCode;
					}
					// 校验邀请码长度
					if (code.length !== 8) {
						uni.showToast({
							title: '邀请码必须为8位字符',
							icon: 'none'
						});
						return;
					}
					inputInviteCode.value = code;
					openInputDialog();
				}
			},
			fail: (err) => {
				console.error('扫码失败:', err);
				uni.showToast({
					title: '扫码失败',
					icon: 'none'
				});
			}
		});
	};

	// 确认绑定邀请人
	const confirmBindInviter = async () => {
		const code = inputInviteCode.value.trim();
		if (!code) {
			uni.showToast({
				title: '请输入邀请码',
				icon: 'none'
			});
			return;
		}

		// 检查邀请码是否为8位字符
		if (code.length !== 8) {
			uni.showToast({
				title: '邀请码必须为8位字符',
				icon: 'none'
			});
			return;
		}

		// 检查是否是自己的邀请码
		if (code === inviteCode.value) {
			uni.showToast({
				title: '不能绑定自己的邀请码',
				icon: 'none'
			});
			return;
		}

		// 显示确认弹窗
		uni.showModal({
			title: '确认绑定',
			content: '邀请码只能绑定一次，确认要绑定该邀请码吗？',
			confirmText: '确认绑定',
			cancelText: '再想想',
			confirmColor: '#1890ff',
			success: async (res) => {
				if (res.confirm) {
					try {
						uni.showLoading({ title: '绑定中...' });
						const response = await maintainInviter({
							inviteCode: code
						});
						uni.hideLoading();

						if (response.code === 200) {
							uni.showToast({
								title: '绑定成功',
								icon: 'success'
							});
							// 更新本地状态
							hasInviter.value = true;
							// 重新获取用户信息
							await fetchCurrentUser();
							// 关闭弹窗
							closeScanDialog();
						} else {
							uni.showToast({
								title: response.msg || '绑定失败',
								icon: 'none'
							});
						}
					} catch (error) {
						uni.hideLoading();
						console.error('绑定邀请人失败:', error);
						uni.showToast({
							title: '绑定失败，请重试',
							icon: 'none'
						});
					}
				}
			}
		});
	};

	// 计算二维码URL（使用邀请码生成二维码）
	const qrCodeUrl = computed(() => {
		if (!inviteCode.value) return '';
		// 使用小程序码生成接口，这里使用一个通用的二维码生成服务
		// 实际项目中应该使用后端生成的小程序码
		const pageUrl = encodeURIComponent(`/pages/index/index?inviteCode=${inviteCode.value}`);
		return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pageUrl}`;
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

	// 显示会员权益
	const showVipBenefits = () => {
		uni.navigateTo({
			url: '/pages/vip-benefits/vip-benefits'
		});
	};

	// 跳转到权益记录
	const navigateToVipRecords = () => {
		uni.navigateTo({
			url: '/pages/vip-records/vip-records'
		});
	};

	// 显示兑换码弹窗
	const showRedeemDialog = () => {
		uni.navigateTo({
			url: '/pages/vip-redeem/vip-redeem'
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
		const sharePath = `/pages/index/index?inviteCode=${inviteCode.value}`;
		return {
			title: '推荐一款好用的学习工具',
			desc: '快来和我一起学习，分享即可获得永久会员权益！超过26位好友注册即可获得永久会员权益！',
			path: sharePath,
			imageUrl: ''
		};
    })

	// 微信小程序分享到朋友圈 - 微信会自动识别此函数，无需导出
	onShareTimeline(()=>{
		const sharePath = `/pages/index/index?inviteCode=${inviteCode.value}`;
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

		/* VIP用户名 - 绚丽渐变色 */
		.vip-name {
			background: linear-gradient(90deg, #f7971e 0%, #ffd200 25%, #f7971e 50%, #ffd200 75%, #f7971e 100%);
			background-size: 200% auto;
			-webkit-background-clip: text;
			background-clip: text;
			-webkit-text-fill-color: transparent;
			animation: shimmer 3s linear infinite;
			text-shadow: 0 0 20rpx rgba(247, 151, 30, 0.3);
		}

		@keyframes shimmer {
			to {
				background-position: 200% center;
			}
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
	
	/* VIP会员卡片 */
	.vip-section {
		margin-bottom: 32rpx;
	}

	.vip-card {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20rpx;
		padding: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
		transition: all 0.3s ease;
	}

	.vip-card:active {
		transform: scale(0.98);
	}

	.vip-card.active {
		background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
		box-shadow: 0 8rpx 32rpx rgba(255, 215, 0, 0.3);
	}

	.vip-header {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.vip-icon {
		width: 80rpx;
		height: 80rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
	}

	.vip-icon.active {
		background: rgba(255, 255, 255, 0.3);
	}

	.vip-icon-text {
		font-size: 40rpx;
	}

	.vip-info {
		display: flex;
		flex-direction: column;
	}

	.vip-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #ffffff;
		margin-bottom: 8rpx;
	}

	.vip-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	.vip-arrow {
		width: 48rpx;
		height: 48rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
	}

	.vip-arrow .arrow-text {
		color: #ffffff;
		font-size: 28rpx;
	}

	.vip-badge {
		background: rgba(255, 255, 255, 0.9);
		color: #ffaa00;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: 600;
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

	.invite-icon {
		background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
	}

	/* 会员权益图标 */
	.vip-benefits-icon {
		background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
	}

	/* 权益记录图标 */
	.vip-record-icon {
		background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
	}

	/* 兑换码图标 */
	.redeem-icon {
		background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
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

	/* 已绑定标识 */
	.bound-indicator {
		position: absolute;
		right: 60rpx;
		top: 50%;
		transform: translateY(-50%);
	}

	.bound-dot {
		width: 16rpx;
		height: 16rpx;
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		border-radius: 50%;
		box-shadow: 0 0 8rpx rgba(82, 196, 26, 0.5);
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.8;
		}
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

	/* 弹窗遮罩层 */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8rpx);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	/* 邀请码弹窗 */
	.invite-dialog {
		width: 640rpx;
		background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
		border-radius: 32rpx;
		overflow: hidden;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
		animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	/* 填写邀请码弹窗 */
	.input-dialog {
		width: 600rpx;
		background: linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%);
		border-radius: 32rpx;
		overflow: hidden;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.3);
		animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(60rpx) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* 弹窗头部 */
	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 32rpx 32rpx 24rpx;
		border-bottom: 2rpx solid rgba(0, 0, 0, 0.06);
	}

	.dialog-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #2c3e50;
	}

	.close-btn {
		width: 56rpx;
		height: 56rpx;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: all 0.3s ease;
	}

	.close-btn:active {
		background: rgba(0, 0, 0, 0.1);
		transform: scale(0.9);
	}

	.close-icon {
		font-size: 28rpx;
		color: #666;
		font-weight: 300;
	}

	/* 弹窗内容 */
	.dialog-content {
		padding: 32rpx;
	}

	/* 二维码区域 */
	.qr-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 32rpx;
	}

	.qr-container {
		width: 280rpx;
		height: 280rpx;
		background: linear-gradient(135deg, #f0f5ff 0%, #e6f7ff 100%);
		border-radius: 20rpx;
		padding: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 8rpx 32rpx rgba(24, 144, 255, 0.15);
		border: 4rpx solid rgba(24, 144, 255, 0.1);
	}

	.qr-image {
		width: 240rpx;
		height: 240rpx;
	}

	.qr-tip {
		font-size: 26rpx;
		color: #666;
		margin-top: 16rpx;
		font-weight: 500;
	}

	/* 邀请码展示区域 */
	.invite-code-section {
		background: linear-gradient(135deg, #f6f8ff 0%, #f0f5ff 100%);
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 24rpx;
		border: 2rpx solid rgba(24, 144, 255, 0.1);
	}

	.invite-label {
		font-size: 24rpx;
		color: #666;
		margin-bottom: 16rpx;
		display: block;
		text-align: center;
	}

	.invite-code-box {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: #fff;
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	}

	.invite-code {
		font-size: 40rpx;
		font-weight: 700;
		color: #1890ff;
		font-family: 'Courier New', monospace;
		letter-spacing: 4rpx;
	}

	.copy-btn {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		padding: 12rpx 28rpx;
		border-radius: 12rpx;
		transition: all 0.3s ease;
	}

	.copy-btn:active {
		transform: scale(0.95);
	}

	.copy-text {
		font-size: 24rpx;
		color: #fff;
		font-weight: 600;
	}

	/* 分隔线 */
	.divider {
		display: flex;
		align-items: center;
		margin: 24rpx 0;
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 2rpx;
		background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
	}

	.divider-text {
		font-size: 24rpx;
		color: #999;
		padding: 0 24rpx;
	}

	/* 绑定选项 */
	.bind-options {
		display: flex;
		gap: 24rpx;
		justify-content: center;
	}

	.bind-btn {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 28rpx 20rpx;
		border-radius: 20rpx;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.bind-btn:active {
		transform: scale(0.95);
	}

	.scan-btn {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
	}

	.input-btn {
		background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
		box-shadow: 0 8rpx 24rpx rgba(114, 46, 209, 0.3);
	}

	.btn-icon {
		font-size: 48rpx;
		margin-bottom: 12rpx;
	}

	.btn-text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 600;
	}

	/* 已绑定提示 */
	.bound-section {
		display: flex;
		justify-content: center;
		padding: 24rpx 0;
	}

	.bound-card {
		width: 100%;
		background: linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%);
		border-radius: 24rpx;
		padding: 32rpx;
		border: 2rpx solid rgba(82, 196, 26, 0.2);
		box-shadow: 0 8rpx 32rpx rgba(82, 196, 26, 0.1);
	}

	.bound-header {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.bound-avatar {
		width: 80rpx;
		height: 80rpx;
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 4rpx 16rpx rgba(82, 196, 26, 0.3);
	}

	.bound-avatar-icon {
		font-size: 40rpx;
	}

	.bound-info {
		flex: 1;
	}

	.bound-title {
		font-size: 32rpx;
		font-weight: 700;
		color: #52c41a;
		display: block;
		margin-bottom: 8rpx;
	}

	.bound-id {
		font-size: 24rpx;
		color: #666;
		display: block;
	}

	.bound-divider {
		height: 2rpx;
		background: linear-gradient(90deg, transparent, rgba(82, 196, 26, 0.3), transparent);
		margin: 24rpx 0;
	}

	.bound-status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
		padding: 16rpx;
		background: rgba(82, 196, 26, 0.1);
		border-radius: 16rpx;
	}

	.status-icon {
		font-size: 28rpx;
	}

	.status-text {
		font-size: 26rpx;
		color: #52c41a;
		font-weight: 500;
	}

	/* 填写邀请码弹窗样式 */
	.input-section {
		margin-bottom: 24rpx;
	}

	.input-label {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 16rpx;
		display: block;
		font-weight: 600;
	}

	.invite-input {
		width: 100%;
		height: 96rpx;
		background: #f5f7fa;
		border: 2rpx solid #e8e8e8;
		border-radius: 16rpx;
		padding: 0 28rpx;
		font-size: 32rpx;
		color: #333;
		box-sizing: border-box;
		transition: all 0.3s ease;
	}

	.invite-input:focus {
		border-color: #1890ff;
		background: #fff;
		box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.1);
	}

	.input-tip {
		font-size: 24rpx;
		color: #ff6b6b;
		display: block;
		text-align: center;
		margin-bottom: 32rpx;
	}

	.confirm-btn {
		width: 100%;
		height: 96rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 16rpx;
		font-size: 32rpx;
		font-weight: 600;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
		transition: all 0.3s ease;
	}

	.confirm-btn:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.2);
	}

	.confirm-btn::after {
		border: none;
	}
</style>
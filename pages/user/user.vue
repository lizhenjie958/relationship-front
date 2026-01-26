<template>
	<view class="user-container">
		<!-- 页面头部 -->
		<view class="page-header">
			<text class="page-title">个人中心</text>
		</view>
		
		<!-- 用户信息卡片 -->
		<view class="user-card">
			<view class="user-avatar">
				<image src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20friendly%20smile%20professional%20business%20style&image_size=square" class="avatar-image" />
			</view>
			<view class="user-info">
				<text class="user-name">用户</text>
				<text class="user-level">普通会员</text>
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
			<view class="function-item" @click="contactService">
				<view class="function-icon service-icon">
					<text class="icon-text">💬</text>
				</view>
				<view class="function-info">
					<text class="function-title">联系客服</text>
					<text class="function-desc">获取帮助和支持</text>
				</view>
				<view class="function-arrow">
					<text class="arrow-text">→</text>
				</view>
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
					<text class="share-desc">分享给好友，双方均可获得</text>
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
	import { ref } from 'vue';
	
	// 跳转到答题记录
	const navigateToAnswerList = () => {
		uni.navigateTo({
			url: '/pages/answer-list/answer-list',
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
			url: '/pages/question-list/question-list',
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
		uni.showModal({
			title: '联系客服',
			content: '客服热线：400-123-4567\n工作时间：9:00-18:00',
			confirmText: '拨打电话',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					uni.makePhoneCall({
						phoneNumber: '4001234567'
					});
				}
			}
		});
	};
	
	// 分享应用
	const shareApp = () => {
		uni.showModal({
			title: '分享解锁会员',
			content: '分享此应用给好友，双方均可获得永久会员权益！',
			confirmText: '立即分享',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					uni.share({
						provider: "weixin",
						scene: "WXSceneSession",
						title: "推荐一款好用的学习工具",
						content: "快来和我一起学习，分享即可获得永久会员权益！",
						imageUrl: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=educational%20app%20promotion%20banner%20learning%20tools%20modern%20design&image_size=landscape_16_9",
						path: "/pages/index/index",
						success: function (res) {
							console.log("success:", res);
							uni.showToast({
								title: '分享成功',
								icon: 'success'
							});
						},
						fail: function (err) {
							console.log("fail:", err);
							uni.showToast({
								title: '分享失败',
								icon: 'none'
							});
						}
					});
				}
			}
		});
	};
</script>

<style lang="scss" scoped>
	.user-container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}
	
	/* 页面头部 */
	.page-header {
		padding: 32rpx 0;
		text-align: center;
		border-bottom: 2rpx solid #f1f3f5;
		margin-bottom: 32rpx;
	}
	
	.page-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #2c3e50;
		letter-spacing: 2rpx;
	}
	
	/* 用户信息卡片 */
	.user-card {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		border-radius: 24rpx;
		padding: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 32rpx;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.3);
	}
	
	.user-avatar {
		margin-right: 32rpx;
	}
	
	.avatar-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		border: 4rpx solid rgba(255, 255, 255, 0.8);
	}
	
	.user-info {
		text-align: center;
		color: #fff;
	}
	
	.user-name {
		font-size: 36rpx;
		font-weight: 600;
		margin-bottom: 8rpx;
		display: block;
	}
	
	.user-level {
		font-size: 24rpx;
		opacity: 0.9;
		display: block;
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
	
	/* 分享解锁会员权益 */
	.share-section {
		margin-bottom: 40rpx;
	}
	
	.share-card {
		background: linear-gradient(135deg, #722ed1 0%, #eb2f96 100%);
		border-radius: 24rpx;
		padding: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(114, 46, 209, 0.3);
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
		color: #fff;
	}
	
	.share-badge {
		padding: 8rpx 16rpx;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 16rpx;
		font-size: 20rpx;
		color: #fff;
	}
	
	.share-content {
		margin-bottom: 32rpx;
	}
	
	.share-desc {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 8rpx;
		display: block;
	}
	
	.share-reward {
		font-size: 32rpx;
		font-weight: 600;
		color: #fff;
		display: block;
	}
	
	.share-button {
		width: 100%;
		padding: 24rpx;
		background-color: rgba(255, 255, 255, 0.95);
		color: #722ed1;
		border: none;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}
	
	.share-button:hover {
		background-color: #fff;
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
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
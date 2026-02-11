<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="header-title">兑换权益</text>
			<text class="header-desc">输入兑换码获取会员权益</text>
		</view>

		<!-- 邀请人信息卡片 -->
		<view class="inviter-section" v-if="!queryInviterLoading">
			<view class="inviter-card" :class="{ 'has-inviter': inviterInfo }">
				<view class="inviter-header">
					<text class="inviter-icon">👤</text>
					<view class="inviter-info">
						<text class="inviter-label">{{ inviterInfo ? '已绑定邀请人' : '未绑定邀请人' }}</text>
						<text v-if="inviterInfo" class="inviter-name">{{ inviterInfo.inviterName || '未知' }}</text>
						<text v-else class="inviter-tip">绑定邀请人可获得额外奖励</text>
					</view>
				</view>
				<view v-if="inviterInfo" class="inviter-code">
					<text class="code-label">邀请码:</text>
					<text class="code-value">{{ inviterInfo.inviteCode }}</text>
				</view>
			</view>
		</view>

		<!-- 兑换输入区域 -->
		<view class="redeem-section">
			<view class="input-card">
				<view class="input-label">
					<text class="label-text">兑换码</text>
					<text class="required-mark">*</text>
				</view>
				<input
					v-model="redeemCode"
					class="redeem-input"
					placeholder="请输入10位兑换码"
					maxlength="10"
					@confirm="handleRedeem"
				/>
				<text v-if="errorMsg" class="error-text">{{ errorMsg }}</text>
			</view>

			<button
				class="redeem-btn"
				:disabled="!redeemCode || isLoading"
				:class="{ 'disabled': !redeemCode || isLoading }"
				@click="handleRedeem"
			>
				<text v-if="isLoading" class="btn-loading">兑换中...</text>
				<text v-else class="btn-text">立即兑换</text>
			</button>
		</view>

		<!-- 兑换说明 -->
		<view class="tips-section">
			<view class="tips-title">
				<text class="title-icon">💡</text>
				<text class="title-text">兑换说明</text>
			</view>
			<view class="tips-list">
				<view class="tip-item">
					<text class="tip-dot">•</text>
					<text class="tip-text">兑换码为10位字符，区分大小写</text>
				</view>
				<view class="tip-item">
					<text class="tip-dot">•</text>
					<text class="tip-text">每个兑换码只能使用一次</text>
				</view>
				<view class="tip-item">
					<text class="tip-dot">•</text>
					<text class="tip-text">兑换成功后权益立即生效</text>
				</view>
				<view class="tip-item">
					<text class="tip-dot">•</text>
					<text class="tip-text">如有问题请联系客服</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { redeemMember } from '@/api/memberApi.js';
import { queryInviter } from '@/api/userApi.js';

// 兑换码
const redeemCode = ref('');
// 错误信息
const errorMsg = ref('');
// 加载状态
const isLoading = ref(false);
// 邀请人信息
const inviterInfo = ref(null);
// 查询邀请人加载状态
const queryInviterLoading = ref(false);

// 页面加载时查询邀请人信息
onMounted(async () => {
	await fetchInviterInfo();
});

// 查询邀请人信息
const fetchInviterInfo = async () => {
	queryInviterLoading.value = true;
	try {
		const response = await queryInviter({});
		if (response.code === 200) {
			// data为null表示没有邀请人
			if (response.data) {
				inviterInfo.value = response.data;
			} else {
				inviterInfo.value = null;
			}
		}
	} catch (error) {
		console.error('查询邀请人信息失败:', error);
	} finally {
		queryInviterLoading.value = false;
	}
};

// 处理兑换
const handleRedeem = async () => {
	// 清除错误信息
	errorMsg.value = '';

	// 验证兑换码
	if (!redeemCode.value.trim()) {
		errorMsg.value = '请输入兑换码';
		return;
	}

	// 验证兑换码长度（必须为10位）
	if (redeemCode.value.length !== 10) {
		errorMsg.value = '兑换码必须为10位字符';
		return;
	}

	// 开始兑换
	isLoading.value = true;

	try {
		// 调用兑换接口
		const response = await redeemMember({
			redeemCode: redeemCode.value.trim()
		});
		console.log('兑换结果:', response);

		if (response.code === 200) {
			// 兑换成功
			uni.showToast({
				title: '兑换成功',
				icon: 'success',
				duration: 2000
			});

			// 清空输入
			redeemCode.value = '';

			// 延迟跳转到会员权益页
			setTimeout(() => {
				uni.navigateTo({
					url: '/pages/vip-benefits/vip-benefits'
				});
			}, 2000);
		} else {
			// 兑换失败
			errorMsg.value = response.msg || '兑换失败，请检查兑换码';
		}
	} catch (error) {
		console.error('兑换失败:', error);
		errorMsg.value = '兑换失败，请检查兑换码或网络';
	} finally {
		isLoading.value = false;
	}
};
</script>

<style scoped>
.container {
	padding: 30rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

/* 页面标题 */
.page-header {
	margin-bottom: 40rpx;
}

.header-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #333;
	display: block;
	margin-bottom: 12rpx;
}

.header-desc {
	font-size: 28rpx;
	color: #666;
	display: block;
}

/* 邀请人信息区域 */
.inviter-section {
	margin-bottom: 30rpx;
}

.inviter-card {
	background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
}

.inviter-card.has-inviter {
	background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
	box-shadow: 0 4rpx 16rpx rgba(76, 175, 80, 0.15);
}

.inviter-header {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.inviter-icon {
	width: 64rpx;
	height: 64rpx;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.inviter-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.inviter-label {
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
}

.inviter-name {
	font-size: 32rpx;
	color: #4caf50;
	font-weight: 700;
}

.inviter-tip {
	font-size: 24rpx;
	color: #999;
}

.inviter-code {
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid rgba(0, 0, 0, 0.06);
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.code-label {
	font-size: 24rpx;
	color: #666;
}

.code-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
	font-family: 'Courier New', monospace;
	background: rgba(255, 255, 255, 0.6);
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
}

/* 兑换区域 */
.redeem-section {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.input-card {
	margin-bottom: 30rpx;
}

.input-label {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 16rpx;
}

.label-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
}

.required-mark {
	font-size: 24rpx;
	color: #ff4d4f;
	font-weight: 600;
}

.redeem-input {
	width: 100%;
	height: 88rpx;
	background-color: #f8f9fa;
	border: 2rpx solid #e8e8e8;
	border-radius: 12rpx;
	padding: 0 24rpx;
	font-size: 32rpx;
	color: #333;
	box-sizing: border-box;
	transition: all 0.3s ease;
}

.redeem-input:focus {
	border-color: #667eea;
	background-color: #ffffff;
	box-shadow: 0 0 0 4rpx rgba(102, 126, 234, 0.1);
}

.error-text {
	font-size: 24rpx;
	color: #ff4d4f;
	margin-top: 12rpx;
	display: block;
}

.redeem-btn {
	width: 100%;
	height: 96rpx;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 48rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
	transition: all 0.3s ease;
}

.redeem-btn.disabled {
	opacity: 0.6;
	background: linear-gradient(135deg, #ccc 0%, #bbb 100%);
	box-shadow: none;
}

.redeem-btn:active:not(.disabled) {
	transform: scale(0.98);
	box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.2);
}

.btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

.btn-loading {
	font-size: 32rpx;
	font-weight: 600;
	color: #ffffff;
}

/* 说明区域 */
.tips-section {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 30rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.tips-title {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.title-icon {
	font-size: 32rpx;
}

.title-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.tips-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.tip-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
}

.tip-dot {
	font-size: 28rpx;
	color: #667eea;
	line-height: 40rpx;
}

.tip-text {
	font-size: 26rpx;
	color: #666;
	line-height: 40rpx;
	flex: 1;
}
</style>

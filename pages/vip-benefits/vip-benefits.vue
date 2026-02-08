<template>
	<view class="container">
		<!-- 会员状态卡片 -->
		<view class="vip-status-card" :class="{ 'is-member': isMember, 'is-expired': isExpired }">
			<!-- 装饰背景 -->
			<view class="card-decoration"></view>
			
			<view class="vip-status-content">
				<view class="vip-status-icon">
					<text class="status-icon-text">{{ isMember ? '👑' : '💎' }}</text>
					<view v-if="isMember && !isExpired" class="status-glow"></view>
				</view>
				<view class="vip-status-info">
					<text class="vip-status-title">{{ isMember ? (isExpired ? '会员已过期' : 'VIP会员') : '开通VIP会员' }}</text>
					<text class="vip-status-desc">{{ isMember ? (isExpired ? '续费恢复会员权益' : '您已享受全部会员权益') : '解锁专属会员权益' }}</text>
				</view>
			</view>
			
			<!-- 会员时间信息 -->
			<view v-if="isMember" class="vip-time-info">
				<view class="time-item">
					<text class="time-label">生效时间</text>
					<text class="time-value">{{ memberInfo.enableTime || '-' }}</text>
				</view>
				<view class="time-divider"></view>
				<view class="time-item">
					<text class="time-label">{{ isExpired ? '过期时间' : '有效期至' }}</text>
					<text class="time-value" :class="{ 'expired-text': isExpired }">{{ memberInfo.expireTime || '-' }}</text>
				</view>
			</view>
			
			<!-- 状态标签 -->
			<view v-if="isMember" class="status-badge" :class="{ 'expired': isExpired, 'active': !isExpired }">
				<text class="badge-text">{{ isExpired ? '已过期' : '生效中' }}</text>
			</view>
		</view>

		<!-- 会员权益列表 -->
		<view class="benefits-section">
			<view class="section-header">
				<view class="section-icon">✨</view>
				<text class="section-title">会员权益</text>
			</view>
			<view class="benefits-list">
				<view class="benefit-item" v-for="(benefit, index) in benefits" :key="index">
					<view class="benefit-icon" :class="benefit.iconClass">
						<text class="icon-text">{{ benefit.icon }}</text>
					</view>
					<view class="benefit-info">
						<text class="benefit-title">{{ benefit.title }}</text>
						<text class="benefit-desc">{{ benefit.desc }}</text>
					</view>
					<view class="benefit-check" v-if="isMember && !isExpired">
						<text class="check-icon">✓</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 操作按钮区 -->
		<view class="action-section">
			<view class="action-card" @click="navigateToRedeem">
				<view class="action-icon redeem">
					<text class="icon-text">🎫</text>
				</view>
				<view class="action-info">
					<text class="action-title">兑换权益</text>
					<text class="action-desc">输入兑换码获得会员</text>
				</view>
				<view class="action-arrow">
					<text class="arrow-text">→</text>
				</view>
			</view>

			<view class="action-card" @click="navigateToRecords">
				<view class="action-icon record">
					<text class="icon-text">📋</text>
				</view>
				<view class="action-info">
					<text class="action-title">权益记录</text>
					<text class="action-desc">查看权益获得记录</text>
				</view>
				<view class="action-arrow">
					<text class="arrow-text">→</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { queryMember } from '@/api/memberApi.js';

// 会员信息
const memberInfo = ref({
	enableTime: '',
	expireTime: '',
	enableStatus: 2
});

// 是否为会员（有数据即为会员）
const isMember = computed(() => {
	return memberInfo.value && (memberInfo.value.enableTime || memberInfo.value.expireTime);
});

// 是否已过期
const isExpired = computed(() => {
	if (!isMember.value) return false;
	// enableStatus为2表示失效，或者过期时间小于当前时间
	if (memberInfo.value.enableStatus === 2) return true;
	if (memberInfo.value.expireTime) {
		return new Date(memberInfo.value.expireTime) < new Date();
	}
	return false;
});

// 权益列表
const benefits = [
	{
		title: '免广告',
		desc: '享受纯净无广告体验',
		icon: '🚫',
		iconClass: 'no-ads'
	},
	{
		title: '领取试卷',
		desc: '可领取自己出的试卷',
		icon: '📋',
		iconClass: 'exam'
	},
	{
		title: '无限创建',
		desc: '主角创建数量无限制',
		icon: '∞',
		iconClass: 'unlimited'
	}
];

// 获取会员信息
const fetchMemberInfo = async () => {
	try {
		const response = await queryMember();
		console.log('会员信息:', response);
		if (response.code === 200 && response.data) {
			memberInfo.value = response.data;
		}
	} catch (error) {
		console.error('获取会员信息失败:', error);
	}
};

onLoad(() => {
	// 获取会员信息
	fetchMemberInfo();
});

// 跳转到兑换页面
const navigateToRedeem = () => {
	uni.navigateTo({
		url: '/pages/vip-redeem/vip-redeem'
	});
};

// 跳转到权益记录页面
const navigateToRecords = () => {
	uni.navigateTo({
		url: '/pages/vip-records/vip-records'
	});
};
</script>

<style scoped>
.container {
	padding: 30rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

/* 会员状态卡片 */
.vip-status-card {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border-radius: 28rpx;
	padding: 40rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 12rpx 40rpx rgba(102, 126, 234, 0.35);
	position: relative;
	overflow: hidden;
}

.vip-status-card.is-member {
	background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
	box-shadow: 0 12rpx 40rpx rgba(255, 215, 0, 0.35);
}

.vip-status-card.is-expired {
	background: linear-gradient(135deg, #a8a8a8 0%, #7a7a7a 100%);
	box-shadow: 0 12rpx 40rpx rgba(120, 120, 120, 0.3);
}

/* 装饰背景 */
.card-decoration {
	position: absolute;
	top: -50%;
	right: -30%;
	width: 300rpx;
	height: 300rpx;
	background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
	border-radius: 50%;
}

.vip-status-content {
	display: flex;
	align-items: center;
	gap: 24rpx;
	position: relative;
	z-index: 1;
}

.vip-status-icon {
	width: 108rpx;
	height: 108rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	backdrop-filter: blur(10rpx);
	position: relative;
}

.status-icon-text {
	font-size: 52rpx;
}

.status-glow {
	position: absolute;
	width: 100%;
	height: 100%;
	border-radius: 28rpx;
	background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%);
	animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
	0%, 100% { transform: scale(1); opacity: 1; }
	50% { transform: scale(1.1); opacity: 0.7; }
}

.vip-status-info {
	flex: 1;
}

.vip-status-title {
	font-size: 38rpx;
	font-weight: 800;
	color: #ffffff;
	display: block;
	margin-bottom: 10rpx;
}

.vip-status-desc {
	font-size: 26rpx;
	color: rgba(255, 255, 255, 0.85);
	display: block;
}

/* 会员时间信息 */
.vip-time-info {
	margin-top: 32rpx;
	padding-top: 28rpx;
	border-top: 2rpx solid rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	gap: 24rpx;
	position: relative;
	z-index: 1;
}

.time-item {
	flex: 1;
}

.time-label {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.7);
	display: block;
	margin-bottom: 6rpx;
}

.time-value {
	font-size: 26rpx;
	color: #ffffff;
	font-weight: 600;
}

.time-value.expired-text {
	color: #ff6b6b;
}

.time-divider {
	width: 2rpx;
	height: 50rpx;
	background: rgba(255, 255, 255, 0.2);
}

/* 状态标签 */
.status-badge {
	position: absolute;
	top: 24rpx;
	right: 24rpx;
	padding: 8rpx 20rpx;
	border-radius: 24rpx;
	z-index: 1;
}

.status-badge.active {
	background: rgba(82, 196, 26, 0.9);
}

.status-badge.expired {
	background: rgba(255, 77, 79, 0.9);
}

.badge-text {
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 600;
}

/* 会员权益区域 */
.benefits-section {
	background-color: #ffffff;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.section-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 28rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.section-icon {
	font-size: 32rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #333;
}

.benefits-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.benefit-item {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 24rpx;
	background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
	border-radius: 20rpx;
	border: 2rpx solid #f0f0f0;
	transition: all 0.3s ease;
}

.benefit-item:active {
	transform: scale(0.98);
	border-color: #e0e0e0;
}

.benefit-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.benefit-icon.no-ads {
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.benefit-icon.exam {
	background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
}

.benefit-icon.unlimited {
	background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.benefit-icon .icon-text {
	font-size: 40rpx;
}

.benefit-info {
	flex: 1;
}

.benefit-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.benefit-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
}

.benefit-check {
	width: 44rpx;
	height: 44rpx;
	background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
}

.check-icon {
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 700;
}

/* 操作区域 */
.action-section {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.action-card {
	background-color: #ffffff;
	border-radius: 20rpx;
	padding: 28rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
	transition: all 0.3s ease;
}

.action-card:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.action-icon {
	width: 76rpx;
	height: 76rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.action-icon.redeem {
	background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
}

.action-icon.record {
	background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
}

.action-icon .icon-text {
	font-size: 36rpx;
}

.action-info {
	flex: 1;
}

.action-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.action-desc {
	font-size: 24rpx;
	color: #666;
	display: block;
}

.action-arrow {
	width: 52rpx;
	height: 52rpx;
	background: #f5f5f5;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.action-card:active .action-arrow {
	background: #e8e8e8;
}

.action-arrow .arrow-text {
	font-size: 28rpx;
	color: #999;
}
</style>

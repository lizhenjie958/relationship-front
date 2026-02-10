<template>
	<view class="env-debug-container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="header-title">环境调试</text>
			<text class="header-desc">切换API环境配置，用于开发和测试</text>
		</view>

		<!-- 当前环境显示 -->
		<view class="current-env-card">
			<view class="env-label">当前环境</view>
			<view class="env-value" :class="currentEnv">{{ currentEnvName }}</view>
			<view class="env-url">{{ currentBaseUrl }}</view>
		</view>

		<!-- 环境选择列表 -->
		<view class="env-list" v-if="canAccess">
			<view class="section-title">选择环境</view>
			
			<view 
				v-for="env in envList" 
				:key="env.key"
				class="env-item"
				:class="{ active: currentEnv === env.key }"
				@click="switchEnvironment(env.key)"
			>
				<view class="env-item-left">
					<view class="env-icon" :class="env.key">{{ env.icon }}</view>
					<view class="env-info">
						<text class="env-name">{{ env.name }}</text>
						<text class="env-desc">{{ env.baseUrl }}</text>
					</view>
				</view>
				<view v-if="currentEnv === env.key" class="env-check">
					<text class="check-icon">✓</text>
				</view>
			</view>
		</view>

		<!-- 操作按钮 -->
		<view class="action-section" v-if="canAccess">
			<button class="action-btn save-btn" @click="saveAndRestart">
				<text class="btn-text">保存并重启</text>
			</button>
			<button class="action-btn reset-btn" @click="resetToDefault">
				<text class="btn-text">恢复默认</text>
			</button>
		</view>

		<!-- 无权限提示 -->
		<view class="no-access-card" v-if="!canAccess">
			<view class="no-access-icon">🔒</view>
			<view class="no-access-title">暂无权限</view>
			<view class="no-access-desc">该功能仅对特定用户开放</view>
		</view>

		<!-- 提示信息 -->
		<view class="tips-section" v-if="canAccess">
			<view class="tips-title">💡 使用说明</view>
			<view class="tips-list">
				<text class="tips-item">• 切换环境后需要重启应用才能生效</text>
				<text class="tips-item">• 生产环境用于正式用户使用</text>
				<text class="tips-item">• 本地环境用于本地开发调试</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getUserId } from '@/utils/auth.js';
import { 
	getEnvList, 
	getCurrentEnv, 
	getEnvName, 
	getBaseUrl,
	switchEnv, 
	resetEnv 
} from '@/config/env.js';

// 允许访问的用户ID列表
const ALLOWED_USER_IDS = ['1', 1];

// 是否有权限访问
const canAccess = ref(false);

// 环境列表
const envList = ref([]);

// 当前环境
const currentEnv = ref('');
const currentEnvName = ref('');
const currentBaseUrl = ref('');

// 页面加载时检查权限和获取当前环境
onMounted(() => {
	// 检查用户权限
	const userId = getUserId();
	canAccess.value = ALLOWED_USER_IDS.includes(userId) || ALLOWED_USER_IDS.includes(Number(userId));
	
	if (!canAccess.value) {
		return;
	}
	
	// 获取环境列表
	envList.value = getEnvList().map(env => ({
		...env,
		icon: env.key === 'production' ? '🚀' : '💻'
	}));
	
	// 获取当前环境信息
	currentEnv.value = getCurrentEnv();
	currentEnvName.value = getEnvName();
	currentBaseUrl.value = getBaseUrl();
});

// 切换环境
const switchEnvironment = (envKey) => {
	const env = envList.value.find(e => e.key === envKey);
	if (env) {
		currentEnv.value = envKey;
		currentEnvName.value = env.name;
		currentBaseUrl.value = env.baseUrl;
		
		uni.showToast({
			title: `已切换到${env.name}`,
			icon: 'none'
		});
	}
};

// 保存并重启
const saveAndRestart = () => {
	uni.showModal({
		title: '确认保存',
		content: '保存后需要重启应用才能生效，是否继续？',
		confirmText: '保存并重启',
		cancelText: '取消',
		success: (res) => {
			if (res.confirm) {
				// 保存环境配置
				const success = switchEnv(currentEnv.value);
				
				if (success) {
					uni.showToast({
						title: '保存成功，即将重启',
						icon: 'success',
						duration: 1500
					});
					
					// 延迟重启应用
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
				} else {
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					});
				}
			}
		}
	});
};

// 恢复默认
const resetToDefault = () => {
	uni.showModal({
		title: '确认恢复',
		content: '将恢复到生产环境配置，是否继续？',
		confirmText: '恢复',
		cancelText: '取消',
		success: (res) => {
			if (res.confirm) {
				const success = resetEnv();
				
				if (success) {
					currentEnv.value = 'production';
					currentEnvName.value = '生产环境';
					currentBaseUrl.value = 'http://relationship.muchunfeng.top';
					
					uni.showToast({
						title: '已恢复默认',
						icon: 'success',
						duration: 1500
					});
					
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/index/index'
						});
					}, 1500);
				} else {
					uni.showToast({
						title: '恢复失败',
						icon: 'none'
					});
				}
			}
		}
	});
};
</script>

<style lang="scss" scoped>
.env-debug-container {
	padding: 20rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

/* 页面标题 */
.page-header {
	margin-bottom: 32rpx;
}

.header-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #2c3e50;
	display: block;
	margin-bottom: 8rpx;
}

.header-desc {
	font-size: 26rpx;
	color: #666;
}

/* 当前环境卡片 */
.current-env-card {
	background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
	border-radius: 20rpx;
	padding: 32rpx;
	margin-bottom: 32rpx;
	box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.2);
}

.env-label {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-bottom: 12rpx;
}

.env-value {
	font-size: 40rpx;
	font-weight: 700;
	color: #fff;
	margin-bottom: 12rpx;
}

.env-value.local {
	color: #52c41a;
}

.env-url {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.9);
	font-family: 'Courier New', monospace;
}

/* 环境列表 */
.env-list {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 32rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 24rpx;
}

.env-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx;
	border-radius: 12rpx;
	margin-bottom: 16rpx;
	background-color: #f8f9fa;
	transition: all 0.3s ease;
}

.env-item:last-child {
	margin-bottom: 0;
}

.env-item.active {
	background-color: #e6f7ff;
	border: 2rpx solid #1890ff;
}

.env-item-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.env-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
	background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}

.env-icon.production {
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.env-icon.local {
	background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.env-info {
	display: flex;
	flex-direction: column;
}

.env-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 4rpx;
}

.env-desc {
	font-size: 22rpx;
	color: #666;
}

.env-check {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.check-icon {
	color: #fff;
	font-size: 24rpx;
	font-weight: 700;
}

/* 操作按钮 */
.action-section {
	display: flex;
	gap: 20rpx;
	margin-bottom: 32rpx;
}

.action-btn {
	flex: 1;
	height: 88rpx;
	border: none;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
}

.save-btn {
	background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
	box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
}

.save-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
}

.reset-btn {
	background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}

.reset-btn:active {
	transform: scale(0.98);
}

.btn-text {
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
}

.reset-btn .btn-text {
	color: #666;
}

/* 无权限提示 */
.no-access-card {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 80rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	margin-bottom: 32rpx;
}

.no-access-icon {
	font-size: 80rpx;
	margin-bottom: 24rpx;
}

.no-access-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #666;
	margin-bottom: 12rpx;
}

.no-access-desc {
	font-size: 26rpx;
	color: #999;
}

/* 提示信息 */
.tips-section {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.tips-title {
	font-size: 28rpx;
	font-weight: 600;
	color: #2c3e50;
	margin-bottom: 16rpx;
}

.tips-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.tips-item {
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
}
</style>
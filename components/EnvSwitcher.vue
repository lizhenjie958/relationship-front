<template>
	<!-- 仅在非生产环境显示 -->
	<view v-if="!isProduction" class="env-switcher">
		<view class="env-current" @click="showPicker = true">
			<view class="env-badge">{{ currentEnv.name }}</view>
			<text class="env-url">{{ currentEnv.url }}</text>
			<text class="env-arrow">▼</text>
		</view>
		
		<!-- 环境选择弹窗 -->
		<view v-if="showPicker" class="env-picker-mask" @click="showPicker = false">
			<view class="env-picker" @click.stop>
				<view class="env-picker-header">
					<text class="env-picker-title">切换运营环境</text>
					<text class="env-picker-close" @click="showPicker = false">✕</text>
				</view>
				<view class="env-picker-list">
					<view
						v-for="env in envList"
						:key="env.key"
						class="env-option"
						:class="{ active: currentEnv.key === env.key }"
						@click="switchEnv(env)"
					>
						<view class="env-option-info">
							<text class="env-option-name">{{ env.name }}</text>
							<text class="env-option-url">{{ env.url }}</text>
						</view>
						<text v-if="currentEnv.key === env.key" class="env-option-check">✓</text>
					</view>
				</view>
				<view class="env-picker-footer">
					<text class="env-tip">切换后需要重新启动小程序生效</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 环境列表
const envList = [
	{
		key: 'dev',
		name: '开发环境',
		url: 'http://127.0.0.1:8888'
	},
	{
		key: 'test',
		name: '测试环境',
		url: 'http://60bj4820ma68.vicp.fun'
	}
];

// 是否为生产环境
const isProduction = computed(() => {
	// 通过判断当前API域名是否为生产环境
	const currentUrl = import.meta.env.VITE_API_DOMAIN || '';
	// 如果当前是生产环境域名，则不显示切换器
	// 这里假设生产环境域名不包含 localhost 或 vicp.fun
	return !currentUrl.includes('localhost') && 
		   !currentUrl.includes('127.0.0.1') && 
		   !currentUrl.includes('vicp.fun');
});

// 当前环境
const currentEnv = ref(envList[0]);
const showPicker = ref(false);

// 初始化当前环境
onMounted(() => {
	const savedEnv = uni.getStorageSync('current_env');
	if (savedEnv) {
		const env = envList.find(e => e.key === savedEnv);
		if (env) {
			currentEnv.value = env;
		}
	} else {
		// 根据当前环境变量判断
		const currentUrl = import.meta.env.VITE_API_DOMAIN || '';
		const env = envList.find(e => currentUrl.includes(e.url.replace('http://', '').replace('https://', '').split(':')[0]));
		if (env) {
			currentEnv.value = env;
		}
	}
});

// 切换环境
const switchEnv = (env) => {
	if (currentEnv.value.key === env.key) {
		showPicker.value = false;
		return;
	}
	
	uni.showModal({
		title: '切换环境',
		content: `确定切换到 ${env.name} 吗？\n${env.url}\n\n切换后需要重新启动小程序才能生效。`,
		confirmText: '切换',
		cancelText: '取消',
		success: (res) => {
			if (res.confirm) {
				// 保存选择的环境
				uni.setStorageSync('current_env', env.key);
				uni.setStorageSync('custom_api_domain', env.url);
				currentEnv.value = env;
				showPicker.value = false;
				
				uni.showToast({
					title: '切换成功，请重启',
					icon: 'none',
					duration: 2000
				});
			}
		}
	});
};

// 获取当前设置的API域名（供外部使用）
export const getApiDomain = () => {
	const customDomain = uni.getStorageSync('custom_api_domain');
	if (customDomain) {
		return customDomain;
	}
	return import.meta.env.VITE_API_DOMAIN;
};
</script>

<style scoped>
.env-switcher {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	z-index: 9999;
	padding: 8rpx 20rpx;
	background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
}

.env-current {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
	padding: 12rpx 20rpx;
}

.env-badge {
	background: rgba(255, 255, 255, 0.9);
	color: #ff6b6b;
	font-size: 22rpx;
	font-weight: 600;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
}

.env-url {
	color: #ffffff;
	font-size: 24rpx;
	flex: 1;
	text-align: center;
}

.env-arrow {
	color: #ffffff;
	font-size: 20rpx;
}

/* 弹窗遮罩 */
.env-picker-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	z-index: 10000;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40rpx;
}

/* 选择器 */
.env-picker {
	background: #ffffff;
	border-radius: 24rpx;
	width: 100%;
	max-width: 600rpx;
	overflow: hidden;
}

.env-picker-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.env-picker-title {
	font-size: 32rpx;
	font-weight: 700;
	color: #333;
}

.env-picker-close {
	font-size: 32rpx;
	color: #999;
	padding: 8rpx;
}

.env-picker-list {
	max-height: 600rpx;
	overflow-y: auto;
}

.env-option {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 32rpx;
	border-bottom: 2rpx solid #f5f5f5;
}

.env-option:active {
	background: #f8f8f8;
}

.env-option.active {
	background: #fff8f8;
}

.env-option-info {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.env-option-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.env-option.active .env-option-name {
	color: #ff6b6b;
}

.env-option-url {
	font-size: 24rpx;
	color: #999;
}

.env-option-check {
	font-size: 32rpx;
	color: #ff6b6b;
	font-weight: 700;
}

.env-picker-footer {
	padding: 24rpx 32rpx;
	background: #fafafa;
}

.env-tip {
	font-size: 24rpx;
	color: #999;
	display: block;
	text-align: center;
}
</style>

<template>
	<view class="question-record-container">
		<view class="page-header">
			<view class="header-left">
				<button class="back-button" @click="goBack">
					<text class="back-icon">←</text>
					<text class="back-text">返回</text>
				</button>
			</view>
			<text class="page-title">答题记录</text>
			<view class="header-right"></view>
		</view>

		<view class="record-content">
			<view class="record-info">
				<text class="info-label">试卷ID：</text>
				<text class="info-value">{{ questionId }}</text>
			</view>
			
			<view class="empty-state" v-if="!questionId">
				<text class="empty-text">暂无答题记录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const questionId = ref('');

// 从路由参数中获取试卷ID
onMounted(() => {
	const pages = getCurrentPages();
	const currentPage = pages[pages.length - 1];
	if (currentPage && currentPage.options && currentPage.options.id) {
		questionId.value = currentPage.options.id;
		console.log('Received question ID:', questionId.value);
		// 这里可以添加根据试卷ID获取答题记录的逻辑
	}
});

// 返回上一页
const goBack = () => {
	uni.navigateBack({
		delta: 1
	});
};
</script>

<style scoped>
.question-record-container {
	padding: 20rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

.page-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 30rpx;
}

.header-left {
	flex: 1;
}

.back-button {
	display: flex;
	align-items: center;
	background: none;
	border: none;
	padding: 0;
}

.back-icon {
	font-size: 32rpx;
	color: #333;
	margin-right: 8rpx;
}

.back-text {
	font-size: 28rpx;
	color: #333;
}

.page-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #333;
}

.header-right {
	flex: 1;
}

.record-content {
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	padding: 30rpx;
}

.record-info {
	margin-bottom: 20rpx;
}

.info-label {
	font-size: 28rpx;
	color: #666;
	margin-right: 12rpx;
}

.info-value {
	font-size: 28rpx;
	color: #333;
	font-weight: 600;
}

.empty-state {
	padding: 100rpx 0;
	text-align: center;
}

.empty-text {
	font-size: 28rpx;
	color: #999;
}

/* 响应式调整 */
@media (max-width: 750rpx) {
	.question-record-container {
		padding: 16rpx;
	}

	.page-title {
		font-size: 32rpx;
	}

	.record-content {
		padding: 24rpx;
	}

	.info-label,
	.info-value {
		font-size: 24rpx;
	}
}
</style>
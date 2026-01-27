<template>
	<view class="container">
		<!-- 顶部统计卡片 -->
		<view class="stats-container">
			<view class="stat-card">
				<text class="stat-label">答题</text>
				<text class="stat-value">1次</text>
			</view>
			<view class="stat-card">
				<text class="stat-label">最高得分</text>
				<text class="stat-value">80</text>
			</view>
			<view class="stat-card">
				<text class="stat-label">全国排名</text>
				<text class="stat-value">1000</text>
			</view>
		</view>

		<!-- 提示信息 -->
		<view class="tip-container">
			<text class="tip-text">连续完成30天答题，可永久解锁会员权益</text>
		</view>

		<!-- 日历组件 -->
		<view class="calendar-container">
			<uni-calendar 
				:selected="selectedDates" 
				:range="false" 
				@change="handleCalendarChange"
				:insert="true"
				:lunar="false"
				:start-date="'2021-01-01'"
				:end-date="'2026-12-31'"
			></uni-calendar>
		</view>

		<!-- 广告版位 -->
		<view class="ad-container">
			<text class="ad-text">广告版位</text>
		</view>

		<!-- 分享记录表格 -->
		<view class="share-container">
			<view class="share-header">
				<text class="share-col">分享人</text>
				<text class="share-col">分享时间</text>
				<text class="share-col">过期时间</text>
				<text class="share-col">操作</text>
			</view>
			<view class="share-row">
				<text class="share-col">老王</text>
				<text class="share-col">2026-01-26 22:18</text>
				<text class="share-col">2026-01-2622:18</text>
				<text class="continue-btn" @click="continueAnswer(1)">继续作答</text>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';

	// 日历相关数据
	const selectedDates = ref(['2021-05-04']);
	const answeredDays = ref(['2021-05-04', '2021-05-20']); // 已答题的日期

	// 处理日历选择变化
	const handleCalendarChange = (e) => {
		selectedDates.value = e.detail.value;
	};

	// 页面加载时初始化
onMounted(() => {
	// 可以在这里添加初始化逻辑
});

// 继续答题
const continueAnswer = (recordId) => {
	uni.navigateTo({
		url: `/pages/answer-record/answer-record?id=${recordId}`
	});
};
</script>

<style scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f5f5;
		min-height: 100vh;
	}

	/* 顶部统计卡片 */
	.stats-container {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
	}

	.stat-card {
		flex: 1;
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin: 0 10rpx;
		text-align: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.stat-label {
		display: block;
		font-size: 24rpx;
		color: #666666;
		margin-bottom: 8rpx;
	}

	.stat-value {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	/* 提示信息 */
	.tip-container {
		background-color: #e8f0fe;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #1890ff;
		text-align: center;
	}

	/* 日历组件 */
	.calendar-container {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	/* 调整uni-calendar组件的样式 */
	.uni-calendar {
		--calendar-border-color: transparent;
	}

	.uni-calendar__header {
		padding-bottom: 16rpx;
	}

	.uni-calendar__body {
		padding-top: 0;
	}

	.uni-calendar__cell {
		height: 60rpx;
		line-height: 60rpx;
	}

	.uni-calendar__cell--current {
		background-color: #1890ff;
		color: #ffffff;
		border-radius: 50%;
	}

	.uni-calendar__cell--selected {
		background-color: #e6f7ff;
		color: #1890ff;
		border-radius: 50%;
	}

	/* 广告版位 */
	.ad-container {
		background-color: #e0e0e0;
		border-radius: 12rpx;
		padding: 80rpx 0;
		margin-bottom: 20rpx;
		text-align: center;
	}

	.ad-text {
		font-size: 28rpx;
		color: #666666;
	}

	/* 分享记录表格 */
	.share-container {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 100rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.share-header {
		display: flex;
		border-bottom: 2rpx solid #f0f0f0;
		padding-bottom: 16rpx;
		margin-bottom: 16rpx;
	}

	.share-col {
		flex: 1;
		font-size: 24rpx;
		color: #666666;
		text-align: center;
	}

	.share-row {
		display: flex;
		align-items: center;
		padding: 16rpx 0;
	}

	.continue-btn {
		background-color: #1890ff;
		color: #ffffff;
		padding: 8rpx 16rpx;
		border-radius: 4rpx;
		font-size: 22rpx;
	}

	/* 底部导航栏 */
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		display: flex;
		justify-content: space-around;
		padding: 16rpx 0;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 40rpx;
	}

	.tab-item.active .tab-text {
		color: #1890ff;
	}

	.tab-icon {
		font-size: 36rpx;
		margin-bottom: 8rpx;
	}

	.tab-text {
		font-size: 24rpx;
		color: #666666;
	}
</style>

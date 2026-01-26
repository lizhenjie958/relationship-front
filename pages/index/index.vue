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
			<view class="calendar-header">
				<text class="calendar-nav" @click="prevYear">&laquo;</text>
				<text class="calendar-nav" @click="prevMonth">&lt;</text>
				<text class="calendar-title">{{ currentYear }} {{ currentMonth }}</text>
				<text class="calendar-nav" @click="nextMonth">&gt;</text>
				<text class="calendar-nav" @click="nextYear">&raquo;</text>
			</view>
			<view class="calendar-weekdays">
				<text v-for="day in weekdays" :key="day" class="weekday">{{ day }}</text>
			</view>
			<view class="calendar-days">
				<text 
					v-for="(day, index) in calendarDays" 
					:key="index" 
					:class="['day', { 'current-day': day === currentDate, 'answered-day': answeredDays.includes(day) }]"
				>
					{{ day }}
				</text>
			</view>
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
				<text class="share-col">2026-01-26
22:18</text>
				<text class="share-col">2026-01-26
22:18</text>
				<text class="continue-btn">继续作答</text>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';

	// 日历相关数据
	const currentYear = ref(2021);
	const currentMonth = ref(5);
	const currentDate = ref(4);
	const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
	const calendarDays = ref([]);
	const answeredDays = ref([4, 20]); // 已答题的日期

	// 生成日历数据
	const generateCalendar = () => {
		const days = [];
		// 模拟生成日历数据，实际项目中需要根据月份计算
		// 这里直接使用设计图中的数据
		days.push(25, 26, 27, 28, 29, 30, 1);
		days.push(2, 3, 4, 5, 6, 7, 8);
		days.push(9, 10, 11, 12, 13, 14, 15);
		days.push(16, 17, 18, 19, 20, 21, 22);
		days.push(23, 24, 25, 26, 27, 28, 29);
		days.push(30, 31, 1, 2, 3, 4, 5);
		calendarDays.value = days;
	};

	// 日历导航方法
	const prevYear = () => {
		currentYear.value--;
		generateCalendar();
	};

	const nextYear = () => {
		currentYear.value++;
		generateCalendar();
	};

	const prevMonth = () => {
		if (currentMonth.value === 1) {
			currentMonth.value = 12;
			currentYear.value--;
		} else {
			currentMonth.value--;
		}
		generateCalendar();
	};

	const nextMonth = () => {
		if (currentMonth.value === 12) {
			currentMonth.value = 1;
			currentYear.value++;
		} else {
			currentMonth.value++;
		}
		generateCalendar();
	};

	// 页面加载时生成日历
	onMounted(() => {
		generateCalendar();
	});
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

	.calendar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.calendar-nav {
		font-size: 28rpx;
		color: #666666;
		padding: 0 10rpx;
	}

	.calendar-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
	}

	.calendar-weekdays {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16rpx;
	}

	.weekday {
		flex: 1;
		font-size: 24rpx;
		color: #666666;
		text-align: center;
	}

	.calendar-days {
		display: flex;
		flex-wrap: wrap;
	}

	.day {
		width: 14.28%;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24rpx;
		color: #333333;
		margin-bottom: 10rpx;
	}

	.current-day {
		background-color: #1890ff;
		color: #ffffff;
		border-radius: 50%;
		width: 50rpx;
		height: 50rpx;
	}

	.answered-day {
		background-color: #e6f7ff;
		color: #1890ff;
		border-radius: 50%;
		width: 50rpx;
		height: 50rpx;
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

<template>
	<view class="container">
		<!-- 今日答题统计 -->
		<view class="today-stats-container">
			<view class="today-stats-header">
				<text class="today-stats-title">今日答题统计</text>
				<text class="today-date">{{ todayDate }}</text>
			</view>
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
		</view>

		<!-- 连续答题挑战 -->
		<view class="challenge-container">
			<!-- 提示信息 -->
			<view class="tip-container">
				<text class="tip-text">连续完成30天答题，可永久解锁会员权益</text>
			</view>

			<!-- 日历组件 -->
			<view class="calendar-container">
				<uni-calendar 
					:insert="true"
					start-date="2021-01-01"
					end-date="2026-12-31"
					:selected="answeredDates"
				></uni-calendar>
			</view>
		</view>

		<!-- 未完成答题记录 -->
		<view class="share-container">
			<!-- 未完成答题提示 -->
			<view class="unfinished-tip" v-if="latestAnswering">
				<view class="tip-icon">!</view>
				<view class="tip-content">
					<text class="tip-title">未完成答题</text>
					<text class="tip-desc">您有1份试卷尚未完成，请及时作答</text>
				</view>
			</view>
			
			<!-- 最近进行中的答题记录 -->
			<view class="share-content" v-if="latestAnswering">
				<view class="share-header">
					<view class="share-col">
						<text>试卷名称</text>
					</view>
					<view class="share-col">
						<text>主角</text>
					</view>
					<view class="share-col">
						<text>过期时间</text>
					</view>
				</view>
				<view class="share-row" @click="continueAnswer(latestAnswering.id)">
					<view class="share-col">
						<text>{{ latestAnswering.examPaperName }}</text>
					</view>
					<view class="share-col">
						<view class="protagonist-info">
							<image 
								:src="latestAnswering.protagonistInfoDTO.picUrl" 
								class="protagonist-avatar" 
								mode="aspectFill"
							></image>
						</view>
					</view>
					<view class="share-col">
						<text>{{ formatDateTime(latestAnswering.timeoutTime) }}</text>
					</view>
				</view>
			</view>
		</view>

	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { queryTargetPath } from '@/api/shareApi.js';
import { request } from '@/utils/request.js';

	// 今日日期
	const todayDate = ref('');
	// 已答题日期（正确格式）
	const answeredDates = ref([]);
	// 最近进行中的答题记录
	const latestAnswering = ref(null);
	// 主角名称提示框显示状态（保留，可能其他地方需要）
	const showTooltip = ref(false);

	// 格式化日期
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// 格式化日期时间
	const formatDateTime = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleString();
	};

	// 生成模拟的已答题日期（正确格式）
	const generateAnsweredDates = () => {
		const dates = [];
		const today = new Date();
		
		// 模拟最近7天中有5天答题了
		for (let i = 0; i < 7; i++) {
			if (i !== 2 && i !== 4) { // 跳过2天
				const date = new Date(today);
				date.setDate(today.getDate() - i);
				dates.push({
					date: formatDate(date),
					info: '已答题'
				});
			}
		}
		
		return dates;
	};

	// 获取最近进行中的答题记录
	const fetchLatestAnswering = async () => {
		try {
			const response = await request({
				url: '/answerPaper/queryLatestAnswering',
				method: 'POST',
				data: {}
			});
			
			if (response.code === 200 && response.data) {
				latestAnswering.value = response.data;
			}
		} catch (error) {
			console.error('获取最近进行中的答题记录失败:', error);
		}
	};

	// 处理分享code，获取跳转路径
	const handleShareCode = async (shareCode) => {
		// 验证shareCode是否为32位字符串
		if (shareCode && /^[a-zA-Z0-9]{32}$/.test(shareCode)) {
			try {
				// 调用查询目标路径接口
				const response = await queryTargetPath({
					shareCode: shareCode
				});
				
				if (response.code === 200 && response.data) {
					// 根据返回路径跳转
					uni.navigateTo({
						url: response.data
					});
				}
			} catch (error) {
				console.error('调用查询目标路径接口失败:', error);
			}
		}
	};

	// 切换主角名称提示框（保留，可能其他地方需要）
	const toggleTooltip = () => {
		showTooltip.value = !showTooltip.value;
	};

	// 页面加载时获取URL参数
	onLoad((options) => {
		// 解析URL参数中的shareCode
		if (options.shareCode) {
			handleShareCode(options.shareCode);
		}
	});

	// 页面加载时初始化
	onMounted(() => {
		// 设置今日日期
		todayDate.value = formatDate(new Date());
		// 设置已答题日期
		answeredDates.value = generateAnsweredDates();
		// 获取最近进行中的答题记录
		fetchLatestAnswering();
	});

	// 继续答题
	const continueAnswer = (recordId) => {
		uni.navigateTo({
			url: `/pages/answer-paper-detail/answer-paper-detail?id=${recordId}`
		});
	};
</script>

<style scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	/* 今日答题统计容器 */
	.today-stats-container {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	/* 装饰元素 */
	.today-stats-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, #1890ff, #69c0ff);
		border-radius: 16rpx 16rpx 0 0;
	}

	/* 今日答题统计标题 */
	.today-stats-header {
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.today-stats-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		position: relative;
		padding-left: 16rpx;
	}

	.today-stats-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 24rpx;
		background-color: #1890ff;
		border-radius: 3rpx;
	}

	/* 日期显示 */
	.today-date {
		font-size: 20rpx;
		color: #999999;
	}

	/* 顶部统计卡片 */
	.stats-container {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0;
		gap: 16rpx;
	}

	.stat-card {
		flex: 1;
		border-radius: 12rpx;
		padding: 20rpx;
		margin: 0 10rpx;
		text-align: center;
		background-color: #fafafa;
		border: 2rpx solid #f0f0f0;
	}

	.stat-card:hover {
		background-color: #f0f7ff;
		border-color: #d6e4ff;
		transition: all 0.3s ease;
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

	/* 连续答题挑战容器 */
	.challenge-container {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	/* 装饰元素 */
	.challenge-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, #52c41a, #95de64);
		border-radius: 16rpx 16rpx 0 0;
	}

	/* 提示信息 */
	.tip-container {
		background-color: #f6ffed;
		border: 2rpx solid #b7eb8f;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #52c41a;
		text-align: center;
		font-weight: 500;
	}

	/* 日历组件 */
	.calendar-container {
		background-color: transparent;
		border-radius: 12rpx;
		padding: 0;
		margin-bottom: 0;
		box-shadow: none;
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
		background-color: #f6ffed;
		color: #52c41a;
		border-radius: 50%;
		position: relative;
	}

	.uni-calendar__cell--selected::after {
		content: '✓';
		position: absolute;
		bottom: 2rpx;
		right: 2rpx;
		font-size: 16rpx;
		font-weight: bold;
		color: #52c41a;
		background-color: #ffffff;
		border-radius: 50%;
		width: 24rpx;
		height: 24rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2rpx solid #52c41a;
	}

	/* 分享记录表格 */
	.share-container {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 100rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	/* 未完成答题提示 */
	.unfinished-tip {
		display: flex;
		align-items: center;
		background-color: #fff7e6;
		border: 2rpx solid #ffd591;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.tip-icon {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background-color: #fa8c16;
		color: #ffffff;
		font-size: 24rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 12rpx;
	}

	.tip-content {
		flex: 1;
	}

	.tip-title {
		font-size: 24rpx;
		font-weight: bold;
		color: #d46b08;
		margin-bottom: 4rpx;
		display: block;
	}

	.tip-desc {
		font-size: 20rpx;
		color: #fa8c16;
		display: block;
	}

	/* 分享记录内容 */
	.share-content {
		border-top: 2rpx solid #f0f0f0;
		padding-top: 20rpx;
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
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 8rpx;
		box-sizing: border-box;
	}

	.share-row {
		display: flex;
		align-items: center;
		padding: 16rpx 0;
	}

	.continue-btn {
		background-color: #1890ff;
		color: #ffffff;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.continue-btn:hover {
		background-color: #40a9ff;
	}

	/* 主角信息样式 */
	.protagonist-info {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 主角头像样式 */
	.protagonist-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 2rpx solid #f0f0f0;
		transition: all 0.3s ease;
		cursor: pointer;
		transform: translateY(0) scale(1);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.protagonist-avatar:hover {
		transform: translateY(-4rpx) scale(2);
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.2);
	}

	/* 主角信息样式 - 调整位置防止头像放大时遮挡其他内容 */
	.protagonist-info {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx;
	}

	/* 点击行效果 */
	.share-row {
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.share-row:active {
		background-color: #f0f7ff;
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

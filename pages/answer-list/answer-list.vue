<template>
	<view class="answer-list-container">
		
		<!-- Tab切换 -->
		<view class="tab-container">
			<view 
				v-for="tab in tabs" 
				:key="tab.value" 
				class="tab-item" 
				:class="{ active: activeTab === tab.value }"
				@click="switchTab(tab.value)"
			>
				<text class="tab-text">{{ tab.label }}</text>
			</view>
		</view>

		<!-- 表格容器 -->
		<view class="table-container">
			<!-- 表格头部 -->
			<view class="table-header">
					<view class="table-cell creator-cell">出题人</view>
					<view class="table-cell protagonist-cell">主角</view>
					<view class="table-cell answer-time-cell">答题时间</view>
					<view class="table-cell complete-time-cell">{{ activeTab === 'completed' ? '完成时间' : '过期时间' }}</view>
					<view v-if="activeTab === 'completed'" class="table-cell score-cell">得分</view>
					<view class="table-cell action-cell">{{ activeTab === 'completed' ? '操作' : '查看' }}</view>
				</view>

				<!-- 表格内容 -->
				<view class="table-body">
					<view v-for="item in filteredAnswers" :key="item.id" class="table-row">
						<view class="table-cell creator-cell">
							<text class="creator">{{ item.creator }}</text>
						</view>
						<view class="table-cell protagonist-cell">
							<text class="protagonist" @click="goToQuestionList">{{ item.protagonist }}</text>
						</view>
						<view class="table-cell answer-time-cell">
						<text class="answer-time">{{ item.answerTime }}</text>
					</view>
					<view class="table-cell complete-time-cell">
						<text class="complete-time">{{ activeTab === 'completed' ? item.completeTime : item.expireTime }}</text>
					</view>
					<view v-if="activeTab === 'completed'" class="table-cell score-cell">
						<text class="score">{{ item.score }}</text>
					</view>
					<view class="table-cell action-cell">
						<text class="action-arrow" @click="goToAnswerRecord(item.id)">→</text>
					</view>
					</view>
				</view>

			<!-- 空状态 -->
			<view v-if="filteredAnswers.length === 0" class="empty-state">
				<text class="empty-text">暂无答题记录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// Tab配置
const tabs = [
	{ label: '进行中', value: 'ongoing' },
	{ label: '已完成', value: 'completed' },
	{ label: '已过期', value: 'expired' }
];

// 当前激活的Tab
const activeTab = ref('ongoing');

// 模拟答题记录数据
const answers = ref([
	{
		id: 1,
		status: 'ongoing',
		creator: '张三',
		protagonist: '李四',
		answerTime: '2026-01-26 10:00',
		expireTime: '2026-01-27 10:00',
		score: '0'
	},
	{
		id: 2,
		status: 'completed',
		creator: '赵六',
		protagonist: '钱七',
		answerTime: '2026-01-25 14:30',
		completeTime: '2026-01-25 15:00',
		score: '85'
	},
	{
		id: 3,
		status: 'expired',
		creator: '周九',
		protagonist: '吴十',
		answerTime: '2026-01-24 09:00',
		expireTime: '2026-01-25 09:00',
		score: '0'
	},
	{
		id: 4,
		status: 'completed',
		creator: '王二',
		protagonist: '张三',
		answerTime: '2026-01-23 16:00',
		completeTime: '2026-01-23 16:30',
		score: '90'
	}
]);

// 根据当前Tab过滤数据
const filteredAnswers = computed(() => {
	return answers.value.filter(item => item.status === activeTab.value);
});

// 切换Tab
const switchTab = (tabValue) => {
	activeTab.value = tabValue;
};



// 跳转到试卷列表
const goToQuestionList = () => {
	uni.navigateTo({
		url: '/pages/question-list/question-list'
	});
};

// 跳转到答题记录详情
const goToAnswerRecord = (recordId) => {
	uni.navigateTo({
		url: `/pages/answer-record/answer-record?id=${recordId}`
	});
};

onMounted(() => {
	console.log('Answer list page mounted');
});
</script>

<style scoped>
.answer-list-container {
	padding: 20rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}



/* Tab样式 */
.tab-container {
	display: flex;
	background-color: #fff;
	border-radius: 12rpx;
	padding: 8rpx;
	margin-bottom: 30rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 16rpx;
	border-radius: 8rpx;
	transition: all 0.3s ease;
}

.tab-item.active {
	background-color: #1890ff;
}

.tab-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #666;
	transition: all 0.3s ease;
}

.tab-item.active .tab-text {
	color: #fff;
}

/* 表格样式 */
.table-container {
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.table-header {
	display: flex;
	background-color: #f8f9fa;
	border-bottom: 2rpx solid #e9ecef;
	padding: 20rpx;
	font-weight: 600;
	color: #333;
	font-size: 24rpx;
}

.table-row {
	display: flex;
	align-items: center;
	padding: 24rpx 20rpx;
	border-bottom: 2rpx solid #f0f0f0;
	transition: background-color 0.3s ease;
}

.table-row:hover {
	background-color: #f8f9fa;
}

.table-cell {
	display: flex;
	align-items: center;
	word-break: break-word;
}

.creator-cell {
	flex: 1.5;
}

.protagonist-cell {
	flex: 1;
}

.answer-time-cell {
	flex: 1.5;
}

.complete-time-cell {
	flex: 1.5;
}

.score-cell {
		flex: 1;
		justify-content: center;
	}

	.action-cell {
		flex: 1;
		justify-content: center;
	}

	.action-arrow {
		cursor: pointer;
		font-size: 48rpx;
		color: #1890ff;
		font-weight: bold;
		transition: all 0.3s ease;
	}

	.action-arrow:hover {
		transform: translateX(4rpx);
		color: #40a9ff;
	}

.creator,
.answer-time,
.complete-time,
.score {
	font-size: 24rpx;
	color: #333;
}

.protagonist {
	font-size: 24rpx;
	color: #1890ff;
	cursor: pointer;
	text-decoration: underline;
	transition: color 0.3s ease;
}

.protagonist:hover {
	color: #40a9ff;
}

/* 空状态样式 */
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
	.answer-list-container {
		padding: 16rpx;
	}

	.page-title {
		font-size: 32rpx;
	}

	.tab-text {
		font-size: 24rpx;
	}

	.table-header {
		padding: 16rpx;
		font-size: 22rpx;
	}

	.table-row {
		padding: 20rpx 16rpx;
	}

	.creator,
	.protagonist,
	.answer-time,
	.complete-time,
	.score {
		font-size: 22rpx;
	}
}
</style>
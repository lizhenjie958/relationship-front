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
			<!-- 加载状态 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<template v-else>
				<!-- 表格头部 -->
				<view class="table-header">
					<view class="table-cell creator-cell">出题人</view>
					<view class="table-cell protagonist-cell">主角</view>
					<view class="table-cell answer-time-cell">答题时间</view>
					<view class="table-cell complete-time-cell">{{ activeTab === 'completed' ? '完成时间' : '过期时间' }}</view>
					<view v-if="activeTab === 'completed'" class="table-cell score-cell">得分</view>
				</view>

				<!-- 表格内容 -->
				<view class="table-body">
					<view
						v-for="item in filteredAnswers"
						:key="item.id"
						class="table-row"
						@click="goToAnswerRecord(item.id)"
					>
						<view class="table-cell creator-cell">
							<text class="creator">{{ item.creator }}</text>
						</view>
						<view class="table-cell protagonist-cell">
							<text class="protagonist">{{ item.protagonist }}</text>
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
					</view>
				</view>

				<!-- 空状态 -->
				<view v-if="filteredAnswers.length === 0" class="empty-state">
					<view class="empty-icon">📭</view>
					<text class="empty-text">暂无答题记录</text>
					<text class="empty-hint">快去答题吧</text>
				</view>
			</template>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { queryAnswerPaperList } from '@/api/answerPaperApi.js';

// Tab配置
const tabs = [
	{ label: '进行中', value: 'ongoing' },
	{ label: '已完成', value: 'completed' },
	{ label: '超时/放弃', value: 'expired' }
];

// 当前激活的Tab
const activeTab = ref('ongoing');

// 模拟答题记录数据
const answers = ref([]);

// 加载状态
const loading = ref(false);

// 调用真实API获取答题记录
const fetchAnswers = async () => {
	loading.value = true;
	try {
		// 根据当前tab确定请求参数
		let requestParams = {};
		
		if (activeTab.value === 'ongoing') {
			// 进行中
			requestParams = { answerStatus: 1 }; // ANSWERING
		} else if (activeTab.value === 'completed') {
			// 已完成
			requestParams = { answerStatus: 2 }; // COMPLETED
		} else if (activeTab.value === 'expired') {
			// 超时/放弃 - 使用answerStatusList查询多个状态
			requestParams = { answerStatusList: [3, 4] }; // GIVEN_UP(3), TIMED_OUT(4)
		}
		
		// 调用API
		const response = await queryAnswerPaperList(requestParams);
		
		if (response.code === 200) {
			// 处理返回数据，映射为组件需要的格式
			const apiData = response.data.list || [];
			answers.value = apiData.map(item => ({
					id: item.id,
					status: activeTab.value, // 当前tab对应的状态
					creator: '系统管理员', // 接口未返回，暂时使用默认值
					protagonist: item.protagonistInfoDTO?.protagonist || '',
					answerTime: item.createTime ? new Date(item.createTime).toLocaleString() : '',
					expireTime: item.timeoutTime ? new Date(item.timeoutTime).toLocaleString() : '',
					completeTime: item.completeTime ? new Date(item.completeTime).toLocaleString() : '',
					score: item.score || 0, // 使用接口返回的真实score值
					examPaperId: item.examPaperId,
					examPaperName: item.examPaperName,
					protagonistInfo: item.protagonistInfoDTO
				}));
		} else {
			uni.showToast({
				title: response.msg || '获取答题记录失败',
				icon: 'none'
			});
			answers.value = [];
		}
	} catch (error) {
		console.error('获取答题记录失败:', error);
		uni.showToast({
			title: '获取答题记录失败，请稍后重试',
			icon: 'none'
		});
		answers.value = [];
	} finally {
		loading.value = false;
	}
};

// 根据当前Tab过滤数据
const filteredAnswers = computed(() => {
	return answers.value;
});

// 切换Tab
const switchTab = async (tabValue) => {
	activeTab.value = tabValue;
	// 切换Tab后重新获取对应状态的数据
	await fetchAnswers();
};

// 页面下拉刷新
onPullDownRefresh(async () => {
	console.log('答题列表页面下拉刷新');
	await fetchAnswers();
	uni.stopPullDownRefresh();
});

// 跳转到试卷列表
const goToQuestionList = () => {
	uni.navigateTo({
		url: '/pages/exam-paper-list/exam-paper-list'
	});
};

// 跳转到答题记录详情
const goToAnswerRecord = (recordId) => {
	uni.navigateTo({
		url: `/pages/answer-paper-detail/answer-paper-detail?id=${recordId}`
	});
};

onMounted(async () => {
	// 页面挂载时获取数据
	await fetchAnswers();
});
</script>

<style lang="scss" scoped>
@import '@/styles/theme.scss';

.answer-list-container {
	padding: 24rpx;
	background: linear-gradient(180deg, #f0f5ff 0%, #f5f7fa 100%);
	min-height: 100vh;
}

/* 加载状态 */
.loading-container {
	padding: 120rpx 0;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 24rpx;
}

.loading-spinner {
	@include loading-spinner(64rpx, $primary);
}

.loading-text {
	font-size: $font-md;
	color: $text-tertiary;
	font-weight: 500;
	letter-spacing: 2rpx;
}

/* Tab样式 */
.tab-container {
	display: flex;
	background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
	border-radius: $radius-lg;
	padding: 10rpx;
	margin-bottom: 32rpx;
	box-shadow: $shadow-sm;
	border: 2rpx solid rgba(24, 144, 255, 0.08);
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 18rpx 16rpx;
	border-radius: $radius-md;
	transition: all $transition-normal;
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 4rpx;
		background: linear-gradient(90deg, $primary 0%, $primary-light 100%);
		transition: width $transition-normal;
		border-radius: $radius-full;
	}
}

.tab-item.active {
	background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
	box-shadow: $shadow-primary;
	
	&::before {
		display: none;
	}
}

.tab-text {
	font-size: $font-md;
	font-weight: 600;
	color: $text-secondary;
	transition: all $transition-normal;
	letter-spacing: 1rpx;
}

.tab-item.active .tab-text {
	color: #fff;
}

.tab-item:not(.active):active {
	background: rgba(24, 144, 255, 0.05);
	
	&::before {
		width: 40%;
	}
}

/* 表格样式 */
.table-container {
	background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
	border-radius: $radius-lg;
	box-shadow: $shadow-md;
	overflow: hidden;
	border: 2rpx solid rgba(24, 144, 255, 0.05);
}

.table-header {
	display: flex;
	background: linear-gradient(135deg, #f8faff 0%, #f0f5ff 100%);
	border-bottom: 2rpx solid rgba(24, 144, 255, 0.08);
	padding: 24rpx;
	font-weight: 600;
	color: $text-primary;
	font-size: $font-sm;
	letter-spacing: 1rpx;
}

.table-row {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	border-bottom: 2rpx solid $border-color-light;
	transition: all $transition-normal;
	background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
	position: relative;
	overflow: hidden;
	
	&::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4rpx;
		background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
		opacity: 0;
		transition: opacity $transition-normal;
	}
}

.table-row:last-child {
	border-bottom: none;
}

.table-row:active {
	background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
	
	&::before {
		opacity: 1;
	}
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

.creator,
.answer-time,
.complete-time,
.score {
	font-size: $font-sm;
	color: $text-primary;
	font-weight: 500;
}

.protagonist {
	font-size: $font-sm;
	color: $text-primary;
	font-weight: 600;
	transition: all $transition-normal;
}

.table-row:active .protagonist {
	color: $primary;
}

/* 空状态样式 */
.empty-state {
	padding: 160rpx 48rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 32rpx;
}

.empty-icon {
	font-size: 140rpx;
	opacity: 0.8;
	animation: float 3s ease-in-out infinite;
	filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.1));
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-10rpx);
	}
}

.empty-text {
	font-size: 32rpx;
	color: #909399;
	font-weight: 600;
}

.empty-hint {
	font-size: 26rpx;
	color: #c0c4cc;
	font-weight: 400;
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
		color: #333; /* 响应式设计中保持颜色一致 */
	}
}
</style>
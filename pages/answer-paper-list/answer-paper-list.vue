<template>
	<view class="answer-list-container" @refresherrefresh="onRefresh" @refresherpulling="onRefresherPulling" :refresher-enabled="true" :refresher-threshold="80" :refresher-default-style="'default'" :refresher-triggered="refresherTriggered">
		
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
				<text class="empty-text">暂无答题记录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { request } from '@/utils/request.js';

// Tab配置
const tabs = [
	{ label: '进行中', value: 'ongoing' },
	{ label: '已完成', value: 'completed' },
	{ label: '已过期', value: 'expired' }
];

// 当前激活的Tab
const activeTab = ref('ongoing');

// 模拟答题记录数据
const answers = ref([]);

// 下拉刷新状态
const refresherTriggered = ref(false);

// 调用真实API获取答题记录
const fetchAnswers = async () => {
	try {
		// 根据当前tab确定answerStatus参数
		let answerStatusMap = {
			'ongoing': 1, // ANSWERING
			'completed': 2, // COMPLETED
			'expired': 4 // TIMED_OUT
		};
		
		// 调用API
		const response = await request({
			url: '/answerPaper/queryList',
			method: 'POST',
			data: {
				answerStatus: answerStatusMap[activeTab.value]
			}
		});
		
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

// 下拉刷新事件处理
const onRefresh = async () => {
	// 开始刷新，显示loading
	refresherTriggered.value = true;
	// 重新获取答题记录
	await fetchAnswers();
	// 刷新完成，隐藏loading
	refresherTriggered.value = false;
};

// 下拉过程事件处理（可选）
const onRefresherPulling = () => {
	// 可以在这里添加下拉过程中的动画或状态更新
};

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

		/* 添加表格行点击效果 */
		.table-row {
			cursor: pointer;
			transition: all 0.3s ease;
		}

		.table-row:active {
			background-color: #e6f7ff;
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
		color: #333;
		cursor: pointer;
		transition: color 0.3s ease;
	}

	.protagonist:hover {
		color: #1890ff;
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
		color: #333; /* 响应式设计中保持颜色一致 */
	}
}
</style>
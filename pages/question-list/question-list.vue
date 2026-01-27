<template>
	<view class="question-list-container">
		
		<view class="table-container">
			<!-- 表格头部 -->
			<view class="table-header">
				<view class="table-cell record-cell">试卷ID</view>
				<view class="table-cell name-cell">主角</view> 
				<view class="table-cell avatar-cell">头像</view>
			</view>

			<!-- 表格内容 -->
			<view class="table-body">
				<view v-for="item in questions" :key="item.id" class="table-row">
					<view class="table-cell record-cell">
						<text class="paper-id" @click="goToRecord(item.id)">{{ item.id }}</text>
					</view>
					<view class="table-cell name-cell">
						<text class="name">{{ item.name }}</text>
					</view>
					<view class="table-cell avatar-cell">
						<view class="avatar">
							<image :src="item.avatar" class="avatar-image" />
						</view>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-if="questions.length === 0" class="empty-state">
				<text class="empty-text">暂无试卷数据</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 模拟试卷数据
const questions = ref([
	{ id: 1, name: '张三', avatar: 'https://via.placeholder.com/50', answerCount: 5 },
	{ id: 2, name: '李四', avatar: 'https://via.placeholder.com/50', answerCount: 3 },
	{ id: 3, name: '王五', avatar: 'https://via.placeholder.com/50', answerCount: 8 },
	{ id: 4, name: '赵六', avatar: 'https://via.placeholder.com/50', answerCount: 2 }
]);

// 跳转到答题记录页
const goToRecord = (questionId) => {
	uni.navigateTo({
		url: `/pages/question-record/question-record?id=${questionId}`
	});
};

onMounted(() => {
	// 这里可以添加实际的数据获取逻辑
	console.log('Question list page mounted');
});
</script>

<style scoped>
.question-list-container {
	padding: 20rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}



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
	font-size: 28rpx;
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
}

.name-cell {
	flex: 2;
}

.avatar-cell {
	flex: 1;
	justify-content: center;
}

.record-cell {
	flex: 1;
	justify-content: center;
}

.name {
	font-size: 28rpx;
	color: #333;
}

.avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	overflow: hidden;
	background-color: #f0f0f0;
}

.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.paper-id {
		font-size: 28rpx;
		color: #1890ff;
		cursor: pointer;
		text-decoration: underline;
		transition: color 0.3s ease;
	}

	.paper-id:hover {
		color: #40a9ff;
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
	.question-list-container {
		padding: 16rpx;
	}

	.table-header,
	.table-row {
		padding: 16rpx;
	}



	.name,
	.record-count {
		font-size: 24rpx;
	}

	.avatar {
		width: 50rpx;
		height: 50rpx;
	}
}
</style>
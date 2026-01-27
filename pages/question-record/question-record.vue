<template>
	<view class="question-record">
		
		<!-- 试卷信息区域 -->
		<view class="paper-info">
			<view class="info-card">
				<view class="info-item">
					<text class="info-label">试卷ID：</text>
					<text class="info-value">{{ paperId }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">主角：</text>
					<text class="info-value">{{ protagonistName }}</text>
				</view>
				<view class="info-item">
					<text class="info-label">出题人：</text>
					<text class="info-value">{{ creatorName }}</text>
				</view>
			</view>
		</view>
		
		<!-- 题目信息组件 -->
		<QuestionInfo 
			:paperId="paperId"
			:usageSource="'question-record'"
			:showAnswer="true"
		/>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import QuestionInfo from '@/components/QuestionInfo.vue';
	
	// 接收外部传入的试卷ID参数
	const props = defineProps({
		id: {
			type: String,
			default: ''
		}
	});
	
	// 试卷ID
	const paperId = ref(props.id || 'P20260127001');
	// 模拟数据
	const protagonistName = ref('张三');
	const creatorName = ref('系统管理员');
	
	// 页面挂载
	onMounted(() => {
		// 这里可以根据传入的试卷ID获取实际数据
		console.log('Question record page mounted with paperId:', paperId.value);
	});
</script>

<style lang="scss" scoped>
	.question-record {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}
	
	
	
	/* 试卷信息区域 */
	.paper-info {
		margin-bottom: 32rpx;
	}
	
	.info-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
	}
	
	.info-card:hover {
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
	}
	
	.info-item {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.info-item:last-child {
		margin-bottom: 0;
	}
	
	.info-label {
		font-size: 28rpx;
		color: #666;
		width: 120rpx;
	}
	
	.info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}
	
	/* 题目信息区域 */
	.question-section {
		margin-bottom: 40rpx;
	}
	
	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #f1f3f5;
	}
	
	.question-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #2c3e50;
	}
	
	.question-count {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}
	
	/* 可左右滑动的题目容器 */
	.questions-container {
		width: 100%;
		overflow: hidden;
		position: relative;
		margin-bottom: 32rpx;
	}
	
	.questions-wrapper {
		display: flex;
		transition: transform 0.3s ease;
	}
	
	.question-slide {
		width: 100%;
		flex-shrink: 0;
		padding: 0 20rpx;
	}
	
	.question-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
	}
	
	.question-card:hover {
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
	}
	
	/* 题目序号 */
	.question-number {
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #f1f3f5;
	}
	
	.question-number text {
		font-size: 28rpx;
		font-weight: 600;
		color: #2c3e50;
	}
	
	/* 问题内容 */
	.question-content {
		margin-bottom: 32rpx;
	}
	
	.question-text {
		font-size: 30rpx;
		color: #333;
		line-height: 1.5;
		margin-bottom: 24rpx;
		display: block;
	}
	
	.question-image {
		width: 100%;
		margin: 20rpx 0;
		border-radius: 8rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.question-image .image {
		width: 100%;
		height: 400rpx;
		object-fit: cover;
	}
	
	/* 选项列表 */
	.options-list {
		margin-bottom: 32rpx;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20rpx;
	}
	
	.option-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 16rpx;
		border-radius: 12rpx;
		background-color: #f8f9fa;
		transition: all 0.3s ease;
		position: relative;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	}
	
	.option-item:hover {
		background-color: #e6f7ff;
		transform: translateY(-4rpx);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	}
	
	.option-image {
		width: 100%;
		border-radius: 8rpx;
		overflow: hidden;
		background-color: #f0f2f5;
		position: relative;
	}
	
	.option-image .image {
		width: 100%;
		height: 240rpx;
		object-fit: cover;
		transition: transform 0.3s ease;
	}
	
	.option-item:hover .option-image .image {
		transform: scale(1.05);
	}
	
	.option-label {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #1890ff;
		border-radius: 50%;
		font-size: 24rpx;
		font-weight: 600;
		color: #fff;
		margin-top: 16rpx;
		box-shadow: 0 2rpx 4rpx rgba(24, 144, 255, 0.3);
		transition: all 0.3s ease;
	}
	
	.option-item:hover .option-label {
		background-color: #40a9ff;
		transform: scale(1.05);
	}
	
	/* 答案区域 */
	.answer-section {
		margin-top: 32rpx;
		padding: 24rpx;
		background-color: #f6ffed;
		border-radius: 8rpx;
		border-left: 4rpx solid #52c41a;
	}
	
	.answer-header {
		margin-bottom: 16rpx;
	}
	
	.answer-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #52c41a;
	}
	
	.answer-content {
	}
	
	.answer-text {
		font-size: 26rpx;
		color: #333;
		line-height: 1.4;
	}
	
	/* 题目导航点 */
	.question-nav {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 12rpx;
		margin-top: 32rpx;
	}
	
	.nav-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background-color: #d9d9d9;
		transition: all 0.3s ease;
		cursor: pointer;
	}
	
	.nav-dot.active {
		width: 32rpx;
		border-radius: 6rpx;
		background-color: #1890ff;
	}
	
	/* 响应式设计 */
	@media (max-width: 750rpx) {
		.question-record {
			padding: 16rpx;
		}
		
		.info-card {
			padding: 24rpx;
		}
		
		.question-card {
			padding: 24rpx;
		}
		
		.question-slide {
			padding: 0 12rpx;
		}
		
		.question-image .image {
			height: 300rpx;
		}
	}
</style>
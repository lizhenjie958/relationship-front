<template>
	<view class="question-info">
		<!-- 题目信息区域 -->
		<view class="question-section">
			<view class="question-header">
			<text class="question-title">{{ usageSource === 'exam-paper-detail' ? '题目信息' : '答题详情' }}</text>
			<text class="question-count">{{ currentQuestionIndex + 1 }} / {{ questions.length }}</text>
		</view>
		
		<!-- 答题进度条 - 仅在答题模式下显示 -->
		<view v-if="canAnswer() && showSubmit" class="progress-section">
			<view class="progress-bar-container">
				<view class="progress-bar-bg">
					<view class="progress-bar-fill" :style="{ width: answerProgress + '%' }"></view>
				</view>
				<text class="progress-text">{{ answeredCount }}/{{ questions.length }}</text>
			</view>
			<view v-if="unansweredCount > 0" class="progress-hint">
				<text class="hint-text">还有 {{ unansweredCount }} 题未答</text>
			</view>
			<view v-else class="progress-hint complete">
				<text class="hint-text">✓ 全部完成，可以提交啦</text>
			</view>
		</view>
			
			<!-- 轮播容器 -->
			<swiper 
				class="questions-container"
				:current="currentQuestionIndex"
				@change="handleSwiperChange"
				:indicator-dots="false"
				:autoplay="false"
				:interval="3000"
				:duration="300"
				:circular="false"
			>
				<swiper-item v-for="(question, index) in questions" :key="index">
					<view class="question-card">
						<!-- 题目序号 -->
						<view class="question-number">
							<text class="question-number-text">第 {{ index + 1 }} 题</text>
							<view v-if="canAnswer() && showSubmit" class="answer-status-badge" :class="{ 'answered': selectedOptions[index], 'unanswered': !selectedOptions[index] }">
								<text class="badge-text">{{ selectedOptions[index] ? '已答' : '未答' }}</text>
							</view>
						</view>
						
						<!-- 问题内容 -->
						<view class="question-content">
							<!-- 题目图片 -->
						<view v-if="question.picUrl" class="question-image">
							<image class="question-image-image" :src="question.picUrl" mode="aspectFit"></image>
						</view>
							<!-- 问题文本 -->
							<text class="question-text">
								{{ question.templateKey === 'cg3j4e' ? '图片中的人物是主角的()' : question.questionText || '请选择正确答案' }}
							</text>
						</view>
						
						<!-- 选项列表 -->
						<view class="options-list">
							<view 
								v-for="option in question.optionList" 
								:key="option.key"
								class="option-item"
								:class="{
									'selected': isUserSelected(index, option.key) || selectedOptions[index] === option.key,
									'clickable': canAnswer(),
									'user-answer': isUserAnswer(index, option.key),
									'correct-answer': showAnswer && isCorrectAnswer(index, option.key),
									'wrong-answer': showAnswer && isUserAnswer(index, option.key) && !isCorrectAnswer(index, option.key)
								}"
								@click="selectOption(index, option.key)"
							>
								<view class="option-text">{{ option.value }}</view>
								<view class="option-label">{{ option.key }}</view>
								<!-- 用户选择标识 -->
								<view v-if="isUserAnswer(index, option.key)" class="user-answer-badge">
									<text>我的答案</text>
								</view>
								<!-- 正确答案标识 -->
								<view v-if="showAnswer && isCorrectAnswer(index, option.key)" class="correct-answer-badge">
									<text>✓ 正确答案</text>
								</view>
							</view>
						</view>
						
						<!-- 答案区域 - 仅在showAnswer为true时显示 -->
						<view v-if="showAnswer" class="answer-section">
							<view class="answer-header">
								<text class="answer-title">答案</text>
							</view>
							<view class="answer-content">
								<text class="answer-text">{{ question.correctOptionList?.join('、') || '暂无答案' }}</text>
							</view>
						</view>
						
						<!-- 提交按钮 - 仅在showSubmit为true时显示 -->
						<view v-if="showSubmit && canAnswer() && index === questions.length - 1" class="submit-section">
							<button class="submit-btn" @click="submitAnswers">提交答案</button>
						</view>
					</view>
				</swiper-item>
			</swiper>
			
			<!-- 题目导航点 -->
			<view class="question-nav">
				<view 
					v-for="(question, index) in questions" 
					:key="index"
					class="nav-dot"
					:class="{ active: index === currentQuestionIndex }"
					@click="currentQuestionIndex = index"
				></view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed } from 'vue';
	
	// 接收外部传入的参数
	const props = defineProps({
		paperId: {
			type: String,
			default: ''
		},
		recordId: {
			type: String,
			default: ''
		},
		usageSource: {
			type: String,
			required: true
		},
		// 答题状态：ongoing(进行中)、expired(已过期)、completed(已完成)
		answerStatus: {
			type: String,
			default: 'ongoing'
		},
		// 用户答案
		userAnswers: {
			type: Array,
			default: () => []
		},
		// 是否展示答案（由父组件控制）
		showAnswer: {
			type: Boolean,
			default: false
		},
		// 题目数据，从父组件传入
		questions: {
			type: Array,
			default: () => []
		},
		// 是否显示提交按钮
		showSubmit: {
			type: Boolean,
			default: true
		}
	});

	// 定义事件
	const emit = defineEmits(['selectOption', 'submitAnswers']);

	// 响应式数据
	const selectedOptions = ref([]);
	
	// 轮播相关
	const currentQuestionIndex = ref(0);
	
	// 计算属性 - 答题进度
	const answeredCount = computed(() => {
		return selectedOptions.value.filter(option => option !== undefined && option !== null && option !== '').length;
	});
	
	const unansweredCount = computed(() => {
		return props.questions.length - answeredCount.value;
	});
	
	const answerProgress = computed(() => {
		if (props.questions.length === 0) return 0;
		return Math.round((answeredCount.value / props.questions.length) * 100);
	});
	
	// 轮播切换事件处理
	const handleSwiperChange = (e) => {
		currentQuestionIndex.value = e.detail.current;
	};

	// 选择选项
	const selectOption = (questionIndex, optionKey) => {
		if (props.answerStatus === 'ongoing') {
			selectedOptions.value[questionIndex] = optionKey;
			emit('selectOption', {
				questionIndex,
				optionKey
			});
		}
	};

	// 提交答案 - 检查是否全部答完
	const submitAnswers = () => {
		// 统计已答题和未答题数量
		const totalQuestions = props.questions.length;
		const answeredCount = selectedOptions.value.filter(option => option !== undefined && option !== null && option !== '').length;
		const unansweredCount = totalQuestions - answeredCount;
		
		if (unansweredCount > 0) {
			// 有未答题目，显示现代化提示
			showUnansweredWarning(unansweredCount, totalQuestions, answeredCount);
			return;
		}
		
		// 全部答完，提交答案
		emit('submitAnswers', selectedOptions.value);
	};
	
	// 显示未答题警告提示
	const showUnansweredWarning = (unansweredCount, totalQuestions, answeredCount) => {
		const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
		
		uni.showModal({
			title: '还有题目未完成',
			content: `您已完成 ${answeredCount}/${totalQuestions} 题 (${progressPercent}%)\n还有 ${unansweredCount} 道题未作答，是否继续答题？`,
			confirmText: '继续答题',
			confirmColor: '#1890ff',
			cancelText: '坚持提交',
			cancelColor: '#999',
			success: (res) => {
				if (!res.confirm) {
					// 用户选择坚持提交
					emit('submitAnswers', selectedOptions.value);
				}
				// 如果点击继续答题，自动跳转到第一个未答题目
				else {
					jumpToFirstUnanswered();
				}
			}
		});
	};
	
	// 跳转到第一个未答题目
	const jumpToFirstUnanswered = () => {
		for (let i = 0; i < props.questions.length; i++) {
			if (!selectedOptions.value[i]) {
				currentQuestionIndex.value = i;
				break;
			}
		}
	};

	// 检查是否是用户选择的选项（当前答题中）
	const isUserSelected = (questionIndex, optionKey) => {
		return props.userAnswers[questionIndex] === optionKey;
	};

	// 检查是否是用户的答案（用于展示已完成答题的答案）
	const isUserAnswer = (questionIndex, optionKey) => {
		return props.userAnswers[questionIndex] === optionKey;
	};

	// 检查是否是正确答案
	const isCorrectAnswer = (questionIndex, optionKey) => {
		const question = props.questions[questionIndex];
		if (!question || !question.correctOptionList) return false;
		return question.correctOptionList.includes(optionKey);
	};

	// 检查是否应该显示答案
	const shouldShowAnswer = () => {
		return props.usageSource === 'exam-paper-detail' || props.showAnswer;
	};

	// 检查是否可以答题
	const canAnswer = () => {
		return props.answerStatus === 'ongoing';
	};
	
	// 页面挂载
	onMounted(() => {
		// 这里可以根据传入的试卷ID获取实际数据
	});
</script>

<style lang="scss" scoped>
	.question-info {
		margin-bottom: 40rpx;
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
		overflow: visible;
		position: relative;
		margin-bottom: 32rpx;
		min-height: 100vh;
	}

	.questions-wrapper {
		display: flex;
		transition: transform 0.3s ease;
	}

	.question-slide {
		width: 100%;
		flex-shrink: 0;
		padding: 0 20rpx;
		overflow-y: auto;
	}

	.question-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		margin: 0 20rpx;
		min-height: auto;
		max-height: none;
		overflow-y: visible;
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
	
	.question-number-text {
		font-size: 28rpx;
		font-weight: 600;
		color: #2c3e50;
	}

	.question-number {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #f1f3f5;
	}

	.answer-status-badge {
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		font-weight: 500;
		transition: all 0.3s ease;
	}

	.answer-status-badge.answered {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		color: #fff;
		box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
	}

	.answer-status-badge.unanswered {
		background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
		color: #fff;
		box-shadow: 0 2rpx 8rpx rgba(250, 173, 20, 0.3);
	}

	.badge-text {
		font-size: 22rpx;
		font-weight: 600;
	}
	
	/* 问题内容 */
	.question-content {
		margin-bottom: 32rpx;
	}
	
	/* 题目图片 */
	.question-image {
		width: 100%;
		margin: 20rpx 0;
		border-radius: 8rpx;
		overflow: hidden;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}
	
	.question-image-image {
		width: 100%;
		height: 400rpx;
		object-fit: cover;
	}
	
	.question-text {
		font-size: 30rpx;
		color: #333;
		line-height: 1.5;
		margin-bottom: 24rpx;
		display: block;
		text-align: center;
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
		padding: 24rpx 16rpx;
		border-radius: 12rpx;
		background-color: #e8f4fd;
		transition: all 0.3s ease;
		position: relative;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
		min-height: 180rpx;
		justify-content: center;
	}
	
	.option-item:hover {
		background-color: #e6f7ff;
		transform: translateY(-4rpx);
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
	}
	
	/* 选项文本 */
	.option-text {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 16rpx;
		text-align: center;
		font-weight: 500;
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
		box-shadow: 0 2rpx 4rpx rgba(24, 144, 255, 0.3);
		transition: all 0.3s ease;
	}

		/* 选中状态 */
		.option-item.selected {
			background-color: #e6f7ff;
			border: 2rpx solid #1890ff;
		}

		/* 可点击状态 */
		.option-item.clickable {
			cursor: pointer;
		}

		/* 用户选择指示器 */
		.user-selected-indicator {
			position: absolute;
			top: 12rpx;
			right: 12rpx;
			width: 36rpx;
			height: 36rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			background-color: #1890ff;
			color: #fff;
			border-radius: 50%;
			font-size: 20rpx;
			font-weight: bold;
			box-shadow: 0 2rpx 4rpx rgba(24, 144, 255, 0.3);
		}

		/* 用户答案样式 - 已完成答题时 */
		.option-item.user-answer {
			background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
			border: 2rpx solid #1890ff;
			box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.2);
		}

		/* 正确答案样式 */
		.option-item.correct-answer {
			background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
			border: 2rpx solid #52c41a;
			box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.2);
		}

		/* 错误答案样式（用户选错时） */
		.option-item.wrong-answer {
			background: linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%);
			border: 2rpx solid #ff4d4f;
			box-shadow: 0 4rpx 12rpx rgba(255, 77, 79, 0.2);
		}

		/* 用户答案徽章 */
		.user-answer-badge {
			position: absolute;
			top: 12rpx;
			right: 12rpx;
			padding: 6rpx 16rpx;
			background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
			color: #fff;
			border-radius: 20rpx;
			font-size: 20rpx;
			font-weight: 600;
			box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.3);
		}

		/* 正确答案徽章 */
		.correct-answer-badge {
			position: absolute;
			top: 12rpx;
			right: 12rpx;
			padding: 6rpx 16rpx;
			background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
			color: #fff;
			border-radius: 20rpx;
			font-size: 20rpx;
			font-weight: 600;
			box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
		}

		/* 当同时显示用户答案和正确答案时的位置调整 */
		.option-item.user-answer.correct-answer .user-answer-badge {
			right: 140rpx;
		}

		.option-item.user-answer.correct-answer .correct-answer-badge {
			right: 12rpx;
		}

		.option-item.wrong-answer .user-answer-badge {
			right: 140rpx;
		}

		.option-item.wrong-answer .correct-answer-badge {
			right: 12rpx;
		}

		/* 提交按钮区域 */
		.submit-section {
			margin-top: 32rpx;
			text-align: center;
		}

		.submit-btn {
			padding: 20rpx 60rpx;
			background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
			color: #fff;
			border: none;
			border-radius: 24rpx;
			font-size: 28rpx;
			font-weight: 600;
			transition: all 0.3s ease;
			box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
		}

		.submit-btn:hover {
			transform: translateY(-2rpx);
			box-shadow: 0 6rpx 16rpx rgba(24, 144, 255, 0.4);
		}

		.submit-btn:active {
			transform: translateY(0);
		}
	
	/* 答题进度条样式 */
	.progress-section {
		background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		border: 2rpx solid rgba(24, 144, 255, 0.1);
	}

	.progress-bar-container {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.progress-bar-bg {
		flex: 1;
		height: 16rpx;
		background-color: rgba(24, 144, 255, 0.1);
		border-radius: 8rpx;
		overflow: hidden;
		position: relative;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
		border-radius: 8rpx;
		transition: width 0.5s ease;
		position: relative;
	}

	.progress-bar-fill::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(100%); }
	}

	.progress-text {
		font-size: 26rpx;
		color: #1890ff;
		font-weight: 600;
		min-width: 80rpx;
		text-align: right;
	}

	.progress-hint {
		margin-top: 12rpx;
		text-align: center;
	}

	.hint-text {
		font-size: 24rpx;
		color: #faad14;
		font-weight: 500;
	}

	.progress-hint.complete .hint-text {
		color: #52c41a;
		font-weight: 600;
	}

	/* 答案区域 */
	.answer-section {
		margin-top: 32rpx;
		padding: 24rpx;
		background-color: #f6ffed;
		border-radius: 8rpx;
		border-left: 4rpx solid #52c41a;
		position: relative;
		z-index: 10;
		display: block;
		visibility: visible;
		opacity: 1;
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
		.question-info {
			padding: 0 16rpx;
		}
		
		.question-card {
			padding: 24rpx;
		}
		
		.question-slide {
			padding: 0 12rpx;
		}
		
		.options-list {
			grid-template-columns: 1fr;
		}
	}
</style>
<template>
	<view class="answer-record">
		
		
		<!-- 主信息区域 -->
		<view class="main-info">
			<view class="info-card">
				<!-- 主角信息区域（带头像） -->
				<view class="protagonist-section">
					<view class="protagonist-avatar-wrapper">
						<image 
							v-if="protagonistPicUrl" 
							:src="protagonistPicUrl" 
							class="protagonist-avatar" 
							mode="aspectFill"
						/>
						<view v-else class="protagonist-avatar-placeholder">
							<text class="avatar-icon">👤</text>
						</view>
					</view>
					<view class="protagonist-info">
						<text class="protagonist-label">主角</text>
						<text class="protagonist-name">{{ protagonistName }}</text>
					</view>
				</view>
				
				<!-- 其他信息 -->
				<view class="info-list">
					<view class="info-item">
						<text class="info-label">出题人：</text>
						<text class="info-value">{{ examinerName }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">答题时间：</text>
						<text class="info-value">{{ answerTime }}</text>
					</view>
					<view class="info-item" v-if="answerStatus === 'completed'">
						<text class="info-label">得分：</text>
						<text class="info-value score">{{ score }}分</text>
					</view>
					<view class="info-item">
						<text class="info-label">状态：</text>
						<text class="info-value" :class="statusClass">{{ statusText }}</text>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 操作按钮区域 -->
		<view class="action-buttons">
			<button 
				v-if="answerStatus !== 'ongoing'" 
				class="action-btn retry-btn"
				@click="retryAnswer"
			>
				重新领取
			</button>
			<button 
				v-if="answerStatus !== 'ongoing'" 
				class="action-btn show-answer-btn"
				@click="toggleShowAnswer"
			>
				{{ showAnswer ? '隐藏答案' : '查看答案' }}
			</button>
			<button 
				v-if="answerStatus === 'ongoing'" 
				class="action-btn give-up-btn"
				@click="giveUpAnswerHandler"
			>
				放弃作答
			</button>
		</view>
		
		<!-- 题目信息组件 -->
		<QuestionInfo 
			:paperId="paperId"
			:recordId="recordId"
			:usageSource="'answer-record'"
			:answerStatus="answerStatus"
			:userAnswers="userAnswers"
			:showAnswer="showAnswer"
			:questions="questions"
			@selectOption="handleSelectOption"
			@submitAnswers="handleSubmitAnswers"
		/>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed, onUnmounted } from 'vue';
import QuestionInfo from '@/components/QuestionInfo.vue';
import { request, formatDateTime } from '@/utils/request.js';
import { getExamPaperDetail } from '@/api/examPaperApi.js';
import { queryAnswerPaperDetail, completeAnswer, giveUpAnswer } from '@/api/answerPaperApi.js';
import { claimExamPaper } from '@/api/examPaperApi.js';
import { queryMember } from '@/api/memberApi.js';
	
	// 接收外部传入的答题记录ID参数
	const props = defineProps({
		id: {
			type: String,
			default: ''
		}
	});
	
	// 答卷详情数据
const protagonistName = ref('');
const protagonistPicUrl = ref('');
const examinerName = ref('');
const answerTime = ref('');
const score = ref(0);
const paperId = ref('');
const recordId = ref(props.id || '');
const examPaperName = ref('');

// 答题状态管理
const answerStatus = ref(''); // ongoing, expired, completed
const showAnswer = ref(false);
const userAnswers = ref([]); // 用户答案
const questions = ref([]); // 题目数据

// 计算属性
const statusText = ref('');
const statusClass = ref('');

// 是否为会员
const isMember = computed(() => {
	return memberInfo.value && (memberInfo.value.enableTime || memberInfo.value.expireTime);
});

// 是否已过期
const isExpired = computed(() => {
	console.log('memberInfo.value:', isMember.value);
	if (!isMember.value) return false;
	if (memberInfo.value.enableStatus === 2) return true;
	if (memberInfo.value.expireTime) {
		return new Date(memberInfo.value.expireTime) < new Date();
	}
	return false;
});

// 会员信息
const memberInfo = ref({
	enableTime: '',
	expireTime: '',
	enableStatus: 2
});

// 激励视频广告实例
let videoAd = null;

// 创建激励视频广告
const createRewardedVideoAd = () => {
	if (!videoAd && typeof qq !== 'undefined' && qq.createRewardedVideoAd) {
		videoAd = qq.createRewardedVideoAd({
			adUnitId: '' // TODO: 替换为你的微信广告单元ID
		});
		
		videoAd.onLoad(() => {
			console.log('激励视频广告加载成功');
		});
		
		videoAd.onClose((res) => {
			if (res && res.isEnded) {
				// 完整观看广告，显示答案
				showAnswer.value = true;
				uni.showToast({
					title: '广告观看完成',
					icon: 'success'
				});
			} else {
				// 中途关闭广告
				uni.showToast({
					title: '请完整观看广告',
					icon: 'none'
				});
			}
		});
		
		videoAd.onError((err) => {
			console.error('激励视频广告错误:', err);
			// 广告加载失败时，直接显示答案（降级方案）
			uni.showModal({
				title: '广告加载失败',
				content: '无法加载广告，是否直接查看答案？',
				confirmText: '直接查看',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						showAnswer.value = true;
					}
				}
			});
		});
	}
};

// 展示激励视频广告
const showRewardedVideoAd = () => {
	if (videoAd) {
		videoAd.show().catch(() => {
			// 显示失败，尝试重新加载
			videoAd.load().then(() => {
				videoAd.show();
			}).catch((loadErr) => {
				console.error('广告加载失败:', loadErr);
			});
		});
	} else {
		// 广告未创建，重新创建
		createRewardedVideoAd();
		if (videoAd) {
			videoAd.show().catch((err) => {
				console.error('广告展示失败:', err);
			});
		}
	}
};

// 状态映射
// 1: 答题中(ongoing), 2: 已完成(completed), 3: 已放弃(given_up), 4: 已超时(expired)
const statusMap = {
	1: 'ongoing',
	2: 'completed',
	3: 'expired',
	4: 'expired'
};

const statusTextMap = {
	'ongoing': '答题中',
	'expired': '已过期',
	'completed': '已完成'
};

const statusClassMap = {
	'ongoing': 'status-ongoing',
	'expired': 'status-expired',
	'completed': 'status-completed'
};

// 切换显示答案
const toggleShowAnswer = async () => {
	// 直接显示答案，不接入广告
	showAnswer.value = !showAnswer.value;
};

	// 重新领取
	const retryAnswer = async () => {
		if (!paperId.value) {
			uni.showToast({
				title: '试卷ID不能为空',
				icon: 'none'
			});
			return;
		}

		try {
			uni.showLoading({ title: '领取中...' });

			const response = await claimExamPaper({
				id: paperId.value
			});

			uni.hideLoading();

			if (response.code === 200) {
				uni.showToast({
					title: '领取成功',
					icon: 'success'
				});
				// 领取成功后跳转到新领取的答题详情页
				if (response.data) {
					setTimeout(() => {
						uni.navigateTo({
							url: `/pages/answer-paper-detail/answer-paper-detail?id=${response.data}`
						});
					}, 1500);
				}
			} else {
				uni.showToast({
					title: response.msg || '领取失败',
					icon: 'none'
				});
			}
		} catch (error) {
			uni.hideLoading();
			console.error('重新领取失败:', error);
			uni.showToast({
				title: '领取失败，请重试',
				icon: 'none'
			});
		}
	};

	// 放弃作答
	const giveUpAnswerHandler = async () => {
		if (!recordId.value) {
			uni.showToast({
				title: '记录ID不能为空',
				icon: 'none'
			});
			return;
		}

		uni.showModal({
			title: '确认放弃',
			content: '确定要放弃本次作答吗？',
			confirmText: '放弃',
			confirmColor: '#ff4d4f',
			cancelText: '取消',
			success: async (res) => {
				if (res.confirm) {
					try {
						uni.showLoading({ title: '处理中...' });
						
						const response = await giveUpAnswer({
							id: recordId.value
						});
						
						uni.hideLoading();
						
						if (response.code === 200) {
							uni.showToast({
								title: '已放弃作答',
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: response.msg || '放弃失败',
								icon: 'none'
							});
						}
						
						// 无论成功失败，都返回答卷列表页
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/answer-paper-list/answer-paper-list'
							});
						}, 1500);
					} catch (error) {
						uni.hideLoading();
						console.error('放弃作答失败:', error);
						uni.showToast({
							title: '放弃失败，请重试',
							icon: 'none'
						});
						
						// 失败后也返回答卷列表页
						setTimeout(() => {
							uni.navigateTo({
								url: '/pages/answer-paper-list/answer-paper-list'
							});
						}, 1500);
					}
				}
			}
		});
	};

	// 处理选择选项
	const handleSelectOption = (data) => {
		console.log('Selected option:', data);
	};

	// 处理提交答案
const handleSubmitAnswers = async (answers) => {
	if (!recordId.value) {
		uni.showToast({
			title: '记录ID不能为空',
			icon: 'none'
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '提交中...'
		});
		
		// 构建请求参数
		const requestData = {
			id: recordId.value,
			answerQuestionDTOList: answers.map((answer, index) => ({
				questionNo: index + 1,
				answerOptionList: [answer]
			}))
		};
		
		// 调用提交答案API
		const response = await completeAnswer(requestData);
		
		if (response.code === 200) {
			// 获取得分
			const score = response.data || 0;
			
			// 显示得分提示
			uni.showModal({
				title: '提交成功',
				content: `您的得分为：${score}分`,
				showCancel: false,
				success: () => {
					// 重新刷新页面
					setTimeout(() => {
						// 使用uni.reLaunch或uni.navigateBack刷新页面
						uni.reLaunch({
							url: `/pages/answer-paper-detail/answer-paper-detail?id=${recordId.value}`
						});
					}, 1000);
				}
			});
		} else {
			uni.showToast({
				title: response.msg || '提交答案失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('提交答案失败:', error);
		uni.showToast({
			title: '提交答案失败，请稍后重试',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

	// 更新状态显示
const updateStatusDisplay = () => {
	statusText.value = statusTextMap[answerStatus.value] || '答题中';
	statusClass.value = statusClassMap[answerStatus.value] || 'status-ongoing';
};
	
	// 页面挂载
onMounted(async () => {
	// 这里可以根据传入的答题记录ID获取实际数据
	console.log('Answer record page mounted with recordId:', recordId.value);
	// 获取会员信息
	await fetchMemberInfo();
	// 调用API获取数据
	await fetchAnswerRecordData(recordId.value);
});

// 获取会员信息
const fetchMemberInfo = async () => {
	try {
		const response = await queryMember();
		if (response.code === 200 && response.data) {
			memberInfo.value = response.data;
		}
	} catch (error) {
		console.error('获取会员信息失败:', error);
	}
};

// 页面销毁时清理广告
onUnmounted(() => {
	if (videoAd) {
		videoAd = null;
	}
});
	
	// 获取答题记录数据
const fetchAnswerRecordData = async (recordId) => {
	if (!recordId) {
		uni.showToast({
			title: '记录ID不能为空',
			icon: 'none'
		});
		return;
	}
	
	try {
		uni.showLoading({
			title: '加载中...'
		});
		
		// 调用答卷详情API
		const response = await queryAnswerPaperDetail({
			id: recordId
		});
		
		if (response.code === 200) {
			const data = response.data;
			
			// 更新答卷详情数据
			protagonistName.value = data.protagonistInfoDTO?.protagonist || '';
			protagonistPicUrl.value = data.protagonistInfoDTO?.picUrl || '';
			examinerName.value = data.examinerName || '-';
			answerTime.value = formatDateTime(data.createTime);
			score.value = data.score || 0;
			paperId.value = data.examPaperId || '';
			examPaperName.value = data.examPaperName || '';
			
			// 设置答题状态
			const statusCode = data.answerStatus || 1;
			answerStatus.value = statusMap[statusCode] || 'ongoing';
			
			// 处理用户答案 - 将answerQuestionDTOList转换为用户答案数组
			if (data.answerQuestionDTOList && data.answerQuestionDTOList.length > 0) {
				userAnswers.value = data.answerQuestionDTOList.map(item => {
					// answerOptionList 是数组，取第一个值
					return item.answerOptionList && item.answerOptionList.length > 0 
						? item.answerOptionList[0] 
						: '';
				});
				console.log('用户答案:', userAnswers.value);
			}
			
			// 更新状态显示
			updateStatusDisplay();
			
			// 如果有paperId，获取试题详情
			if (paperId.value) {
				await fetchExamPaperQuestions(paperId.value);
			}
		} else {
			uni.showToast({
				title: response.msg || '获取答卷详情失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取答卷详情失败:', error);
		uni.showToast({
			title: '获取答卷详情失败，请稍后重试',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 根据试卷ID获取试题详情
const fetchExamPaperQuestions = async (paperId) => {
	try {
		const response = await getExamPaperDetail({
			id: paperId
		});
		
		if (response.code === 200) {
			// 更新题目数据
			questions.value = response.data.questionDTOList || [];
		} else {
			uni.showToast({
				title: response.msg || '获取试题详情失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取试题详情失败:', error);
		uni.showToast({
			title: '获取试题详情失败，请稍后重试',
			icon: 'none'
		});
	}
};
</script>

<style lang="scss" scoped>
	.answer-record {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}
	
	
	
	/* 主信息区域 */
	.main-info {
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

	/* 主角信息区域 */
	.protagonist-section {
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding: 24rpx;
		margin: -32rpx -32rpx 24rpx -32rpx;
		background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
		border-bottom: 2rpx solid rgba(24, 144, 255, 0.1);
	}

	.protagonist-avatar-wrapper {
		position: relative;
		flex-shrink: 0;
	}

	.protagonist-avatar {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		object-fit: cover;
	}

	.protagonist-avatar-placeholder {
		width: 120rpx;
		height: 120rpx;
		border-radius: 50%;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		background: linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.avatar-icon {
		font-size: 56rpx;
	}

	.protagonist-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.protagonist-label {
		font-size: 24rpx;
		color: #666;
		font-weight: 500;
	}

	.protagonist-name {
		font-size: 40rpx;
		color: #333;
		font-weight: 700;
	}

	/* 信息列表 */
	.info-list {
		padding-top: 8rpx;
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
		width: 140rpx;
		flex-shrink: 0;
		white-space: nowrap;
	}
	
	.info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		flex: 1;
	}
	
	.score {
		color: #ff7a45;
		font-weight: 700;
	}

	/* 状态样式 */
	.status-ongoing {
		color: #1890ff;
		font-weight: 600;
	}

	.status-expired {
		color: #faad14;
		font-weight: 600;
	}

	.status-completed {
		color: #52c41a;
		font-weight: 600;
	}

	/* 操作按钮区域 */
	.action-buttons {
		display: flex;
		gap: 20rpx;
		margin-bottom: 32rpx;
		flex-wrap: wrap;
	}

	.action-btn {
		flex: 1;
		min-width: 200rpx;
		padding: 20rpx;
		border: none;
		border-radius: 24rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.retry-btn {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
	}

	.show-answer-btn {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		color: #fff;
	}

	.give-up-btn {
		background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
		color: #fff;
	}

	.action-btn:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.15);
	}

	.action-btn:active {
		transform: translateY(0);
	}
	
	/* 题目信息区域 */
	.question-section {
		margin-bottom: 40rpx;
	}
	
	.question-card {
		background-color: #fff;
		border-radius: 12rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		transition: all 0.3s ease;
		position: relative;
	}
	
	.question-card:hover {
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
	}
	
	/* 题目头部 */
	.question-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
		padding-bottom: 20rpx;
		border-bottom: 2rpx solid #f1f3f5;
	}
	
	.question-number {
		font-size: 32rpx;
		font-weight: 600;
		color: #2c3e50;
	}
	
	.view-answer-btn {
		padding: 12rpx 24rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.3);
	}
	
	.view-answer-btn:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.4);
	}
	
	/* 问题内容 */
	.question-content {
		margin-bottom: 32rpx;
	}
	
	.question-text {
		font-size: 30rpx;
		color: #333;
		line-height: 1.5;
	}
	
	/* 选项列表 */
	.options-list {
		margin-bottom: 32rpx;
	}
	
	.option-item {
		display: flex;
		align-items: center;
		padding: 24rpx;
		margin-bottom: 16rpx;
		border-radius: 8rpx;
		background-color: #f8f9fa;
		transition: all 0.3s ease;
		position: relative;
	}
	
	.option-item:hover {
		background-color: #e9ecef;
		transform: translateX(8rpx);
	}
	
	.option-item.selected {
		background-color: #e6f7ff;
		border-left: 4rpx solid #1890ff;
	}
	
	.option-item.correct {
		background-color: #f6ffed;
		border-left: 4rpx solid #52c41a;
	}
	
	.option-item.incorrect {
		background-color: #fff2f0;
		border-left: 4rpx solid #ff4d4f;
	}
	
	.option-label {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e9ecef;
		border-radius: 50%;
		font-size: 24rpx;
		font-weight: 600;
		color: #666;
		margin-right: 20rpx;
	}
	
	.option-item.selected .option-label {
		background-color: #1890ff;
		color: #fff;
	}
	
	.option-item.correct .option-label {
		background-color: #52c41a;
		color: #fff;
	}
	
	.option-item.incorrect .option-label {
		background-color: #ff4d4f;
		color: #fff;
	}
	
	.option-text {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		line-height: 1.4;
	}
	
	.option-indicator {
		width: 36rpx;
		height: 36rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		font-size: 20rpx;
		font-weight: 700;
		margin-left: 20rpx;
	}
	
	.option-indicator.user-selected {
		background-color: #1890ff;
		color: #fff;
	}
	
	.option-indicator.correct {
		background-color: #52c41a;
		color: #fff;
	}
	
	/* 正确答案区域 */
	.correct-answer-section {
		margin-top: 32rpx;
		padding: 24rpx;
		background-color: #f6ffed;
		border-radius: 8rpx;
		border-left: 4rpx solid #52c41a;
		animation: fadeIn 0.3s ease-out;
	}
	
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10rpx);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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
		margin-bottom: 16rpx;
		line-height: 1.4;
	}
	
	.answer-explanation {
		margin-top: 16rpx;
		padding-top: 16rpx;
		border-top: 1rpx solid #d9f7be;
	}
	
	.explanation-label {
		font-size: 24rpx;
		font-weight: 600;
		color: #666;
	}
	
	.explanation-text {
		font-size: 24rpx;
		color: #666;
		line-height: 1.4;
		margin-left: 8rpx;
	}
	
	/* 答题导航 */
	.answer-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx 0;
		border-top: 2rpx solid #f1f3f5;
	}
	
	.nav-btn {
		padding: 16rpx 32rpx;
		border: 2rpx solid #1890ff;
		border-radius: 8rpx;
		font-size: 26rpx;
		font-weight: 600;
		transition: all 0.3s ease;
	}
	
	.prev-btn {
		background-color: #fff;
		color: #1890ff;
	}
	
	.next-btn {
		background-color: #1890ff;
		color: #fff;
	}
	
	.nav-btn:hover:not(:disabled) {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
	}
	
	.nav-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.question-progress {
		display: flex;
		align-items: center;
	}
	
	.progress-text {
		font-size: 28rpx;
		color: #666;
		font-weight: 500;
	}
	
	/* 响应式设计 */
	@media (max-width: 750rpx) {
		.answer-record {
			padding: 16rpx;
		}
		
		.question-card {
			padding: 24rpx;
		}
		
		.info-card {
			padding: 24rpx;
		}
	}
</style>
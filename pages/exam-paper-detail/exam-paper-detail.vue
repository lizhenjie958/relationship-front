<template>
	<view class="question-record">
		
		<!-- 试卷信息区域 -->
		<view class="paper-info" v-if="!loading && !loadError">
			<view class="info-card">
				<view class="info-item">
					<text class="info-label">试卷名称：</text>
					<text class="info-value">{{ paperName }}</text>
				</view>
				<view class="info-item">
				<text class="info-label">主角：</text>
				<text class="info-value">{{ protagonistName }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">出题人：</text>
				<text class="info-value">{{ examinerName }}</text>
			</view>
			<view class="info-item">
				<text class="info-label">创建时间：</text>
				<text class="info-value">{{ createTime }}</text>
			</view>
				
				<!-- 出题人操作按钮 -->
				<view v-if="isExaminer" class="examiner-actions">
					<button 
						class="action-btn" 
						:class="claimStatus === 1 ? 'close-share-btn' : 'open-share-btn'"
						@click="handleToggleShare"
					>
						<text class="btn-text">{{ claimStatus === 1 ? '关闭分享' : '开启分享' }}</text>
					</button>
					<button class="action-btn view-share-btn" @click="handleViewShareRecord">
						<text class="btn-text">分享记录</text>
					</button>
					<button class="action-btn claim-btn-self" @click="handleClaim">
						<text class="btn-text">认领试卷</text>
					</button>
				</view>
				
				<!-- 认领按钮 - 非出题人显示 -->
				<view v-else class="claim-section">
					<button class="claim-btn" @click="handleClaim">
						<text class="claim-btn-text">认领试卷</text>
					</button>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 加载失败状态 -->
		<view v-if="loadError" class="error-container">
			<view class="error-icon">⚠️</view>
			<text class="error-text">加载失败，请下拉刷新重试</text>
		</view>
		
		<!-- 题目信息组件 -->
<QuestionInfo 
	:paperId="paperId"
	:usageSource="'exam-paper-detail'"
	:showAnswer="showAnswer"
	:questions="questions"
	:showSubmit="false"
/>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import QuestionInfo from '@/components/QuestionInfo.vue';
import { getExamPaperDetail, claimExamPaper, changeClaimStatus } from '@/api/examPaperApi.js';
import { addShareRecord } from '@/api/shareApi.js';
import { request, formatDateTime } from '@/utils/request.js';
import { getUserId } from '@/utils/auth.js';
	
	// 接收外部传入的试卷ID参数
	const props = defineProps({
		id: {
			type: String,
			default: ''
		}
	});
	
	// 试卷ID
	const paperId = ref(props.id || '');
	// 试卷信息
	const paperName = ref('');
	const protagonistName = ref('');
	const examinerName = ref('');
	const createTime = ref('');
	const creatorName = ref('系统管理员');
	// 出题人ID
	const examinerId = ref('');
	// 当前用户是否为出题人
	const isExaminer = ref(false);
	// 题目数据
	const questions = ref([]);
	// 是否展示答案
	const showAnswer = ref(false);
	// 来源类型
	const source = ref('');
	// 答题状态
	const answerStatus = ref('');
	// 试卷认领状态 0-未开启 1-可领取 2-不可领取
	const claimStatus = ref(0);
	// 加载状态
	const loading = ref(true);
	// 加载错误状态
	const loadError = ref(false);
	
	// 获取试卷详情
	const fetchPaperDetail = async () => {
		if (!paperId.value) {
			uni.showToast({
				title: '试卷ID不能为空',
				icon: 'none'
			});
			loading.value = false;
			loadError.value = true;
			return;
		}
		
		loading.value = true;
		loadError.value = false;
		
		try {
			const response = await getExamPaperDetail({
				id: paperId.value
			});
			
			if (response.code === 200) {
				const data = response.data;
				// 更新试卷信息
				paperName.value = data.name;
				protagonistName.value = data.protagonistInfoDTO.protagonist;
				examinerName.value = data.examinerName || '-';
				createTime.value = formatDateTime(data.createTime);
				// 获取出题人ID
				examinerId.value = data.examinerId || '';
				// 获取试卷认领状态
				claimStatus.value = data.claimStatus || 0;
				// 判断当前用户是否为出题人
				const currentUserId = getUserId();
				isExaminer.value = examinerId.value && examinerId.value === currentUserId;
				// 如果是出题人，默认展示答案
				if (isExaminer.value) {
					showAnswer.value = true;
				}
				// 更新题目数据
				questions.value = data.questionDTOList;
				console.log('Fetched questions:', questions.value);
				console.log('Current user is examiner:', isExaminer.value);
				loadError.value = false;
			} else {
				uni.showToast({
					title: '获取试卷详情失败',
					icon: 'none'
				});
				loadError.value = true;
			}
		} catch (error) {
			console.error('获取试卷详情失败:', error);
			uni.showToast({
				title: '获取试卷详情失败',
				icon: 'none'
			});
			loadError.value = true;
		} finally {
			loading.value = false;
			uni.stopPullDownRefresh();
		}
	};

	// 页面下拉刷新
	onPullDownRefresh(async () => {
		console.log('试卷详情页面下拉刷新');
		await fetchPaperDetail();
	});
	
	// 生成随机UUID（去除-）
	const generateUUID = () => {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		}).replace(/-/g, '');
	};

	// 分享成功处理
	const handleShareSuccess = async (shareCode) => {	
		try {
			await addShareRecord({
				sourceType: 1,
				sourceId: paperId.value,
				shareCode: shareCode
			});
		} catch (error) {
			console.error('调用分享记录接口失败:', error);
		}
	};

	// 分享码
const shareCode = ref('');

// 页面加载时获取URL参数
onLoad((options) => {
	// 保存分享码
	if (options.shareCode) {
		shareCode.value = options.shareCode;
	}
	// 保存来源
	if (options.source) {
		source.value = options.source;
	}
	// 保存答题状态
	if (options.answerStatus) {
		answerStatus.value = options.answerStatus;
	}
	
	// 根据来源判断是否默认展示答案
	// 如果是从试题列表进入的，默认展示答案
	if (options.source === 'exam-paper-list') {
		showAnswer.value = true;
	}
});

// 切换分享状态（开启/关闭）
const handleToggleShare = async () => {
	const isOpen = claimStatus.value === 1;
	const title = isOpen ? '确认关闭分享' : '确认开启分享';
	const content = isOpen
		? '关闭分享后，其他人将无法通过分享链接访问此试卷，是否继续？'
		: '开启分享后，其他人可以通过分享链接访问并认领此试卷，是否继续？';
	const confirmText = isOpen ? '关闭' : '开启';
	const successMsg = isOpen ? '已关闭分享' : '已开启分享';

	uni.showModal({
		title: title,
		content: content,
		confirmText: confirmText,
		confirmColor: '#ff4d4f',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({ title: '处理中...' });

					// 调用切换分享状态接口
					const response = await changeClaimStatus({
						id: paperId.value,
						claimStatus: isOpen ? 2 : 1
					});

					uni.hideLoading();

					if (response.code === 200) {
						// 更新本地状态
						claimStatus.value = isOpen ? 2 : 1;
						uni.showToast({
							title: successMsg,
							icon: 'success'
						});
					} else {
						uni.showToast({
							title: response.msg || '操作失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('切换分享状态失败:', error);
					uni.showToast({
						title: '操作失败，请重试',
						icon: 'none'
					});
				}
			}
		}
	});
};

// 查看分享记录
const handleViewShareRecord = () => {
	uni.navigateTo({
		url: `/pages/share-record/share-record?sourceId=${paperId.value}`
	});
};

// 认领试卷
const handleClaim = async () => {
	try {
		// 调用认领API
		const response = await claimExamPaper({
			id: paperId.value
		});
		
		if (response.code === 200) {
			uni.showToast({
				title: '认领成功',
				icon: 'success'
			});
			
			// 获取答卷ID
			const answerId = response.data;
			
			// 延迟跳转到答卷详情页，使用返回的答卷ID
		setTimeout(() => {
			uni.navigateTo({
				// 使用返回的答卷ID跳转到答卷详情页
				url: `/pages/answer-paper-detail/answer-paper-detail?id=${answerId}`
			});
		}, 1500);
		} else {
			uni.showToast({
				title: response.msg || '认领失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('认领失败:', error);
		uni.showToast({
			title: '认领失败，请稍后重试',
			icon: 'none'
		});
	}
};

// 页面挂载
onMounted(async () => {
	// 根据传入的试卷ID获取实际数据
	await fetchPaperDetail();
});

	// 微信小程序分享给好友 - 微信会自动识别此函数，无需导出
    onShareAppMessage(() => {
        // 生成分享码
		const shareCode = generateUUID();
		handleShareSuccess(shareCode)
		return {
			title: paperName.value || '我分享了一份试卷',
			desc: `快来看看这份关于${protagonistName.value}的试卷吧！`,
			path: `/pages/index/index?shareCode=${shareCode}`
		};
    })

	// 微信小程序分享到朋友圈 - 微信会自动识别此函数，无需导出
	onShareTimeline(()=>{
		// 生成分享码
		const shareCode = generateUUID();
		handleShareSuccess(shareCode)
		return {
			title: paperName.value || '我分享了一份试卷',
			path: `/pages/index/index?shareCode=${shareCode}`
		};
	})


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
		width: 140rpx;
		flex-shrink: 0;
		white-space: nowrap;
	}
	
	.info-value {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}
	
	/* 认领按钮样式 */
	.claim-section {
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #f1f3f5;
	}
	
	.claim-btn {
		width: 100%;
		height: 80rpx;
		background-color: #1890ff;
		color: #fff;
		border: none;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
	}
	
	.claim-btn:active {
		background-color: #40a9ff;
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
	}
	
	.claim-btn-text {
		color: #fff;
		font-size: 32rpx;
		font-weight: 600;
	}

	/* 出题人操作按钮区域 */
	.examiner-actions {
		margin-top: 24rpx;
		padding-top: 24rpx;
		border-top: 2rpx solid #f1f3f5;
		display: flex;
		gap: 20rpx;
	}

	.action-btn {
		flex: 1;
		height: 80rpx;
		border: none;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}

	.close-share-btn {
		background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
		color: #fff;
	}

	.open-share-btn {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		color: #fff;
	}

	.view-share-btn {
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
	}

	.claim-btn-self {
		background: linear-gradient(135deg, #a78bc8 0%, #c9a8e0 100%);
		color: #fff;
	}

	.action-btn:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	}

	.btn-text {
		color: #fff;
		font-size: 28rpx;
		font-weight: 600;
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
		width: 64rpx;
		height: 64rpx;
		border: 4rpx solid #e9ecef;
		border-top-color: #1890ff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-text {
		font-size: 28rpx;
		color: #8c8c8c;
		font-weight: 500;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* 错误状态 */
	.error-container {
		padding: 160rpx 48rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 24rpx;
	}

	.error-icon {
		font-size: 80rpx;
		opacity: 0.8;
	}

	.error-text {
		font-size: 28rpx;
		color: #8c8c8c;
		font-weight: 500;
		text-align: center;
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
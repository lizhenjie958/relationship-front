<template>
	<view class="relationship-list" @refresherrefresh="onRefresh" @refresherpulling="onRefresherPulling" :refresher-enabled="true" :refresher-threshold="80" :refresher-default-style="'default'" :refresher-triggered="refresherTriggered">
		<view class="relationship-list-table">
			<view v-if="loading" class="loading">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else>
				<!-- 数据列表 -->
				<view v-if="protagonData.protagonList.length > 0" class="table-body">
					<view v-for="item in protagonData.protagonList" :key="item.id" class="table-row" @click="navigateToRelationManager(item.id)">
						<view class="table-cell avatar-cell">
							<image v-if="item.smallPicUrl" :src="item.smallPicUrl" class="image" />
							<view v-else class="no-avatar">
								<text class="avatar-icon">👤</text>
							</view>
						</view>
						<view class="table-cell info-cell">
							<view class="name">{{ item.name }}</view>
							<view class="remark">{{ item.remark || '' }}</view>
						</view>
						<view class="table-cell detail-cell">
							<button class="question-button" @click.stop="generateQuestion(item.id)">出题</button>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-else class="empty-state">
					<view class="empty-icon">📭</view>
					<text class="empty-text">暂无数据</text>
					<text class="empty-hint">点击"新增关系"按钮添加第一个关系</text>
				</view>
			</view>
		</view>
		
		<!-- 试卷名称输入弹窗 -->
		<view v-if="showPaperNameDialog" class="dialog-overlay">
			<view class="popup-container">
				<view class="popup-header">
					<text class="popup-title">生成试题</text>
				</view>
				<view class="popup-content">
					<view class="form-item">
						<text class="form-label">试卷名称</text>
						<input 
							v-model="paperName" 
							class="form-input" 
							placeholder="请输入试卷名称（最多10个字）" 
							maxlength="10"
						/>
						<text class="char-count">{{ paperName.length }}/10</text>
					</view>
				</view>
				<view class="popup-footer">
					<button class="cancel-button-small" @click="closePaperNameDialog">取消</button>
					<button class="confirm-button-small" @click="confirmPaperName">确定</button>
				</view>
			</view>
		</view>
		
		<!-- 生成试题弹窗 -->
		<view v-if="generatingQuestion" class="dialog-overlay">
			<view class="loading-container">
				<view class="loading-spinner-large"></view>
				<text class="loading-text">生成试题中...</text>
			</view>
		</view>
		
		<!-- 生成完成弹窗 -->
		<view v-if="showQuestionDialog" class="dialog-overlay">
			<view class="popup-container">
				<view class="popup-header">
					<view class="success-icon">✓</view>
					<text class="popup-title">生成成功</text>
				</view>
				<view class="popup-content">
					<text class="popup-message">试题生成完成，是否跳转到试题详情页？</text>
				</view>
				<view class="popup-footer">
					<button class="cancel-button-small" @click="closeQuestionDialog">否</button>
					<button class="confirm-button-small" @click="navigateToQuestionRecord">是</button>
				</view>
			</view>
		</view>
		
		<!-- 浮动新增按钮 -->
		<FloatingButton @click="navigateToAddRelation" />
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
import { onReachBottom, onShow } from '@dcloudio/uni-app';
import { queryRelationshipList, generateExamPaper } from "@/api/relationApi.js";
import FloatingButton from "@/components/FloatingButton.vue";
	
	// 数据状态
	const protagonData = ref({
		protagonList: [],
		total : 0
	})
	const reqParam ={pageNo:1,pageSize:15};
	const loading = ref(false);

	// 下拉刷新状态
	const refresherTriggered = ref(false);

	// 生成试题状态
const showQuestionDialog = ref(false);
const generatingQuestion = ref(false);
const showPaperNameDialog = ref(false);
const paperName = ref('');
const currentRelationId = ref(null);
const currentExamPaperId = ref(null);
	
	// 跳转到关系管理页面
const navigateToRelationManager = (id) => {
	uni.navigateTo({
		url: `/pages/relationship-manager/relationship-manager?id=${id}`,
		success: (res) => {
			console.log('跳转成功:', res);
		},
		fail: (err) => {
			console.error('跳转失败:', err);
		}
	});
};

// 跳转到新增关系页面
const navigateToAddRelation = () => {
	uni.navigateTo({
		url: '/pages/relationship-manager/relationship-manager',
		success: (res) => {
			console.log('跳转成功:', res);
		},
		fail: (err) => {
			console.error('跳转失败:', err);
		}
	});
};

// 生成试题
const generateQuestion = (id) => {
	currentRelationId.value = id;
	showPaperNameDialog.value = true;
};

// 跳转到试题详情页
const navigateToQuestionRecord = () => {
	uni.navigateTo({
		url: `/pages/exam-paper-detail/exam-paper-detail?id=${currentExamPaperId.value}`,
		success: (res) => {
			console.log('跳转成功:', res);
		},
		fail: (err) => {
			console.error('跳转失败:', err);
		}
	});
	showQuestionDialog.value = false;
};

// 关闭弹窗
const closeQuestionDialog = () => {
	showQuestionDialog.value = false;
};

// 关闭试卷名称输入弹窗
const closePaperNameDialog = () => {
	showPaperNameDialog.value = false;
	paperName.value = '';
	currentRelationId.value = null;
};

// 确认试卷名称
const confirmPaperName = async () => {
	if (!paperName.value.trim()) {
		uni.showToast({
			title: '请输入试卷名称',
			icon: 'none'
		});
		return;
	}
	
	showPaperNameDialog.value = false;
	generatingQuestion.value = true;
	
	try {
		// 调用生成试题接口
		const response = await generateExamPaper({
			relationshipId: currentRelationId.value,
			examPaperName: paperName.value.trim()
		});
		
		console.log('生成试题响应:', response);
		
		if (response && response.code === 200 && response.id) {
			// 保存试卷ID
			currentExamPaperId.value = response.id;
			generatingQuestion.value = false;
			showQuestionDialog.value = true;
		} else {
			uni.showToast({
				title: response?.msg || '生成试题失败',
				icon: 'none'
			});
			generatingQuestion.value = false;
		}
	} catch (error) {
		console.error('生成试题失败:', error);
		uni.showToast({
			title: '生成试题失败，请重试',
			icon: 'none'
		});
		generatingQuestion.value = false;
	}
};

	
	// 方法定义
	const queryPage = async() => {
		loading.value = true;
		try {
			// 使用新的分页查询关系列表接口
			const res = await queryRelationshipList(reqParam);
			console.log('查询关系列表响应:', res);
			
			if (res && res.code === 200 && res.data) {
				// 处理新接口返回的数据格式，进行字段映射
				const formattedList = res.data.list.map(item => ({
					id: item.id,
					name: item.protagonist, // 映射protagonist到name
					smallPicUrl: item.picUrl, // 映射picUrl到smallPicUrl
					remark: item.remark || ''
				}));
				
				protagonData.value.protagonList = [...protagonData.value.protagonList, ...formattedList];
				protagonData.value.total = res.data.total;
			}
		} catch (error) {
			console.error('获取关系列表失败:', error);
		} finally {
			loading.value = false;
		}
	};
	
	// 触底加载
	onReachBottom(()=>{
		// 检查是否已加载所有数据
		if (protagonData.value.protagonList.length >= protagonData.value.total) {
			uni.showToast({
				title: '已到达最后一页',
				icon: 'none'
			});
			return;
		}
		
		reqParam.pageNo = reqParam.pageNo + 1;
		queryPage(reqParam)
	})
	
	// 页面挂载时获取数据
	onMounted(() => {
		
	});

	// 下拉刷新事件处理
const onRefresh = async () => {
	// 开始刷新，显示loading
	refresherTriggered.value = true;
	// 重置页码
	reqParam.pageNo = 1;
	// 清空列表
	protagonData.value.protagonList = [];
	// 重新获取数据
	await queryPage();
	// 刷新完成，隐藏loading
	refresherTriggered.value = false;
	// 显示刷新成功提示
	uni.showToast({
		title: '刷新成功',
		icon: 'success',
		duration: 1500
	});
};

// 下拉过程事件处理（可选）
const onRefresherPulling = () => {
	// 可以在这里添加下拉过程中的动画或状态更新
};

// 页面显示时刷新数据
	onShow(() => {
		// 重置页码
		reqParam.pageNo = 1;
		// 清空列表
		protagonData.value.protagonList = [];
		// 重新获取数据
		queryPage();
	});
</script>

<style lang="scss" scoped>
	// 导入主题变量
	@import '@/styles/theme.scss';
	
	.relationship-list {
		padding: 24rpx;
		background: linear-gradient(180deg, #f0f5ff 0%, #f5f7fa 100%);
		min-height: 100vh;
	}

	.relationship-list-table {
		overflow: hidden;
	}
	
	/* 加载状态 */
	.loading {
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
	
	/* 表格容器 */
	.table-body {
		padding: 4rpx;
	}
	
	.table-row {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
		border-radius: $radius-lg;
		margin-bottom: 24rpx;
		padding: 28rpx;
		box-shadow: $shadow-md;
		transition: all $transition-normal;
		border: 2rpx solid rgba(24, 144, 255, 0.05);
		position: relative;
		overflow: hidden;
		
		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 6rpx;
			background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
			border-radius: $radius-lg 0 0 $radius-lg;
			opacity: 0;
			transition: opacity $transition-normal;
		}
	}
	
	.table-row:active {
		background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
		box-shadow: $shadow-lg;
		transform: translateY(-2rpx) scale(0.995);
		
		&::before {
			opacity: 1;
		}
	}
	
	/* 表格单元格 */
	.table-cell {
		padding: 0 16rpx;
		display: flex;
		align-items: center;
	}
	
	.avatar-cell {
		width: 96rpx;
		white-space: nowrap;
		padding-left: 0;
	}
	
	.info-cell {
		flex: 1;
		min-width: 200rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: 12rpx;
		padding-left: 8rpx;
	}
	
	.detail-cell {
		white-space: nowrap;
		padding-right: 0;
	}
	
	/* 名称样式 */
	.name {
		font-size: $font-lg;
		font-weight: 600;
		color: $text-primary;
		letter-spacing: 1rpx;
	}
	
	/* 头像样式 */
	.image {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		object-fit: cover;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		transition: all $transition-normal;
	}
	
	.table-row:active .image {
		transform: scale(1.05);
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
	}
	
	/* 无头像样式 */
	.no-avatar {
		width: 88rpx;
		height: 88rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #f0f2f5 0%, #e8eaf0 100%);
		display: flex;
		justify-content: center;
		align-items: center;
		border: 4rpx solid #fff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
	
	.avatar-icon {
		font-size: 44rpx;
		opacity: 0.7;
	}
	
	/* 备注样式 */
	.remark {
		font-size: $font-sm;
		color: $text-tertiary;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		max-width: 100%;
		background: linear-gradient(90deg, $text-tertiary 0%, $text-quaternary 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	
	/* 试题按钮样式 */
	.question-button {
		padding: 14rpx 28rpx;
		background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
		color: #fff;
		border: none;
		border-radius: $radius-full;
		font-size: $font-sm;
		font-weight: 600;
		transition: all $transition-normal;
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
		letter-spacing: 2rpx;
		position: relative;
		overflow: hidden;
		
		&::after {
			content: '';
			position: absolute;
			top: 50%;
			left: 50%;
			width: 0;
			height: 0;
			background: rgba(255, 255, 255, 0.3);
			border-radius: 50%;
			transform: translate(-50%, -50%);
			transition: width 0.4s ease, height 0.4s ease;
		}
	}

	.question-button:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
		
		&::after {
			width: 200rpx;
			height: 200rpx;
		}
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
	}
	
	@keyframes float {
		0%, 100% {
			transform: translateY(0) rotate(0deg);
		}
		50% {
			transform: translateY(-16rpx) rotate(3deg);
		}
	}
	
	.empty-text {
		font-size: $font-xl;
		color: $text-secondary;
		font-weight: 600;
		font-weight: 600;
	}
	
	.empty-hint {
		font-size: 26rpx;
		color: #c0c4cc;
		font-weight: 400;
	}

	/* 加载容器 */
	.loading-container {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 60rpx 40rpx;
		text-align: center;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 32rpx;
	}
	
	.loading-spinner-large {
		width: 80rpx;
		height: 80rpx;
		border: 6rpx solid #e9ecef;
		border-top-color: #1890ff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	/* 弹窗消息 */
	.popup-message {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		text-align: center;
	}
	
	/* 弹窗遮罩层 */
	.dialog-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 9999;
		backdrop-filter: blur(4rpx);
	}
	
	/* 弹窗样式 */
	.popup-container {
		background-color: #fff;
		border-radius: 24rpx;
		padding: 40rpx;
		width: 85%;
		max-width: 540rpx;
		z-index: 10000;
		box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
		animation: popupSlideIn 0.3s ease-out;
	}
	
	@keyframes popupSlideIn {
		from {
			opacity: 0;
			transform: translateY(40rpx) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	
	.popup-header {
		text-align: center;
		margin-bottom: 40rpx;
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24rpx;
	}
	
	.success-icon {
		width: 100rpx;
		height: 100rpx;
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		font-size: 56rpx;
		font-weight: 700;
		box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
		animation: successPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	
	@keyframes successPop {
		0% {
			transform: scale(0);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}
	
	.popup-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #2c3e50;
		letter-spacing: 2rpx;
	}
	
	.popup-content {
		margin-bottom: 40rpx;
	}
	
	/* 表单样式 */
	.form-item {
		margin-bottom: 32rpx;
	}
	
	.form-label {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: #34495e;
		margin-bottom: 16rpx;
	}
	
	.form-input {
		width: 100%;
		padding: 32rpx 24rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		font-size: 26rpx;
		line-height: 1.6;
		min-height: 100rpx;
		color: #2c3e50;
		background-color: #f8f9fa;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}
	
	.form-input:focus {
		border-color: #1890ff;
		background-color: #fff;
		box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.1);
		outline: none;
	}
	
	.form-input::placeholder {
		color: #adb5bd;
	}
	
	.char-count {
		font-size: 24rpx;
		color: #909399;
		text-align: right;
		margin-top: 8rpx;
	}
	
	.form-textarea {
		width: 100%;
		padding: 24rpx 28rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 16rpx;
		font-size: 28rpx;
		color: #2c3e50;
		background-color: #f8f9fa;
		min-height: 160rpx;
		resize: none;
		transition: all 0.3s ease;
		box-sizing: border-box;
	}
	
	.form-textarea:focus {
		border-color: #1890ff;
		background-color: #fff;
		box-shadow: 0 0 0 4rpx rgba(24, 144, 255, 0.1);
		outline: none;
	}
	
	.form-textarea::placeholder {
		color: #adb5bd;
	}
	
	/* 头像上传样式 */
	.avatar-upload {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.3s ease;
		border: 4rpx solid #e9ecef;
		position: relative;
	}
	
	.avatar-upload:hover {
		transform: scale(1.05);
		border-color: #1890ff;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.2);
	}
	
	.uploaded-avatar {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	
	.avatar-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		color: #6c757d;
		position: relative;
	}
	
	.avatar-placeholder::before {
		content: '+';
		position: absolute;
		font-size: 60rpx;
		color: #adb5bd;
		opacity: 0.5;
	}
	
	/* 弹窗底部按钮样式 */
	.popup-footer {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}
	
	.cancel-button {
		flex: 1;
		padding: 18rpx;
		background-color: #f8f9fa;
		color: #6c757d;
		border: 2rpx solid #e9ecef;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
	}

	.cancel-button:hover {
		background-color: #e9ecef;
		color: #495057;
		transform: translateY(-1rpx);
		box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.cancel-button:active {
		transform: translateY(0);
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
	}

	.confirm-button {
		flex: 1;
		padding: 18rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 12rpx;
		font-size: 26rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		box-shadow: 0 3rpx 12rpx rgba(24, 144, 255, 0.25);
		position: relative;
		overflow: hidden;
	}

	.confirm-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		transition: left 0.6s ease;
	}

	.confirm-button:hover::before {
		left: 100%;
	}

	.confirm-button:hover {
		transform: translateY(-1rpx);
		box-shadow: 0 5rpx 18rpx rgba(24, 144, 255, 0.35);
		background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
	}

	.confirm-button:active {
		transform: translateY(0);
		box-shadow: 0 3rpx 12rpx rgba(24, 144, 255, 0.25);
	}
	
	/* 小按钮样式 - 用于试卷名称输入弹窗 */
	.cancel-button-small {
		flex: 1;
		padding: 12rpx;
		background-color: #f8f9fa;
		color: #6c757d;
		border: 2rpx solid #e9ecef;
		border-radius: 8rpx;
		font-size: 22rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
	}

	.cancel-button-small:hover {
		background-color: #e9ecef;
		color: #495057;
		transform: translateY(-1rpx);
		box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.cancel-button-small:active {
		transform: translateY(0);
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.06);
	}

	.confirm-button-small {
		flex: 1;
		padding: 12rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 8rpx;
		font-size: 22rpx;
		font-weight: 500;
		transition: all 0.3s ease;
		box-shadow: 0 3rpx 12rpx rgba(24, 144, 255, 0.25);
		position: relative;
		overflow: hidden;
	}

	.confirm-button-small::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		transition: left 0.6s ease;
	}

	.confirm-button-small:hover::before {
		left: 100%;
	}

	.confirm-button-small:hover {
		transform: translateY(-1rpx);
		box-shadow: 0 5rpx 18rpx rgba(24, 144, 255, 0.35);
		background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
	}

	.confirm-button-small:active {
		transform: translateY(0);
		box-shadow: 0 3rpx 12rpx rgba(24, 144, 255, 0.25);
	}
</style>
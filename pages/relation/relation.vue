<template>
	<view class="relation">
		<!-- 新增按钮 -->
		<view class="page-header">
			<text class="page-title">关系管理</text>
			<button class="add-button" @click="navigateToAddRelation">
			<text class="button-icon">+</text>
			<text class="button-text">新增关系</text>
		</button>
		</view>
		<view class="relationTable">
			<view v-if="loading" class="loading">
				<text class="loading-text">加载中...</text>
			</view>
			<view v-else>
				<!-- 表头 -->
				<view class="table-header">
					<view class="table-cell name-cell">主角</view>
					<view class="table-cell avatar-cell">头像</view>
					<view class="table-cell remark-cell">备注</view>
					<view class="table-cell detail-cell">详情</view>
				</view>
				
				<!-- 数据列表 -->
				<view v-if="protagonData.protagonList.length > 0" class="table-body">
					<view v-for="item in protagonData.protagonList" :key="item.id" class="table-row" @click="navigateToRelationManager(item.id)">
						<view class="table-cell name-cell">
							<view class="name">{{ item.name }}</view>
						</view>
						<view class="table-cell avatar-cell">
							<image v-if="item.smallPicUrl" :src="item.smallPicUrl" class="image" />
							<view v-else class="no-avatar">
								<text>无头像</text>
							</view>
						</view>
						<view class="table-cell remark-cell">
							<view class="remark">{{ item.remark || '' }}</view>
						</view>
						<view class="table-cell detail-cell">
							<button class="question-button" @click.stop="generateQuestion(item.id)">试题</button>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-else class="empty-state">
					<text>暂无更多数据</text>
				</view>
			</view>
		</view>
		
		<!-- 生成试题弹窗 -->
		<view v-if="generatingQuestion" class="dialog-overlay">
			<view class="loading-container">
				<text class="loading-text">生成试题中...</text>
			</view>
		</view>
		
		<!-- 生成完成弹窗 -->
		<view v-if="showQuestionDialog" class="dialog-overlay">
			<view class="popup-container">
				<view class="popup-header">
					<text class="popup-title">生成成功</text>
				</view>
				<view class="popup-content">
					<text class="popup-message">试题生成完成，是否跳转到试题详情页？</text>
				</view>
				<view class="popup-footer">
					<button class="cancel-button" @click="closeQuestionDialog">否</button>
					<button class="confirm-button" @click="navigateToQuestionRecord">是</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import { onReachBottom, onShow } from '@dcloudio/uni-app';
	import { queryProtagonistPage } from "@/api/relationApi.js";
	
	// 数据状态
	const protagonData = ref({
		protagonList: [],
		total : 0
	})
	const reqParam ={pageNo:1,pageSize:15};
	const loading = ref(false);
	
	// 生成试题状态
const showQuestionDialog = ref(false);
const generatingQuestion = ref(false);
	
	// 跳转到关系管理页面
const navigateToRelationManager = (id) => {
	uni.navigateTo({
		url: `/pages/relation-manage/relation-manage?id=${id}`,
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
		url: '/pages/relation-manage/relation-manage',
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
	generatingQuestion.value = true;
	
	// 模拟生成试题的过程
	setTimeout(() => {
		generatingQuestion.value = false;
		showQuestionDialog.value = true;
	}, 1500);
};

// 跳转到试题详情页
const navigateToQuestionRecord = () => {
	uni.navigateTo({
		url: '/pages/question-record/question-record',
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

	
	// 方法定义
	const queryPage = async() => {
		loading.value = true;
		try {
			const res = await queryProtagonistPage(reqParam);
			if (res && res.data) {
				protagonData.value.protagonList = [...protagonData.value.protagonList, ...res.data.list];
				protagonData.value.total = res.data.total;
			}
		} catch (error) {
			console.error('获取主角列表失败:', error);
		} finally {
			// 修改模拟数据，添加备注字段
			protagonData.value.protagonList = [
				{ id: 1, name: '张三', smallPicUrl: '', remark: '这是一个测试备注，最多显示20字' },
				{ id: 2, name: '李四', smallPicUrl: '', remark: '简短备注' },
				{ id: 3, name: '王五', smallPicUrl: '', remark: '这是一个超过20字的长备注，需要截断显示' },
				{ id: 4, name: '赵六', smallPicUrl: '', remark: '' },
				{ id: 5, name: '钱七', smallPicUrl: '', remark: '测试备注' }
			];
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
	.relation {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	/* 页面头部样式 */
	.page-header {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-bottom: 32rpx;
		padding: 24rpx 0;
		border-bottom: 2rpx solid #f1f3f5;
	}
	
	.page-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #2c3e50;
		letter-spacing: 2rpx;
	}
	
	/* 新增按钮样式 */
	.add-button {
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 16rpx 32rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 28rpx;
		font-size: 26rpx;
		font-weight: 600;
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		position: relative;
	}
	
	.add-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s ease;
	}
	
	.add-button:hover::before {
		left: 100%;
	}
	
	.add-button:hover {
		transform: translateY(-4rpx);
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.4);
	}
	
	.add-button:active {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
	}
	
	.button-icon {
		font-size: 32rpx;
		font-weight: 300;
		line-height: 1;
	}
	
	.button-text {
		line-height: 1;
	}
	
	.relationTable {
		background-color: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
		overflow: hidden;
		transition: all 0.3s ease;
	}
	
	.relationTable:hover {
		box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.12);
	}
	
	/* 加载状态 */
	.loading {
		padding: 60rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.loading-text {
		font-size: 28rpx;
		color: #909399;
	}
	
	/* 表格容器 */
	.table-header {
		display: flex;
		background-color: #f8f9fa;
		border-bottom: 2rpx solid #e9ecef;
		font-weight: 600;
		color: #333;
		font-size: 28rpx;
	}
	
	.table-body {
		
	}
	
	.table-row {
		display: flex;
		border-bottom: 1rpx solid #f1f3f5;
		transition: background-color 0.2s ease;
	}
	
	.table-row:hover {
		background-color: #f8f9fa;
	}
	
	/* 表格单元格 */
	.table-cell {
		padding: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.name-cell {
		width: 120rpx;
		white-space: nowrap;
	}
	
	.avatar-cell {
		width: 100rpx;
		white-space: nowrap;
	}
	
	.remark-cell {
		flex: 1;
		min-width: 200rpx;
	}
	
	.detail-cell {
		width: 120rpx;
		white-space: nowrap;
	}
	
	/* 名称样式 */
	.name {
		font-size: 32rpx;
		font-weight: 500;
		color: #2c3e50;
	}
	
	/* 头像样式 */
	.image {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		object-fit: cover;
		border: 2rpx solid #e9ecef;
		transition: transform 0.2s ease;
	}
	
	.image:hover {
		transform: scale(1.05);
	}
	
	/* 无头像样式 */
	.no-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background-color: #f8f9fa;
		border: 2rpx dashed #dee2e6;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 24rpx;
		color: #adb5bd;
		transition: all 0.2s ease;
	}
	
	.no-avatar:hover {
		background-color: #e9ecef;
		transform: scale(1.05);
	}
	
	/* 备注样式 */
	.remark {
		font-size: 28rpx;
		color: #666;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		max-width: 100%;
	}
	
	/* 试题按钮样式 */
	.question-button {
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

	.question-button:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.4);
	}

	.question-button:active {
		transform: translateY(0);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.3);
	}
	
	/* 空状态样式 */
	.empty-state {
		padding: 100rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 30rpx;
		color: #909399;
	}

	/* 加载容器 */
	.loading-container {
		background-color: #fff;
		border-radius: 16rpx;
		padding: 40rpx;
		text-align: center;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
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
		margin-bottom: 36rpx;
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
		padding: 24rpx 28rpx;
		border: 2rpx solid #e9ecef;
		border-radius: 16rpx;
		font-size: 28rpx;
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
		gap: 24rpx;
	}
	
	.cancel-button {
		flex: 1;
		padding: 24rpx;
		background-color: #f8f9fa;
		color: #6c757d;
		border: 2rpx solid #e9ecef;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.3s ease;
	}
	
	.cancel-button:hover {
		background-color: #e9ecef;
		color: #495057;
		transform: translateY(-2rpx);
	}
	
	.cancel-button:active {
		transform: translateY(0);
	}
	
	.confirm-button {
		flex: 1;
		padding: 24rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 16rpx;
		font-size: 28rpx;
		font-weight: 600;
		transition: all 0.3s ease;
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
	}
	
	.confirm-button:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.4);
	}
	
	.confirm-button:active {
		transform: translateY(0);
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.3);
	}
</style>
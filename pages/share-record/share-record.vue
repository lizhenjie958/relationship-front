<template>
	<view class="share-record-container">
		<!-- 页面标题 -->
		<view class="page-header" v-if="paperName">
			<text class="page-title">{{ paperName }}</text>
		</view>

		<!-- 加载状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 分享记录列表 -->
		<template v-else>
			<view v-if="shareList.length > 0" class="share-list">
				<view
					v-for="item in shareList"
					:key="item.id"
					class="share-card"
				>
					<view class="share-header">
						<text class="share-name">{{ item.sourceName }}</text>
						<view class="status-badge" :class="getStatusClass(item.shareStatus)">
							<text class="status-text">{{ getStatusText(item.shareStatus) }}</text>
						</view>
					</view>

					<view class="share-info">
						<view class="info-item">
							<text class="info-label">分享时间：</text>
							<text class="info-value">{{ formatDateTime(item.shareTime) }}</text>
						</view>
						<!-- 已停止状态显示停止时间 -->
						<view v-if="item.shareStatus === 2" class="info-item">
							<text class="info-label">停止时间：</text>
							<text class="info-value">{{ formatDateTime(item.stopTime) }}</text>
						</view>
					</view>

					<!-- 停止分享按钮 - 仅在分享中状态显示 -->
					<view v-if="item.shareStatus === 1" class="action-section">
						<button class="stop-btn" @click="handleStopShare(item.id)">
							<text class="btn-text">停止分享</text>
						</button>
					</view>
				</view>
			</view>

			<!-- 空状态 -->
			<view v-else class="empty-state">
				<view class="empty-icon">📭</view>
				<text class="empty-text">暂无分享记录</text>
				<text class="empty-hint">该试卷还没有被分享过</text>
			</view>
		</template>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';
import { queryShareRecordList, stopShare } from '@/api/shareApi.js';

// 接收传入的sourceId
const props = defineProps({
	sourceId: {
		type: String,
		default: ''
	}
});

// 数据
const sourceId = ref(props.sourceId || '');
const paperName = ref('');
const shareList = ref([]);
const loading = ref(false);
const pageNo = ref(1);
const pageSize = ref(15);

// 状态映射
const getStatusText = (status) => {
	const statusMap = {
		1: '分享中',
		2: '已停止',
		3: '已过期'
	};
	return statusMap[status] || '未知状态';
};

// 状态样式类映射
const getStatusClass = (status) => {
	const classMap = {
		1: 'sharing',
		2: 'stopped',
		3: 'expired'
	};
	return classMap[status] || 'stopped';
};

// 格式化日期时间
const formatDateTime = (dateStr) => {
	if (!dateStr) return '-';
	const date = new Date(dateStr);
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	});
};

// 获取分享记录列表
const fetchShareRecordList = async () => {
	if (!sourceId.value) {
		uni.showToast({
			title: 'sourceId不能为空',
			icon: 'none'
		});
		return;
	}

	loading.value = true;
	try {
		const response = await queryShareRecordList({
			sourceType: 1, // 固定为1
			sourceId: sourceId.value,
			pageNo: pageNo.value,
			pageSize: pageSize.value
		});

		if (response.code === 200) {
			shareList.value = response.data.list || [];
			// 设置页面标题（取第一条记录的sourceName，分割"-"之前的字符）
			if (shareList.value.length > 0) {
				const fullName = shareList.value[0].sourceName || '';
				paperName.value = fullName.split('-')[0];
			}
		} else {
			uni.showToast({
				title: response.msg || '获取分享记录失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取分享记录失败:', error);
		uni.showToast({
			title: '获取分享记录失败',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
};

// 停止分享
const handleStopShare = (shareId) => {
	uni.showModal({
		title: '确认停止分享',
		content: '停止分享后不可恢复，是否继续？',
		confirmText: '停止',
		confirmColor: '#ff4d4f',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				try {
					uni.showLoading({ title: '处理中...' });
					
					const response = await stopShare({
						id: shareId
					});
					
					uni.hideLoading();
					
					if (response.code === 200) {
						uni.showToast({
							title: '已停止分享',
							icon: 'success'
						});
						// 刷新列表
						fetchShareRecordList();
					} else {
						uni.showToast({
							title: response.msg || '停止失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('停止分享失败:', error);
					uni.showToast({
						title: '停止失败，请重试',
						icon: 'none'
					});
				}
			}
		}
	});
};

// 页面下拉刷新
onPullDownRefresh(async () => {
	console.log('分享记录页面下拉刷新');
	await fetchShareRecordList();
	uni.stopPullDownRefresh();
});

// 页面挂载
onMounted(() => {
	fetchShareRecordList();
});
</script>

<style lang="scss" scoped>
.share-record-container {
	padding: 24rpx;
	background: linear-gradient(180deg, #f0f5ff 0%, #f5f7fa 100%);
	min-height: 100vh;
}

/* 页面标题 */
.page-header {
	margin-bottom: 32rpx;
	text-align: center;
}

.page-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #2c3e50;
	display: block;
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
	border: 4rpx solid rgba(24, 144, 255, 0.1);
	border-top-color: #1890ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #999;
	font-weight: 500;
}

/* 分享列表 */
.share-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.share-card {
	background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
	border-radius: 20rpx;
	padding: 32rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	border: 2rpx solid rgba(24, 144, 255, 0.05);
	transition: all 0.3s ease;
}

.share-card:hover {
	transform: translateY(-4rpx);
	box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.1);
}

/* 分享头部 */
.share-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #f1f3f5;
}

.share-name {
	font-size: 32rpx;
	font-weight: 600;
	color: #2c3e50;
	flex: 1;
	margin-right: 20rpx;
}

.status-badge {
	padding: 8rpx 20rpx;
	border-radius: 24rpx;
	font-size: 24rpx;
	font-weight: 600;
}

.status-badge.sharing {
	background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
	color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.3);
}

.status-badge.stopped {
	background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
	color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.3);
}

.status-badge.expired {
	background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
	color: #fff;
}

.status-text {
	font-size: 24rpx;
	font-weight: 600;
}

/* 分享信息 */
.share-info {
	margin-bottom: 24rpx;
}

.info-item {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.info-item:last-child {
	margin-bottom: 0;
}

.info-label {
	font-size: 26rpx;
	color: #666;
	width: 140rpx;
}

.info-value {
	font-size: 26rpx;
	color: #333;
	font-weight: 500;
}

/* 操作区域 */
.action-section {
	padding-top: 24rpx;
	border-top: 2rpx solid #f1f3f5;
}

.stop-btn {
	width: 100%;
	height: 80rpx;
	background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
	color: #fff;
	border: none;
	border-radius: 12rpx;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s ease;
	box-shadow: 0 4rpx 16rpx rgba(255, 77, 79, 0.3);
}

.stop-btn:active {
	transform: scale(0.98);
	box-shadow: 0 2rpx 8rpx rgba(255, 77, 79, 0.2);
}

.btn-text {
	color: #fff;
	font-size: 28rpx;
	font-weight: 600;
}

/* 空状态 */
.empty-state {
	padding: 160rpx 48rpx;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 24rpx;
}

.empty-icon {
	font-size: 120rpx;
	opacity: 0.8;
	animation: float 3s ease-in-out infinite;
}

@keyframes float {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-10rpx); }
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

/* 响应式设计 */
@media (max-width: 750rpx) {
	.share-record-container {
		padding: 16rpx;
	}

	.share-card {
		padding: 24rpx;
	}

	.page-title {
		font-size: 36rpx;
	}
}
</style>

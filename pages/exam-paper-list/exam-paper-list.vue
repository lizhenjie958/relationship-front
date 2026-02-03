<template>
	<view class="question-list-container" @refresherrefresh="onRefresh" @refresherpulling="onRefresherPulling" :refresher-enabled="true" :refresher-threshold="80" :refresher-default-style="'default'" :refresher-triggered="refresherTriggered">
		
		<view class="table-container">
			<!-- 表格头部 -->
			<view class="table-header">
				<view class="table-cell paper-name-cell">试卷名</view>
				<view class="table-cell name-cell">主角</view> 
				<view class="table-cell avatar-cell">头像</view>
				<view class="table-cell time-cell">创建时间</view>
			</view>

			<!-- 表格内容 -->
			<view class="table-body">
				<view v-for="(item, index) in questions" :key="item.id" class="swipe-cell">
					<!-- 左滑操作按钮 -->
					<view class="swipe-actions">
						<button class="swipe-action delete-action" @click="deleteQuestion(item.id)">
							<text class="action-icon">🗑️</text>
							<text class="action-text">删除</text>
						</button>
					</view>
					<!-- 主内容区域 -->
					<view 
						class="table-row"
						@touchstart="handleTouchStart($event, index)"
						@touchmove="handleTouchMove($event, index)"
						@touchend="handleTouchEnd($event, index)"
						:style="{ transform: `translateX(${swipeOffset[index] || 0}rpx)` }"
						@click="goToRecord(item.id)"
					>
						<view class="table-cell paper-name-cell">
							<text class="paper-name">{{ item.paperName }}</text>
						</view>
						<view class="table-cell name-cell">
							<text class="name">{{ item.name }}</text>
						</view>
						<view class="table-cell avatar-cell">
							<view class="avatar">
								<image :src="item.avatar" class="avatar-image" />
							</view>
						</view>
						<view class="table-cell time-cell">
							<text class="create-time">{{ item.createTime }}</text>
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
import { request } from '@/utils/request.js';

// 试卷数据
const questions = ref([]);

// 滑动相关数据
const swipeOffset = ref({}); // 存储每个项目的滑动偏移量
const startX = ref({}); // 存储每个项目的起始触摸X坐标
const isSwipping = ref({}); // 标记每个项目是否正在滑动
const ACTION_WIDTH = 130; // 操作按钮总宽度（一个删除按钮130rpx）

// 下拉刷新状态
const refresherTriggered = ref(false);

// 跳转到答题记录页
const goToRecord = (questionId) => {
	uni.navigateTo({
		url: `/pages/exam-paper-detail/exam-paper-detail?id=${questionId}`
	});
};



// 删除试卷
const deleteQuestion = (questionId) => {
	// 关闭所有滑动
	resetAllSwipe();
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这份试卷吗？',
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4d4f',
		success: async (res) => {
			if (res.confirm) {
				try {
					// 调用删除接口
					const response = await request({
						url: '/examPaper/delete',
						method: 'POST',
						data: { id: questionId }
					});
					
					if (response.code === 200) {
						uni.showToast({
							title: response.msg || '删除成功',
							icon: 'success'
						});
						// 重新获取试卷列表，刷新页面
						await fetchExamPapers();
					} else {
						uni.showToast({
							title: response.msg || '删除失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('删除试卷失败:', error);
					uni.showToast({
						title: '删除失败，请稍后重试',
						icon: 'none'
					});
				}
				// 删除后重置滑动状态
				resetAllSwipe();
			}
		}
	});
};

// 重置所有滑动状态
const resetAllSwipe = () => {
	Object.keys(swipeOffset.value).forEach(key => {
		swipeOffset.value[key] = 0;
	});
	Object.keys(isSwipping.value).forEach(key => {
		isSwipping.value[key] = false;
	});
};

// 触摸开始事件
const handleTouchStart = (event, index) => {
	startX.value[index] = event.touches[0].clientX;
	isSwipping.value[index] = true;
	// 关闭其他项的滑动
	Object.keys(swipeOffset.value).forEach(key => {
		if (key != index) {
			swipeOffset.value[key] = 0;
		}
	});
};

// 触摸移动事件
const handleTouchMove = (event, index) => {
	if (!isSwipping.value[index]) return;
	
	const moveX = event.touches[0].clientX;
	const offsetX = moveX - startX.value[index];
	
	// 限制滑动范围：只能向左滑动，最大滑动距离为操作按钮宽度
	let newOffset = Math.min(0, Math.max(offsetX, -ACTION_WIDTH));
	
	// 更新滑动偏移量
	swipeOffset.value[index] = newOffset;
};

// 触摸结束事件
const handleTouchEnd = (event, index) => {
	isSwipping.value[index] = false;
	
	// 根据滑动距离判断是否完全展开或关闭
	const offset = swipeOffset.value[index] || 0;
	const threshold = -ACTION_WIDTH / 2;
	
	if (offset < threshold) {
		// 完全展开
		swipeOffset.value[index] = -ACTION_WIDTH;
	} else {
		// 关闭
		swipeOffset.value[index] = 0;
	}
};

// 获取试卷列表
const fetchExamPapers = async () => {
	try {
		const response = await request({
			url: '/examPaper/queryList',
			method: 'POST',
			data: {}
		});
		
		if (response.code === 200) {
			// 将接口返回的数据转换为组件所需的格式
			questions.value = response.data.list.map(item => ({
				id: item.id,
				name: item.protagonistInfoDTO.protagonist, // 主角姓名
				avatar: item.protagonistInfoDTO.picUrl, // 主角头像
				paperName: item.name, // 试卷名称
				createTime: item.createTime // 创建时间
			}));
			// 初始化滑动状态
			resetAllSwipe();
		} else {
			uni.showToast({
				title: '获取试卷列表失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取试卷列表失败:', error);
		uni.showToast({
			title: '获取试卷列表失败',
			icon: 'none'
		});
	}
};

// 下拉刷新事件处理
const onRefresh = async () => {
	// 开始刷新，显示loading
	refresherTriggered.value = true;
	// 调用API获取最新试卷列表
	await fetchExamPapers();
	// 刷新完成，隐藏loading
	refresherTriggered.value = false;
};

// 下拉过程事件处理（可选）
const onRefresherPulling = () => {
	// 可以在这里添加下拉过程中的动画或状态更新
};

onMounted(() => {
	// 调用API获取试卷列表
	fetchExamPapers();
});
</script>

<style scoped>
.question-list-container {
	padding: 20rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

.table-container {
	background-color: transparent;
	border-radius: 16rpx;
	padding: 20rpx;
}

.table-header {
	display: flex;
	background-color: #f8f9fa;
	border-radius: 12rpx;
	padding: 24rpx;
	font-weight: 600;
	color: #333;
	font-size: 28rpx;
	margin: 0 12rpx 24rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.table-row {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	border-bottom: 2rpx solid #f0f0f0;
	transition: all 0.3s ease;
	border-radius: 12rpx;
	margin: 0;
	background-color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	height: 100%;
	box-sizing: border-box;
}

.table-row:hover {
	background-color: #f8f9fa;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	transform: translateY(-2rpx);
}

.table-cell {
	display: flex;
	align-items: center;
}

.name-cell {
	flex: 1;
	padding: 0 16rpx;
}

.avatar-cell {
	flex: 1;
	justify-content: center;
}

.paper-name-cell {
	flex: 1.5;
	padding: 0 16rpx;
}

.time-cell {
	flex: 2;
	justify-content: center;
	padding: 0 16rpx;
}

.action-cell {
	flex: 1;
	justify-content: flex-end;
	padding: 0 16rpx;
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

.paper-name {
	font-size: 28rpx;
	color: #333;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 120rpx;
}

.create-time {
	font-size: 24rpx;
	color: #666;
}

/* 左滑操作样式 */
.swipe-cell {
	position: relative;
	margin: 0 12rpx 16rpx;
	border-radius: 12rpx;
	overflow: hidden;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
	transform: translateZ(0);
	backface-visibility: hidden;
	height: 120rpx;
}

/* 左滑操作按钮容器 */
.swipe-actions {
	position: absolute;
	top: 10rpx;
	right: 0;
	height: calc(100% - 20rpx);
	display: flex;
	flex-direction: row;
	z-index: 1;
}

/* 左滑操作按钮 */
.swipe-action {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 0 10rpx;
	border: none;
	color: #fff;
	font-size: 22rpx;
	transition: all 0.3s ease;
	width: 130rpx;
	height: 100%;
	border-radius: 12rpx;
}

.swipe-action:active {
	opacity: 0.8;
	transform: scale(0.95);
}

/* 分享按钮样式 */
.share-action {
	background-color: #52c41a;
}

/* 删除按钮样式 */
.delete-action {
	background-color: #ff4d4f;
}

/* 操作按钮图标 */
.action-icon {
	font-size: 32rpx;
	margin-bottom: 8rpx;
}

/* 操作按钮文本 */
.action-text {
	font-size: 20rpx;
	font-weight: 500;
}

/* 主内容区域 */
.table-row {
	display: flex;
	align-items: center;
	padding: 28rpx 24rpx;
	border-bottom: 2rpx solid #f0f0f0;
	border-radius: 12rpx;
	background-color: #fff;
	transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	position: relative;
	z-index: 2;
	cursor: pointer;
	height: 100%;
	box-sizing: border-box;
	margin: 0;
}

	/* 隐藏操作列 */
	.action-cell {
		display: none;
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

		.name {
			font-size: 24rpx;
		}

		.paper-name {
			font-size: 24rpx;
		}

		.create-time {
			font-size: 20rpx;
		}

		.avatar {
			width: 50rpx;
			height: 50rpx;
		}

		/* 左滑操作按钮响应式调整 */
			.swipe-action {
				width: 120rpx;
				padding: 0 8rpx;
			}

			.action-icon {
				font-size: 26rpx;
				margin-bottom: 4rpx;
			}

			.action-text {
				font-size: 16rpx;
			}
			
			/* 左滑操作按钮容器响应式调整 */
			.swipe-actions {
				top: 8rpx;
				height: calc(100% - 16rpx);
			}
			
			/* 响应式调整swipe-cell高度 */
			.swipe-cell {
				height: 110rpx;
			}
			
			/* 响应式调整ACTION_WIDTH */
			/* 注意：JS中的ACTION_WIDTH不会自动更新，这里仅用于CSS样式调整 */
	}
</style>
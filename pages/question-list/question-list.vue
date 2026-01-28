<template>
	<view class="question-list-container">
		
		<view class="table-container">
			<!-- 表格头部 -->
			<view class="table-header">
				<view class="table-cell paper-name-cell">试卷名</view>
				<view class="table-cell name-cell">主角</view> 
				<view class="table-cell avatar-cell">头像</view>
				<view class="table-cell time-cell">创建时间</view>
				<view class="table-cell action-cell">操作</view>
			</view>

			<!-- 表格内容 -->
			<view class="table-body">
				<view v-for="(item, index) in questions" :key="item.id" class="table-row">
					<view class="table-cell paper-name-cell">
						<text class="paper-name" @click="goToRecord(item.id)">{{ item.paperName }}</text>
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
					<view class="table-cell action-cell">
						<view class="action-menu">
							<button class="action-menu-button" @click="toggleActionMenu(item.id)">
								<text class="menu-icon">⋮</text>
							</button>
							<view 
								v-if="openMenuId === item.id" 
								:class="[
									'action-menu-dropdown',
									index === 0 ? 'dropdown-down' : '',
									index === questions.length - 1 ? 'dropdown-up' : ''
								]"
							>
								<button class="menu-item share-item" @click.stop="shareQuestion(item.id)">
									<text class="menu-icon">📤</text>
									<text class="menu-text">分享</text>
								</button>
								<button class="menu-item detail-item" @click.stop="goToRecord(item.id)">
									<text class="menu-icon">📋</text>
									<text class="menu-text">详情</text>
								</button>
								<button class="menu-item delete-item" @click.stop="deleteQuestion(item.id)">
									<text class="menu-icon">🗑️</text>
									<text class="menu-text">删除</text>
								</button>
							</view>
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
	{ id: 1, name: '张三', avatar: 'https://via.placeholder.com/50', paperName: '张三的关系试卷', createTime: '2024-01-28 10:00' },
	{ id: 2, name: '李四', avatar: 'https://via.placeholder.com/50', paperName: '李四的关系试卷', createTime: '2024-01-27 15:30' },
	{ id: 3, name: '王五', avatar: 'https://via.placeholder.com/50', paperName: '王五的关系试卷', createTime: '2024-01-26 09:15' },
	{ id: 4, name: '赵六', avatar: 'https://via.placeholder.com/50', paperName: '赵六的关系试卷', createTime: '2024-01-25 14:45' }
]);

// 操作菜单状态
const openMenuId = ref(null);

// 跳转到答题记录页
const goToRecord = (questionId) => {
	uni.navigateTo({
		url: `/pages/question-record/question-record?id=${questionId}`
	});
};

// 切换操作菜单
const toggleActionMenu = (questionId) => {
	if (openMenuId.value === questionId) {
		openMenuId.value = null;
	} else {
		openMenuId.value = questionId;
	}
};

// 分享试卷
const shareQuestion = (questionId) => {
	uni.showToast({
		title: '分享功能开发中',
		icon: 'none'
	});
};

// 删除试卷
const deleteQuestion = (questionId) => {
	uni.showModal({
		title: '确认删除',
		content: '确定要删除这份试卷吗？',
		confirmText: '删除',
		cancelText: '取消',
		confirmColor: '#ff4d4f',
		success: (res) => {
			if (res.confirm) {
				// 模拟删除操作
				const index = questions.value.findIndex(item => item.id === questionId);
				if (index !== -1) {
					questions.value.splice(index, 1);
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				}
			}
		}
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
	margin: 0 12rpx 16rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
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
	color: #1890ff;
	cursor: pointer;
	text-decoration: underline;
	transition: color 0.3s ease;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 120rpx;
}

.paper-name:hover {
	color: #40a9ff;
}

.create-time {
	font-size: 24rpx;
	color: #666;
}

/* 操作菜单样式 */
.action-menu {
	position: relative;
	z-index: 9999;
}

.action-menu-button {
	padding: 8rpx 16rpx;
	border: none;
	background: transparent;
	font-size: 32rpx;
	color: #666;
	transition: all 0.3s ease;
	border-radius: 8rpx;
}

.action-menu-button:hover {
	background-color: #f0f0f0;
	color: #333;
}

.action-menu-dropdown {
	position: absolute;
	right: 0;
	background-color: #fff;
	border-radius: 12rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
	min-width: 200rpx;
	overflow: hidden;
	z-index: 9999;
	transform: translateX(-20rpx);
}

.action-menu-dropdown.dropdown-down {
	top: 100%;
	margin-top: 8rpx;
	animation: dropdownSlideDown 0.2s ease-out;
}

.action-menu-dropdown.dropdown-up {
	bottom: 100%;
	margin-bottom: 8rpx;
	box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.15);
	animation: dropdownSlideUp 0.2s ease-out;
}

@keyframes dropdownSlideUp {
	from {
		opacity: 0;
		transform: translateY(8rpx) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

@keyframes dropdownSlideDown {
	from {
		opacity: 0;
		transform: translateY(-8rpx) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 16rpx 24rpx;
	border: none;
	background: transparent;
	width: 100%;
	text-align: left;
	transition: all 0.2s ease;
}

.menu-item:hover {
	background-color: #f8f9fa;
}

.menu-item:active {
	background-color: #e9ecef;
}

.menu-icon {
	font-size: 28rpx;
	margin-right: 16rpx;
}

.menu-text {
	font-size: 24rpx;
	color: #333;
	font-weight: 500;
}

.share-item .menu-text {
	color: #52c41a;
}

.detail-item .menu-text {
	color: #1890ff;
}

.delete-item .menu-text {
	color: #ff4d4f;
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

	.action-menu-button {
		padding: 6rpx 12rpx;
		font-size: 28rpx;
	}

	.action-menu-dropdown {
		min-width: 180rpx;
	}

	.menu-item {
		padding: 12rpx 20rpx;
	}

	.menu-icon {
		font-size: 24rpx;
		margin-right: 12rpx;
	}

	.menu-text {
		font-size: 22rpx;
	}
}
</style>
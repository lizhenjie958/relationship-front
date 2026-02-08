<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="header-title">权益获得记录</text>
			<text class="header-desc">查看您的会员权益获取历史</text>
		</view>

		<!-- 记录列表 -->
		<view class="records-list" v-if="records.length > 0">
			<view v-for="(record, index) in records" :key="index" class="record-item">
				<view class="record-header">
					<view class="record-type" :class="getTypeClass(record.type)">
						<text class="type-text">{{ getTypeText(record.type) }}</text>
					</view>
					<text class="record-time">{{ record.createTime }}</text>
				</view>
				<view class="record-content">
					<text class="record-title">{{ record.title }}</text>
					<text class="record-desc">{{ record.description }}</text>
				</view>
				<view class="record-footer">
					<text class="record-status" :class="getStatusClass(record.status)">
						{{ getStatusText(record.status) }}
					</text>
				</view>
			</view>
		</view>

		<!-- 空状态 -->
		<view class="empty-state" v-else>
			<view class="empty-icon">
				<text class="icon-text">📋</text>
			</view>
			<text class="empty-title">暂无记录</text>
			<text class="empty-desc">您还没有权益获取记录</text>
		</view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

// 记录列表
const records = ref([]);

onLoad(() => {
	// 加载权益记录
	loadRecords();
});

// 加载记录数据
const loadRecords = () => {
	// 这里应该从接口获取数据，暂时使用模拟数据
	records.value = [
		{
			type: 'redeem',
			title: '兑换码兑换',
			description: '使用兑换码获得30天会员权益',
			createTime: '2024-01-15 14:30:25',
			status: 'active'
		},
		{
			type: 'share',
			title: '分享奖励',
			description: '成功邀请26位好友，获得永久会员',
			createTime: '2024-01-10 09:15:33',
			status: 'active'
		},
		{
			type: 'activity',
			title: '活动奖励',
			description: '参与新年活动获得7天会员',
			createTime: '2023-12-25 18:20:15',
			status: 'expired'
		}
	];
};

// 获取类型样式
const getTypeClass = (type) => {
	const classMap = {
		'redeem': 'type-redeem',
		'share': 'type-share',
		'activity': 'type-activity',
		'purchase': 'type-purchase'
	};
	return classMap[type] || 'type-default';
};

// 获取类型文本
const getTypeText = (type) => {
	const textMap = {
		'redeem': '兑换',
		'share': '分享',
		'activity': '活动',
		'purchase': '购买'
	};
	return textMap[type] || '其他';
};

// 获取状态样式
const getStatusClass = (status) => {
	const classMap = {
		'active': 'status-active',
		'expired': 'status-expired',
		'pending': 'status-pending'
	};
	return classMap[status] || 'status-default';
};

// 获取状态文本
const getStatusText = (status) => {
	const textMap = {
		'active': '生效中',
		'expired': '已过期',
		'pending': '待生效'
	};
	return textMap[status] || '未知';
};
</script>

<style scoped>
.container {
	padding: 30rpx;
	background-color: #f5f7fa;
	min-height: 100vh;
}

/* 页面标题 */
.page-header {
	margin-bottom: 30rpx;
}

.header-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.header-desc {
	font-size: 26rpx;
	color: #666;
	display: block;
}

/* 记录列表 */
.records-list {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.record-item {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 28rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.record-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.record-type {
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
}

.type-redeem {
	background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
}

.type-share {
	background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.type-activity {
	background: linear-gradient(135deg, #faad14 0%, #ffd666 100%);
}

.type-purchase {
	background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
}

.type-default {
	background: linear-gradient(135deg, #999 0%, #bbb 100%);
}

.type-text {
	font-size: 22rpx;
	color: #ffffff;
	font-weight: 500;
}

.record-time {
	font-size: 24rpx;
	color: #999;
}

.record-content {
	margin-bottom: 16rpx;
}

.record-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
	display: block;
	margin-bottom: 8rpx;
}

.record-desc {
	font-size: 26rpx;
	color: #666;
	display: block;
}

.record-footer {
	display: flex;
	justify-content: flex-end;
}

.record-status {
	padding: 6rpx 16rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	font-weight: 500;
}

.status-active {
	background-color: #f6ffed;
	color: #52c41a;
}

.status-expired {
	background-color: #fff2f0;
	color: #ff4d4f;
}

.status-pending {
	background-color: #fff7e6;
	color: #faad14;
}

.status-default {
	background-color: #f5f5f5;
	color: #999;
}

/* 空状态 */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}

.empty-icon {
	width: 160rpx;
	height: 160rpx;
	background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 30rpx;
}

.empty-icon .icon-text {
	font-size: 80rpx;
}

.empty-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 12rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #999;
}
</style>

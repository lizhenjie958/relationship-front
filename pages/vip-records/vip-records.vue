<template>
	<view class="container">
		<!-- 页面标题 -->
		<view class="page-header">
			<text class="header-title">权益获得记录</text>
			<text class="header-desc">查看您的会员权益获取历史</text>
		</view>

		<!-- 记录列表 -->
		<view class="records-list" v-if="records.length > 0">
			<view v-for="(record, index) in records" :key="record.accessReceipt || index" class="record-item">
				<view class="record-header">
					<view class="record-type" :class="getTypeClass(record)">
						<text class="type-text">{{ getTypeText(record) }}</text>
					</view>
					<text class="record-time">{{ record.createTime }}</text>
				</view>
				<view class="record-content">
					<text class="record-title">{{ getRecordTitle(record) }}</text>
					<text class="record-desc">{{ getRecordDesc(record) }}</text>
				</view>
				<view class="record-footer">
					<text class="record-status" :class="getStatusClass(record)">
						{{ getStatusText(record) }}
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
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { queryAccessRecordList } from '@/api/memberApi.js';

// 记录列表
const records = ref([]);

onLoad(() => {
	// 加载权益记录
	loadRecords();
});

// 页面下拉刷新
onPullDownRefresh(async () => {
	console.log('权益记录页面下拉刷新');
	// 重新获取权益记录
	await loadRecords();
	// 停止下拉刷新
	uni.stopPullDownRefresh();
});

// 加载记录数据
const loadRecords = async () => {
	try {
		uni.showLoading({ title: '加载中...' });
		const response = await queryAccessRecordList({});
		
		if (response.code === 200 && response.data) {
			const list = response.data.list || [];
			// 转换接口数据为页面需要的格式
			records.value = list.map(item => ({
				accessChannelCode: item.accessChannelCode,
				accessReceipt: item.accessReceipt,
				accessUnitType: item.accessUnitType,
				accessValue: item.accessValue,
				createTime: formatDateTime(item.createTime)
			}));
		} else {
			uni.showToast({
				title: response.msg || '获取记录失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('获取会员记录失败:', error);
		uni.showToast({
			title: '获取记录失败',
			icon: 'none'
		});
	} finally {
		uni.hideLoading();
	}
};

// 格式化日期时间
const formatDateTime = (dateTimeStr) => {
	if (!dateTimeStr) return '';
	const date = new Date(dateTimeStr);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	const seconds = String(date.getSeconds()).padStart(2, '0');
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取渠道映射
const getChannelInfo = (channelCode) => {
	const channelMap = {
		'c8z85k': { type: 'share', name: '邀请好友', desc: '邀请好友注册' },
		'jm6nm2': { type: 'activity', name: '累计签到', desc: '累计答题签到' },
		'e6hn9u': { type: 'redeem', name: '兑换码', desc: '兑换码兑换' }
	};
	return channelMap[channelCode] || { type: 'default', name: '其他', desc: '其他方式' };
};

// 获取单位文本
const getUnitText = (unitType) => {
	const unitMap = {
		1: '天',
		2: '月',
		3: '年'
	};
	return unitMap[unitType] || '天';
};

// 获取类型样式
const getTypeClass = (record) => {
	const channelInfo = getChannelInfo(record.accessChannelCode);
	const classMap = {
		'redeem': 'type-redeem',
		'share': 'type-share',
		'activity': 'type-activity',
		'purchase': 'type-purchase'
	};
	return classMap[channelInfo.type] || 'type-default';
};

// 获取类型文本
const getTypeText = (record) => {
	const channelInfo = getChannelInfo(record.accessChannelCode);
	return channelInfo.name;
};

// 获取标题
const getRecordTitle = (record) => {
	const channelInfo = getChannelInfo(record.accessChannelCode);
	return channelInfo.desc;
};

// 获取描述
const getRecordDesc = (record) => {
	const unit = getUnitText(record.accessUnitType);
	return `获得 ${record.accessValue}${unit}会员权益`;
};

// 获取状态样式（根据记录时间判断，这里简化处理为永久生效）
const getStatusClass = (record) => {
	return 'status-active';
};

// 获取状态文本
const getStatusText = (record) => {
	return '已到账';
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

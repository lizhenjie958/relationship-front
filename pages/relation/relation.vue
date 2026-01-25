<template>
	<view class="relation">
		<view class="relationTable">
			<view v-if="loading" class="loading">
				<uni-loading type="circle" text="加载中..."></uni-loading>
			</view>
			<view v-else>
				<!-- 表头 -->
				<view class="table-header">
					<view class="table-cell name-cell">主角</view>
					<view class="table-cell avatar-cell">头像</view>
					<view class="table-cell action-cell">设置</view>
				</view>
				
				<!-- 数据列表 -->
				<view v-if="protagonData.protagonList.length > 0" class="table-body">
					<view v-for="item in protagonData.protagonList" :key="item.id" class="table-row">
						<view class="table-cell name-cell">
							<view class="name">{{ item.name }}</view>
						</view>
						<view class="table-cell avatar-cell">
							<image v-if="item.smallPicUrl" :src="item.smallPicUrl" class="image" />
							<view v-else class="no-avatar">
								<text>无头像</text>
							</view>
						</view>
						<view class="table-cell action-cell">
							<view class="uni-group">
								<button class="uni-button" size="mini" type="primary">修改</button>
								<button class="uni-button" size="mini" type="warn">删除</button>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 空状态 -->
				<view v-else class="empty-state">
					<text>暂无更多数据</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
	import { onReachBottom } from '@dcloudio/uni-app';
	import { queryProtagonistPage } from "@/api/relationApi.js";
	
	// 数据状态
	const protagonData = ref({
		protagonList: [],
		total : 0
	})
	const reqParam ={pageNo:1,pageSize:15};
	const loading = ref(false);
	
	
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
	
	const selectionChange = (e) => {
		console.log('选择变化:', e);
	};
	
	// 页面挂载时获取数据
	onMounted(() => {
		queryPage();
	});
</script>

<style lang="scss" scoped>
	.relation {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
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
		white-space: nowrap;
	}
	
	.name-cell {
		width: 120rpx;
	}
	
	.avatar-cell {
		width: 100rpx;
	}
	
	.action-cell {
		width: 300rpx;
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
	
	/* 操作按钮组 */
	.uni-group {
		display: flex;
		gap: 16rpx;
		justify-content: center;
		align-items: center;
	}
	
	/* 按钮样式优化 */
	.uni-button {
		padding: 8rpx 24rpx;
		border-radius: 20rpx;
		font-size: 28rpx;
		font-weight: 500;
		transition: all 0.2s ease;
	}
	
	.uni-button[type="primary"] {
		background-color: #409eff;
		border-color: #409eff;
	}
	
	.uni-button[type="primary"]:hover {
		background-color: #66b1ff;
		border-color: #66b1ff;
	}
	
	.uni-button[type="warn"] {
		background-color: #f56c6c;
		border-color: #f56c6c;
	}
	
	.uni-button[type="warn"]:hover {
		background-color: #f78989;
		border-color: #f78989;
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
</style>
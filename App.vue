<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	/* 每个页面公共css */
	@import '@/styles/theme.scss';

	/* 全局基础样式重置 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
		font-size: $font-md;
		color: $text-primary;
		/* 浅蓝色系渐变背景 - 与项目主色调协调 */
		background: linear-gradient(180deg, #EDF4FC 0%, #F5F9FD 30%, #FAFCFE 60%, #FFFFFF 100%);
		background-attachment: fixed;
		line-height: 1.5;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		min-height: 100vh;
	}

	/* 统一按钮样式 */
	button {
		margin: 0;
		padding: 0;
		background: none;
		border: none;
		font-size: inherit;
		line-height: inherit;
		
		&::after {
			display: none;
		}
	}

	/* 统一输入框样式 */
	input, textarea {
		font-family: inherit;
	}

	/* 图片默认样式 */
	image {
		display: block;
		max-width: 100%;
	}

	/* 滚动条样式优化 */
	::-webkit-scrollbar {
		width: 0;
		height: 0;
		background: transparent;
	}

	/* 安全区域适配 */
	.safe-area-bottom {
		padding-bottom: constant(safe-area-inset-bottom);
		padding-bottom: env(safe-area-inset-bottom);
	}

	/* 全局页面容器样式 - 透明背景以显示渐变 */
	.container,
	.user-container,
	.question-record,
	.vip-container,
	.redeem-container,
	.benefits-container,
	.records-container,
	.relationship-container,
	.share-record-container {
		background: transparent !important;
	}

	/* 卡片统一样式 - 半透明白色背景 */
	.card,
	.user-card,
	.function-list,
	.today-stats-container,
	.creator-stats-container,
	.challenge-container,
	.info-card,
	.question-card,
	.redeem-section,
	.tips-section,
	.benefits-card,
	.record-item,
	.relationship-card,
	.paper-info,
	.loading-container,
	.error-container {
		background: rgba(255, 255, 255, 0.9) !important;
		backdrop-filter: blur(20rpx);
		border: 1rpx solid rgba(255, 255, 255, 0.7);
		box-shadow: 0 8rpx 32rpx rgba(74, 144, 226, 0.1);
	}

	/* VIP卡片特殊样式 - 保持渐变但降低饱和度 */
	.vip-card,
	.activity-container {
		backdrop-filter: blur(20rpx);
	}

	/* 统计卡片背景优化 */
	.stat-card {
		background: rgba(255, 255, 255, 0.7) !important;
		backdrop-filter: blur(10rpx);
		border: 1rpx solid rgba(255, 255, 255, 0.5);
	}

	/* 输入框背景优化 */
	input, .redeem-input, .edit-input {
		background: rgba(255, 255, 255, 0.9) !important;
	}
</style>

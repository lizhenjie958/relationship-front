<template>
	<button 
		class="floating-add-button" 
		@click="handleClick"
		@touchstart="startDrag"
		@touchmove="onDrag"
		@touchend="endDrag"
		@mousedown="startDrag"
		@mousemove="onDrag"
		@mouseup="endDrag"
		@mouseleave="endDrag"
		:style="buttonStyle"
	>
		<text class="floating-button-icon">+</text>
		<text class="floating-button-text">{{ buttonText }}</text>
	</button>
</template>

<script setup>
	import { ref, reactive, computed } from 'vue';

	// 组件属性
	const props = defineProps({
		buttonText: {
			type: String,
			default: '新增关系'
		}
	});

	// 组件事件
	const emit = defineEmits(['click']);

	// 浮动按钮拖拽状态
	const isDragging = ref(false);
	const startX = ref(0);
	const startY = ref(0);
	const buttonPosition = reactive({
		bottom: '40rpx',
		right: '40rpx'
	});

	// 计算按钮样式
	const buttonStyle = computed(() => {
		return {
			bottom: buttonPosition.bottom,
			right: buttonPosition.right
		};
	});

	// 处理按钮点击
	const handleClick = () => {
		emit('click');
	};

	// 开始拖拽
	const startDrag = (event) => {
		isDragging.value = true;
		const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
		const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
		startX.value = clientX;
		startY.value = clientY;
	};

	// 拖拽中
	const onDrag = (event) => {
		if (!isDragging.value) return;
		
		// 阻止默认行为，避免页面滚动
		event.preventDefault();
		
		const clientX = event.type.includes('mouse') ? event.clientX : event.touches[0].clientX;
		const clientY = event.type.includes('mouse') ? event.clientY : event.touches[0].clientY;
		
		// 计算移动距离
		const deltaX = clientX - startX.value;
		const deltaY = clientY - startY.value;
		
		// 转换为rpx单位（假设1px = 2rpx）
		const deltaXRpx = deltaX * 2;
		const deltaYRpx = deltaY * 2;
		
		// 更新按钮位置
		// 注意：这里需要处理边界情况，确保按钮不会超出屏幕
		const currentRight = parseInt(buttonPosition.right) - deltaXRpx;
		const currentBottom = parseInt(buttonPosition.bottom) - deltaYRpx;
		
		// 简单的边界检查（确保按钮在屏幕内）
		if (currentRight > 20 && currentRight < 1000 && currentBottom > 20 && currentBottom < 1500) {
			buttonPosition.right = `${currentRight}rpx`;
			buttonPosition.bottom = `${currentBottom}rpx`;
		}
		
		// 更新起始位置
		startX.value = clientX;
		startY.value = clientY;
	};

	// 结束拖拽
	const endDrag = () => {
		isDragging.value = false;
	};
</script>

<style lang="scss" scoped>
	/* 浮动新增按钮样式 */
	.floating-add-button {
		position: fixed;
		bottom: 40rpx;
		right: 40rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 14rpx 24rpx;
		background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
		color: #fff;
		border: none;
		border-radius: 28rpx;
		font-size: 24rpx;
		font-weight: 500;
		box-shadow: 0 4rpx 16rpx rgba(24, 144, 255, 0.25);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 1000;
		backdrop-filter: blur(8rpx);
	}

	.floating-add-button:hover {
		transform: translateY(-2rpx) scale(1.02);
		box-shadow: 0 6rpx 20rpx rgba(24, 144, 255, 0.35);
	}

	.floating-add-button:active {
		transform: translateY(-1rpx) scale(0.98);
	}

	.floating-button-icon {
		font-size: 28rpx;
		font-weight: 300;
		line-height: 1;
	}

	.floating-button-text {
		line-height: 1;
	}
</style>
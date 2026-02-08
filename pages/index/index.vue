<template>
	<view class="container">
		<!-- 页面头部 - 包含标题和日期选择 -->
		<view class="page-header">
			<view class="header-title-section">
				<text class="page-main-title">数据统计</text>
				<text class="page-sub-title">查看每日答题和出题情况</text>
			</view>
			<view class="header-date-section">
				<picker mode="date" :value="selectedDate" :end="todayDate" @change="onDateChange">
					<view class="date-picker-btn">
						<view class="calendar-icon">
							<text class="calendar-icon-text">📅</text>
						</view>
						<view class="date-info">
							<text class="date-label">统计日期</text>
							<text class="date-value">{{ selectedDate }}</text>
						</view>
						<view class="date-arrow">
							<text class="arrow-icon">›</text>
						</view>
					</view>
				</picker>
			</view>
		</view>

		<!-- 今日答题统计 -->
		<view class="today-stats-container">
			<view class="today-stats-header">
				<view class="section-title">
					<view class="title-icon blue">📊</view>
					<text class="today-stats-title">答题统计</text>
				</view>
			</view>
			<view class="stats-container">
				<view class="stat-card">
					<text class="stat-label">答题</text>
					<text class="stat-value">{{ answerCnt }}次</text>
				</view>
				<view class="stat-card">
					<text class="stat-label">最高得分</text>
					<text class="stat-value">{{ answerMaxScore }}</text>
				</view>
				<view class="stat-card">
					<text class="stat-label">全国排名</text>
					<text class="stat-value">{{ answerMaxScoreRank }}</text>
				</view>
			</view>
		</view>

		<!-- 今日出题统计 -->
		<view class="creator-stats-container">
			<view class="today-stats-header">
				<view class="section-title">
					<view class="title-icon purple">📝</view>
					<text class="today-stats-title">出题统计</text>
				</view>
			</view>
			<view class="stats-container">
				<view class="stat-card">
					<text class="stat-label">作答次数</text>
					<text class="stat-value">{{ examCnt }}次</text>
				</view>
				<view class="stat-card">
					<text class="stat-label">全国排名</text>
					<text class="stat-value">{{ examCntRank }}</text>
				</view>
				<view class="stat-card">
					<text class="stat-label">热门试卷</text>
					<text v-if="hotExamPaperId" class="stat-value hot-exam" @click="navigateToHotExamPaper">查看</text>
					<text v-else class="stat-value">-</text>
				</view>
			</view>
		</view>

		<!-- 连续答题挑战 -->
		<view class="challenge-container">
			<!-- 活动奖励说明 -->
			<view v-if="activityData" class="activity-container">
				<view class="activity-badge">限时活动</view>
				<view class="activity-main">
					<view class="activity-icon-wrap">
						<text class="activity-emoji">🎁</text>
					</view>
					<view class="activity-info">
						<text class="activity-name">答题签到送会员</text>
						<view class="activity-reward">
							<text class="reward-label">完成得</text>
							<text class="reward-highlight">{{ activityData.reward }}{{ getRewardUnitText(activityData.rewardUnitType) }}会员</text>
						</view>
					</view>
				</view>
				<!-- 进度条（已参加时显示） -->
				<view v-if="hasParticipated && participateRecord" class="activity-progress-detail">
					<view class="progress-header">
						<view class="progress-status">
							<text class="status-badge" :class="{ 'completed': participateRecord.participateStatus === 2 }">
								{{ getStatusText(participateRecord.participateStatus) }}
							</text>
							<text v-if="participateRecord.completeTime" class="complete-time">
								完成于 {{ participateRecord.completeTime.split('T')[0] }}
							</text>
						</view>
						<text class="progress-ratio">{{ participateRecord.currentIndicator }}/{{ activityData.threshold }}天</text>
					</view>
					<view class="progress-bar-container">
						<view class="progress-bar-bg">
							<view class="progress-bar-fill" :style="{ width: getProgressPercent() + '%' }"></view>
						</view>
						<text class="progress-percent">{{ getProgressPercent() }}%</text>
					</view>
				</view>

				<!-- 活动信息（未参加或已参加都显示） -->
				<view class="activity-progress">
					<view class="progress-info">
						<view class="progress-item">
							<text class="progress-label">目标</text>
							<text class="progress-value">{{ activityData.threshold }}天</text>
						</view>
						<view class="progress-divider"></view>
						<view class="progress-item">
							<text class="progress-label">时间</text>
							<text class="progress-value">{{ activityData.startDate }} 至 {{ activityData.endDate }}</text>
						</view>
					</view>
				</view>

				<!-- 参加活动按钮（未参加时显示） -->
				<view v-if="!hasParticipated" class="activity-action">
					<button
						class="participate-btn"
						:disabled="participateLoading"
						:class="{ 'loading': participateLoading }"
						@click="handleParticipate"
					>
						<text v-if="participateLoading" class="btn-loading-text">参加中...</text>
						<text v-else class="btn-text">立即参加</text>
					</button>
				</view>
			</view>

			<!-- 日历组件 -->
			<view class="calendar-container">
				<uni-calendar
					:insert="true"
					start-date="2021-01-01"
					end-date="2026-12-31"
					:selected="answeredDates"
					@monthSwitch="onMonthSwitch"
				></uni-calendar>
			</view>
		</view>

		<!-- 快速开始区域 -->
		<view class="share-container">
			<view class="quick-actions">
				<view class="quick-actions-header">
					<view class="section-title">
						<view class="title-icon orange">🚀</view>
						<text class="quick-actions-title">快速开始</text>
					</view>
				</view>
				<view class="quick-actions-grid">
					<view class="quick-action-item" @click="navigateToExamList">
						<view class="quick-action-icon exam-icon">
							<text class="quick-action-emoji">📋</text>
						</view>
						<text class="quick-action-text">开始答题</text>
						<text class="quick-action-desc">挑战今日试题</text>
					</view>
					<view class="quick-action-item relation-item" @click="navigateToRelationManager">
						<view class="quick-action-icon relation-icon">
							<view class="relation-graphic">
								<view class="relation-node node-left"></view>
								<view class="relation-line"></view>
								<view class="relation-node node-right"></view>
							</view>
						</view>
						<text class="quick-action-text">创建关系</text>
						<text class="quick-action-desc">创建人物关系</text>
					</view>
					<view class="quick-action-item" @click="navigateToHistory">
						<view class="quick-action-icon history-icon">
							<text class="quick-action-emoji">📚</text>
						</view>
						<text class="quick-action-text">答题记录</text>
						<text class="quick-action-desc">查看历史成绩</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue';
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app';
import { queryTargetPath } from '@/api/shareApi.js';
import { request } from '@/utils/request.js';
import { queryCheckinCalendar, queryDataByDay } from '@/api/answerStatisticsApi.js';
import { queryLatestAnswering } from '@/api/answerPaperApi.js';
import { loginByWechat, isLoggedIn, getCurrentUser } from '@/utils/auth.js';
import { maintainInviter } from '@/api/userApi.js';
import { queryCurrentActivity, participateActivity, queryParticipateRecord } from '@/api/activityApi.js';

	// 今日日期
	const todayDate = ref('');
	// 已答题日期（正确格式）
	const answeredDates = ref([]);
	// 最近进行中的答题记录
	const latestAnswering = ref(null);
	// 主角名称提示框显示状态（保留，可能其他地方需要）
	const showTooltip = ref(false);
	// 下拉刷新状态
	const refresherTriggered = ref(false);
	
	// 今日答题统计数据
	const answerCnt = ref(0);
	const answerMaxScore = ref(0);
	const answerMaxScoreRank = ref(0);
	const examCnt = ref(0);
	const examCntRank = ref(0);
	const hotExamPaperId = ref(null);
	
	// 日期选择
	const selectedDate = ref('');
	// 邀请人ID
	const inviterId = ref('');
	// 邀请码（从分享链接获取）
	const inviteCodeFromShare = ref('');
	// 活动数据
	const activityData = ref(null);
	// 活动ID
	const activityId = ref(null);
	// 是否已参加活动
	const hasParticipated = ref(false);
	// 参加活动加载状态
	const participateLoading = ref(false);
	// 参加记录数据
	const participateRecord = ref(null);

	// 格式化日期
	const formatDate = (date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	// 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
	const formatDateTime = (date) => {
		if (!date) return '';
		// 如果传入的是字符串，先转换为 Date 对象
		const dateObj = typeof date === 'string' ? new Date(date) : date;
		// 检查是否为有效日期
		if (isNaN(dateObj.getTime())) return '';
		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0');
		const day = String(dateObj.getDate()).padStart(2, '0');
		const hours = String(dateObj.getHours()).padStart(2, '0');
		const minutes = String(dateObj.getMinutes()).padStart(2, '0');
		const seconds = String(dateObj.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	};

	// 获取签到日历数据
	const fetchCheckinCalendar = async (dateStr) => {
		try {
			// 使用传入的日期或今日日期，格式化为 YYYY-MM-01
			const targetDate = dateStr ? new Date(dateStr) : new Date();
			const year = targetDate.getFullYear();
			const month = String(targetDate.getMonth() + 1).padStart(2, '0');
			const checkinMonth = `${year}-${month}-01`;
			
			const response = await queryCheckinCalendar({
				checkinMonth: checkinMonth
			});
			
			if (response.code === 200 && response.data) {
				// 将接口返回的日期列表转换为日历组件需要的格式
				// checkinDateList 是已答题的日期数组
				const checkinDateList = response.data.checkinDateList || [];
				answeredDates.value = checkinDateList.map(date => ({
					date: date,
					info: '已答题'
				}));
			}
		} catch (error) {
			console.error('获取签到日历数据失败:', error);
		}
	};

	// 处理日历月份切换
	const onMonthSwitch = (e) => {
		const { year, month } = e;
		// 获取当前年月
		const now = new Date();
		const currentYear = now.getFullYear();
		const currentMonth = now.getMonth() + 1;
		
		// 判断切换到的月份是否是本月之后的月份
		if (year > currentYear || (year === currentYear && month > currentMonth)) {
			// 本月之后的月份，清空签到数据
			answeredDates.value = [];
		} else {
			// 本月或之前的月份，调用接口获取签到数据
			const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
			fetchCheckinCalendar(dateStr);
		}
	};

	// 获取最近进行中的答题记录
	const fetchLatestAnswering = async () => {
		try {
			const response = await queryLatestAnswering({});
			
			if (response.code === 200 && response.data) {
				latestAnswering.value = response.data;
				// 发现有未完成的答题，弹窗提示
				showContinueAnswerDialog(response.data);
			}
		} catch (error) {
			console.error('获取最近进行中的答题记录失败:', error);
		}
	};

	// 显示继续答题弹窗
	const showContinueAnswerDialog = (answeringData) => {
		uni.showModal({
			title: '未完成的答题',
			content: `您有一份 "${answeringData.examPaperName}" 试卷尚未完成，是否继续答题？`,
			confirmText: '继续答题',
			cancelText: '稍后再说',
			success: (res) => {
				if (res.confirm) {
					// 用户点击继续答题，跳转到答题页面
					continueAnswer(answeringData.id);
				}
				// 用户点击取消或稍后再说，关闭弹窗，不做任何操作
			}
		});
	};

	// 获取答题统计数据
	const fetchTodayStatistics = async (dateStr) => {
		try {
			// 使用传入的日期或今日日期
			const targetDate = dateStr ? new Date(dateStr) : new Date();
			targetDate.setHours(0, 0, 0, 0);
			const statisticsDate = formatDate(targetDate);
						
			const response = await queryDataByDay({
				statisticsDate: statisticsDate
			});
						
			if (response.code === 200 && response.data) {
				const data = response.data;
				console.log('统计数据:', data);
				answerCnt.value = data.answerCnt ?? 0;
				answerMaxScore.value = data.answerMaxScore ?? 0;
				answerMaxScoreRank.value = data.answerMaxScoreRank ?? 0;
				examCnt.value = data.examCnt ?? 0;
				examCntRank.value = data.examCntRank ?? 0;
				hotExamPaperId.value = data.hotExamPaperId ?? null;
			} else {
				// 接口返回成功但没有数据，重置统计值
				console.log('接口返回无数据，重置统计值');
				answerCnt.value = 0;
				answerMaxScore.value = 0;
				answerMaxScoreRank.value = 0;
				examCnt.value = 0;
				examCntRank.value = 0;
				hotExamPaperId.value = null;
			}
		} catch (error) {
			console.error('获取答题统计数据失败:', error);
		}
	};

	// 日期切换
	const onDateChange = (e) => {
		selectedDate.value = e.detail.value;
		// 重新获取统计数据
		fetchTodayStatistics(selectedDate.value);
	};

	// 获取当前活动
	const fetchCurrentActivity = async () => {
		try {
			const response = await queryCurrentActivity({
				channelCode: 'jm6nm2'
			});
			console.log('活动数据:', response);
			if (response.code === 200 && response.data) {
				activityData.value = response.data;
				activityId.value = response.data.id;
				// 获取到活动ID后，查询参加记录
				await fetchParticipateRecord();
			}
		} catch (error) {
			console.error('获取活动数据失败:', error);
		}
	};

	// 获取参加记录
	const fetchParticipateRecord = async () => {
		if (!activityId.value) return;
		try {
			const response = await queryParticipateRecord({
				activityId: activityId.value
			});
			console.log('参加记录:', response);
			if (response.code === 200 && response.data) {
				participateRecord.value = response.data;
				// 有参加记录则表示已参加
				hasParticipated.value = true;
			} else {
				// 没有参加记录
				participateRecord.value = null;
				hasParticipated.value = false;
			}
		} catch (error) {
			console.error('获取参加记录失败:', error);
			participateRecord.value = null;
			hasParticipated.value = false;
		}
	};

	// 获取状态文本
	const getStatusText = (status) => {
		const statusMap = {
			1: '进行中',
			2: '已完成'
		};
		return statusMap[status] || '未知';
	};

	// 计算进度百分比
	const getProgressPercent = () => {
		if (!activityData.value || !participateRecord.value) return 0;
		const threshold = activityData.value.threshold || 1;
		const current = participateRecord.value.currentIndicator || 0;
		return Math.min(Math.round((current / threshold) * 100), 100);
	};

	// 参加活动
	const handleParticipate = async () => {
		if (!activityId.value) {
			uni.showToast({
				title: '活动信息获取失败',
				icon: 'none'
			});
			return;
		}

		participateLoading.value = true;
		try {
			const response = await participateActivity({
				activityId: activityId.value
			});
			console.log('参加活动结果:', response);
			if (response.code === 200) {
				uni.showToast({
					title: '参加成功',
					icon: 'success'
				});
				// 参加成功后重新获取参加记录
				await fetchParticipateRecord();
			} else {
				uni.showToast({
					title: response.msg || '参加失败',
					icon: 'none'
				});
			}
		} catch (error) {
			console.error('参加活动失败:', error);
			uni.showToast({
				title: '参加失败，请重试',
				icon: 'none'
			});
		} finally {
			participateLoading.value = false;
		}
	};

	// 获取奖励单位文本
	const getRewardUnitText = (unitType) => {
		const unitMap = {
			1: '天',
			2: '月',
			3: '年'
		};
		return unitMap[unitType] || '天';
	};

	// 跳转到热门试卷
	const navigateToHotExamPaper = () => {
		if (hotExamPaperId.value) {
			uni.navigateTo({
				url: `/pages/exam-paper-detail/exam-paper-detail?id=${hotExamPaperId.value}`
			});
		} else {
			uni.showToast({
				title: '暂无热门试卷',
				icon: 'none'
			});
		}
	};

	// 处理分享code，获取跳转路径
	const handleShareCode = async (shareCode) => {
		// 验证shareCode是否为32位字符串
		if (shareCode && /^[a-zA-Z0-9]{32}$/.test(shareCode)) {
			try {
				// 调用查询目标路径接口
				const response = await queryTargetPath({
					shareCode: shareCode
				});
				
				if (response.code === 200 && response.data) {
					// 根据返回路径跳转
					uni.navigateTo({
						url: response.data
					});
				}
			} catch (error) {
				console.error('调用查询目标路径接口失败:', error);
			}
		}
	};

	// 切换主角名称提示框（保留，可能其他地方需要）
	const toggleTooltip = () => {
		showTooltip.value = !showTooltip.value;
	};

	// 页面加载时获取URL参数
	onLoad((options) => {
		// 解析URL参数中的shareCode
		if (options.shareCode) {
			handleShareCode(options.shareCode);
		}
		// 解析邀请人ID（兼容旧版本）
		if (options.inviterId) {
			inviterId.value = options.inviterId;
			console.log('收到邀请人ID:', inviterId.value);
		}
		// 解析邀请码（新版本使用inviteCode）
		if (options.inviteCode) {
			// 校验邀请码长度必须为8位
			if (options.inviteCode.length === 8) {
				inviteCodeFromShare.value = options.inviteCode;
				console.log('收到邀请码:', inviteCodeFromShare.value);
				// 保存到本地存储，登录后使用
				uni.setStorageSync('pending_invite_code', options.inviteCode);
			} else {
				console.log('邀请码格式错误，必须为8位字符:', options.inviteCode);
			}
		}
		// 检查登录状态，未登录则自动登录（携带邀请人ID）
		checkAndLogin();
	});

	// 检查登录状态并执行登录
	const checkAndLogin = async () => {
		// 如果已登录，检查是否需要绑定邀请码
		if (isLoggedIn()) {
			console.log('用户已登录');
			await checkAndBindInviteCode();
			return;
		}
		// 未登录，执行微信登录
		try {
			console.log('用户未登录，开始自动登录');
			// 优先使用inviteCodeFromShare，兼容旧版本inviterId
			const shareInviteCode = inviteCodeFromShare.value || inviterId.value;
			await loginByWechat(shareInviteCode);
			console.log('自动登录成功');
			// 登录成功后检查是否需要绑定邀请码
			await checkAndBindInviteCode();
			// 登录成功后刷新页面数据
			fetchCheckinCalendar();
			fetchLatestAnswering();
			fetchTodayStatistics();
		} catch (error) {
			console.error('自动登录失败:', error);
			uni.showToast({
				title: '登录失败，请重试',
				icon: 'none'
			});
		}
	};

	// 检查并绑定邀请码
	const checkAndBindInviteCode = async () => {
		try {
			// 获取待处理的邀请码
			const pendingInviteCode = uni.getStorageSync('pending_invite_code');
			if (!pendingInviteCode) {
				return;
			}

			// 校验邀请码长度必须为8位
			if (pendingInviteCode.length !== 8) {
				console.log('邀请码格式错误，清除待处理邀请码:', pendingInviteCode);
				uni.removeStorageSync('pending_invite_code');
				return;
			}

			// 获取当前用户信息
			const userInfo = await getCurrentUser();
			console.log('当前用户信息:', userInfo);

			// 如果用户已经有邀请人，清除待处理邀请码并返回
			if (userInfo.inviterId > 0) {
				console.log('用户已绑定邀请人，清除待处理邀请码');
				uni.removeStorageSync('pending_invite_code');
				return;
			}

			// 检查是否是自己的邀请码
			if (pendingInviteCode === userInfo.inviteCode) {
				console.log('不能绑定自己的邀请码');
				uni.removeStorageSync('pending_invite_code');
				return;
			}

			// 提示用户是否绑定邀请码
			uni.showModal({
				title: '绑定邀请码',
				content: `检测到邀请码：${pendingInviteCode}，是否立即绑定？\n（邀请码只能绑定一次）`,
				confirmText: '立即绑定',
				cancelText: '暂不绑定',
				confirmColor: '#1890ff',
				success: async (res) => {
					if (res.confirm) {
						// 用户确认绑定，跳转到用户页面并自动填写
						uni.navigateTo({
							url: `/pages/user/user?autoFillInviteCode=${pendingInviteCode}`
						});
					} else {
						// 用户取消，保留邀请码，下次再提示
						console.log('用户暂不绑定邀请码');
					}
				}
			});
		} catch (error) {
			console.error('检查邀请码绑定失败:', error);
		}
	};

	// 页面加载时初始化
	onMounted(() => {
		// 设置今日日期
		const today = new Date();
		todayDate.value = formatDate(today);
		// 初始化选中的日期为今日
		selectedDate.value = formatDate(today);
		// 获取活动数据
		fetchCurrentActivity();
		// 如果已登录，直接加载数据；未登录则在登录成功后加载
		if (isLoggedIn()) {
			// 获取签到日历数据
			fetchCheckinCalendar();
			// 获取最近进行中的答题记录
			fetchLatestAnswering();
			// 获取今日答题统计数据
			fetchTodayStatistics();
		}
	});

	// 继续答题
	const continueAnswer = (recordId) => {
		uni.navigateTo({
			url: `/pages/answer-paper-detail/answer-paper-detail?id=${recordId}`
		});
	};

	// 跳转到试卷列表
	const navigateToExamList = () => {
		uni.navigateTo({
			url: '/pages/exam-paper-list/exam-paper-list'
		});
	};

	// 跳转到关系管理页
	const navigateToRelationManager = () => {
		uni.navigateTo({
			url: '/pages/relationship-manager/relationship-manager'
		});
	};

	// 跳转到答题记录
	const navigateToHistory = () => {
		uni.navigateTo({
			url: '/pages/answer-paper-list/answer-paper-list'
		});
	};

	// 页面下拉刷新
	onPullDownRefresh(async () => {
		console.log('首页下拉刷新');
		await fetchTodayStatistics();
		await fetchCheckinCalendar();
		await fetchLatestAnswering();
		await fetchCurrentActivity();
		uni.stopPullDownRefresh();
	});
</script>

<style scoped>
	.container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	/* 今日答题统计容器 */
	.today-stats-container {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	/* 装饰元素 */
	.today-stats-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, #1890ff, #69c0ff);
		border-radius: 16rpx 16rpx 0 0;
	}

	/* 今日答题统计标题 */
	.today-stats-header {
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.today-stats-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		position: relative;
		padding-left: 16rpx;
	}

	.today-stats-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 24rpx;
		background-color: #1890ff;
		border-radius: 3rpx;
	}

	/* 日期显示 */
	.today-date {
		font-size: 20rpx;
		color: #999999;
	}

	/* 顶部统计卡片 */
	.stats-container {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0;
		gap: 16rpx;
	}

	.stat-card {
		flex: 1;
		border-radius: 12rpx;
		padding: 20rpx;
		margin: 0 10rpx;
		text-align: center;
		background-color: #fafafa;
		border: 2rpx solid #f0f0f0;
	}

	.stat-card:hover {
		background-color: #f0f7ff;
		border-color: #d6e4ff;
		transition: all 0.3s ease;
	}

	.stat-label {
		display: block;
		font-size: 24rpx;
		color: #666666;
		margin-bottom: 8rpx;
	}

	.stat-value {
		display: block;
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	/* 热门试卷可点击样式 */
	.hot-exam {
		color: #1890ff;
		cursor: pointer;
	}

	/* 页面头部样式 */
	.page-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 20rpx;
		padding: 32rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.header-title-section {
		flex: 1;
	}

	.page-main-title {
		display: block;
		font-size: 40rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 8rpx;
	}

	.page-sub-title {
		display: block;
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	/* 日期选择按钮样式 */
	.date-picker-btn {
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10rpx);
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		display: flex;
		align-items: center;
		gap: 16rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		transition: all 0.3s ease;
	}

	.date-picker-btn:active {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(0.98);
	}

	.calendar-icon {
		width: 48rpx;
		height: 48rpx;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.calendar-icon-text {
		font-size: 28rpx;
	}

	.date-info {
		display: flex;
		flex-direction: column;
	}

	.date-label {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 4rpx;
	}

	.date-value {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 600;
	}

	.date-arrow {
		margin-left: 8rpx;
	}

	.arrow-icon {
		font-size: 32rpx;
		color: rgba(255, 255, 255, 0.8);
	}

	/* 区块标题样式 */
	.section-title {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.title-icon {
		width: 48rpx;
		height: 48rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.title-icon.blue {
		background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
	}

	.title-icon.purple {
	background: linear-gradient(135deg, #722ed1 0%, #eb2f96 100%);
}

.title-icon.orange {
	background: linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%);
}

	/* 出题者视角统计容器 */
	.creator-stats-container {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	/* 装饰元素 - 出题者视角使用不同的颜色 */
	.creator-stats-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, #722ed1, #eb2f96);
		border-radius: 16rpx 16rpx 0 0;
	}

	/* 连续答题挑战容器 */
	.challenge-container {
		background-color: #ffffff;
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		position: relative;
		overflow: hidden;
	}

	/* 装饰元素 */
	.challenge-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 6rpx;
		background: linear-gradient(90deg, #52c41a, #95de64);
		border-radius: 16rpx 16rpx 0 0;
	}

	/* 活动容器 */
	.activity-container {
		background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
		border-radius: 20rpx;
		padding: 28rpx;
		margin-bottom: 24rpx;
		box-shadow: 0 8rpx 24rpx rgba(24, 144, 255, 0.25);
		position: relative;
		overflow: hidden;
	}

	/* 装饰背景 */
	.activity-container::before {
		content: '';
		position: absolute;
		top: -50%;
		right: -20%;
		width: 200rpx;
		height: 200rpx;
		background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
		border-radius: 50%;
	}

	.activity-badge {
		position: absolute;
		top: 16rpx;
		right: 16rpx;
		background: rgba(255, 255, 255, 0.9);
		color: #1890ff;
		font-size: 20rpx;
		font-weight: 600;
		padding: 6rpx 14rpx;
		border-radius: 20rpx;
	}

	.activity-main {
		display: flex;
		align-items: center;
		gap: 20rpx;
		margin-bottom: 20rpx;
	}

	.activity-icon-wrap {
		width: 88rpx;
		height: 88rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(10rpx);
	}

	.activity-emoji {
		font-size: 44rpx;
	}

	.activity-info {
		flex: 1;
	}

	.activity-name {
		font-size: 30rpx;
		font-weight: 700;
		color: #ffffff;
		display: block;
		margin-bottom: 8rpx;
	}

	.activity-reward {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-top: 4rpx;
	}

	.reward-label {
		font-size: 22rpx;
		color: rgba(255, 255, 255, 0.9);
		background: rgba(255, 255, 255, 0.2);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
	}

	.reward-highlight {
		font-size: 36rpx;
		font-weight: 800;
		color: #fff566;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.activity-progress {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 16rpx;
		padding: 20rpx 24rpx;
		backdrop-filter: blur(10rpx);
	}

	.progress-info {
		display: flex;
		align-items: center;
		gap: 24rpx;
	}

	.progress-item {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.progress-label {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.progress-value {
		font-size: 26rpx;
		color: #ffffff;
		font-weight: 600;
	}

	.progress-divider {
		width: 2rpx;
		height: 40rpx;
		background: rgba(255, 255, 255, 0.3);
	}

	/* 进度条详情 */
	.activity-progress-detail {
		background: rgba(255, 255, 255, 0.15);
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		backdrop-filter: blur(10rpx);
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.progress-status {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.status-badge {
		font-size: 20rpx;
		color: #ffffff;
		background: rgba(24, 144, 255, 0.8);
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		font-weight: 500;
	}

	.status-badge.completed {
		background: rgba(82, 196, 26, 0.8);
	}

	.complete-time {
		font-size: 20rpx;
		color: rgba(255, 255, 255, 0.7);
	}

	.progress-ratio {
		font-size: 24rpx;
		color: #ffffff;
		font-weight: 600;
	}

	.progress-bar-container {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.progress-bar-bg {
		flex: 1;
		height: 16rpx;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 8rpx;
		overflow: hidden;
	}

	.progress-bar-fill {
		height: 100%;
		background: linear-gradient(90deg, #fff566 0%, #ffd700 100%);
		border-radius: 8rpx;
		transition: width 0.5s ease;
	}

	.progress-percent {
		font-size: 24rpx;
		color: #fff566;
		font-weight: 700;
		min-width: 60rpx;
		text-align: right;
	}

	/* 参加活动按钮区域 */
	.activity-action {
		margin-top: 24rpx;
		display: flex;
		justify-content: center;
	}

	.participate-btn {
		width: 100%;
		height: 80rpx;
		background: linear-gradient(135deg, #fff566 0%, #ffd700 100%);
		border-radius: 40rpx;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 16rpx rgba(255, 245, 102, 0.4);
		transition: all 0.3s ease;
	}

	.participate-btn:active:not(.loading) {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(255, 245, 102, 0.3);
	}

	.participate-btn.loading {
		opacity: 0.8;
	}

	.participate-btn .btn-text {
		font-size: 30rpx;
		font-weight: 700;
		color: #333;
	}

	.participate-btn .btn-loading-text {
		font-size: 30rpx;
		font-weight: 600;
		color: #666;
	}

	.participated-status {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 16rpx 32rpx;
		border-radius: 40rpx;
	}

	.participated-status .status-icon {
		font-size: 28rpx;
		color: #52c41a;
		font-weight: 700;
	}

	.participated-status .status-text {
		font-size: 28rpx;
		color: #ffffff;
		font-weight: 600;
	}

	/* 提示信息 */
	.tip-container {
		background-color: #f6ffed;
		border: 2rpx solid #b7eb8f;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.tip-text {
		font-size: 24rpx;
		color: #52c41a;
		text-align: center;
		font-weight: 500;
	}

	/* 日历组件 */
	.calendar-container {
		background-color: transparent;
		border-radius: 12rpx;
		padding: 0;
		margin-bottom: 0;
		box-shadow: none;
	}

	/* 调整uni-calendar组件的样式 */
	.uni-calendar {
		--calendar-border-color: transparent;
	}

	.uni-calendar__header {
		padding-bottom: 16rpx;
	}

	.uni-calendar__body {
		padding-top: 0;
	}

	.uni-calendar__cell {
		height: 60rpx;
		line-height: 60rpx;
	}

	.uni-calendar__cell--current {
		background-color: #1890ff;
		color: #ffffff;
		border-radius: 50%;
	}

	.uni-calendar__cell--selected {
		background-color: #f6ffed;
		color: #52c41a;
		border-radius: 50%;
		position: relative;
	}

	.uni-calendar__cell--selected::after {
		content: '✓';
		position: absolute;
		bottom: 2rpx;
		right: 2rpx;
		font-size: 16rpx;
		font-weight: bold;
		color: #52c41a;
		background-color: #ffffff;
		border-radius: 50%;
		width: 24rpx;
		height: 24rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2rpx solid #52c41a;
	}

	/* 分享记录表格 */
	.share-container {
		background-color: #ffffff;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 100rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	/* 未完成答题提示 */
	.unfinished-tip {
		display: flex;
		align-items: center;
		background-color: #fff7e6;
		border: 2rpx solid #ffd591;
		border-radius: 8rpx;
		padding: 16rpx;
		margin-bottom: 20rpx;
	}

	.tip-icon {
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		background-color: #fa8c16;
		color: #ffffff;
		font-size: 24rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-right: 12rpx;
	}

	.tip-content {
		flex: 1;
	}

	.tip-title {
		font-size: 24rpx;
		font-weight: bold;
		color: #d46b08;
		margin-bottom: 4rpx;
		display: block;
	}

	.tip-desc {
		font-size: 20rpx;
		color: #fa8c16;
		display: block;
	}

	/* 分享记录内容 */
	.share-content {
		border-top: 2rpx solid #f0f0f0;
		padding-top: 20rpx;
	}

	/* 快捷入口区域 */
	.quick-actions {
		padding: 0;
	}

	.quick-actions-header {
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx solid #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.quick-actions-title {
		font-size: 28rpx;
		font-weight: bold;
		color: #333333;
		display: block;
		position: relative;
		padding-left: 16rpx;
	}

	.quick-actions-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 6rpx;
		height: 24rpx;
		background-color: #fa8c16;
		border-radius: 3rpx;
	}

	.quick-actions-grid {
		display: flex;
		justify-content: space-between;
		gap: 20rpx;
	}

	.quick-action-item {
		flex: 1;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		border-radius: 16rpx;
		padding: 28rpx 16rpx;
		text-align: center;
		transition: all 0.3s ease;
		border: 2rpx solid #f0f0f0;
		cursor: pointer;
	}

	.quick-action-item:active {
		transform: scale(0.98);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
	}

	.quick-action-icon {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 auto 16rpx;
	}

	.exam-icon {
		background: linear-gradient(135deg, #1890ff 0%, #69c0ff 100%);
	}

	.relation-icon {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 关系图标图形 */
	.relation-graphic {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8rpx;
	}

	.relation-node {
		width: 20rpx;
		height: 20rpx;
		background: #ffffff;
		border-radius: 50%;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.relation-line {
		width: 24rpx;
		height: 4rpx;
		background: #ffffff;
		border-radius: 2rpx;
		box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	/* 关系管理项特殊样式 */
	.relation-item:active .relation-node {
		transform: scale(1.2);
		transition: transform 0.2s ease;
	}

	.relation-item:active .relation-line {
		width: 28rpx;
		transition: width 0.2s ease;
	}

	.history-icon {
		background: linear-gradient(135deg, #722ed1 0%, #b37feb 100%);
	}

	.quick-action-emoji {
		font-size: 40rpx;
	}

	.quick-action-text {
		display: block;
		font-size: 28rpx;
		font-weight: 600;
		color: #333333;
		margin-bottom: 8rpx;
	}

	.quick-action-desc {
		display: block;
		font-size: 22rpx;
		color: #999999;
	}

	.share-header {
		display: flex;
		border-bottom: 2rpx solid #f0f0f0;
		padding-bottom: 16rpx;
		margin-bottom: 16rpx;
	}

	.share-col {
		flex: 1;
		font-size: 24rpx;
		color: #666666;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 0 8rpx;
		box-sizing: border-box;
	}

	.share-row {
		display: flex;
		align-items: center;
		padding: 16rpx 0;
	}

	.continue-btn {
		background-color: #1890ff;
		color: #ffffff;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		font-size: 24rpx;
		font-weight: bold;
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.continue-btn:hover {
		background-color: #40a9ff;
	}

	/* 主角信息样式 */
	.protagonist-info {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 主角头像样式 */
	.protagonist-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		border: 2rpx solid #f0f0f0;
		transition: all 0.3s ease;
		cursor: pointer;
		transform: translateY(0) scale(1);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.protagonist-avatar:hover {
		transform: translateY(-4rpx) scale(2);
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.2);
	}

	/* 主角信息样式 - 调整位置防止头像放大时遮挡其他内容 */
	.protagonist-info {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx;
	}

	/* 点击行效果 */
	.share-row {
		cursor: pointer;
		transition: background-color 0.3s ease;
	}

	.share-row:active {
		background-color: #f0f7ff;
	}

	/* 底部导航栏 */
	.tab-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: #ffffff;
		display: flex;
		justify-content: space-around;
		padding: 16rpx 0;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 40rpx;
	}

	.tab-item.active .tab-text {
		color: #1890ff;
	}

	.tab-icon {
		font-size: 36rpx;
		margin-bottom: 8rpx;
	}

	.tab-text {
		font-size: 24rpx;
		color: #666666;
	}
</style>

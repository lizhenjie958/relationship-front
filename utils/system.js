const systemInfo = uni.getSystemInfoSync();

export const getStatusBarHeight = ()=> systemInfo?.statusBarHeight ? systemInfo.statusBarHeight : 0
export const getTitleBarHeight = ()=>{
	if(uni.getMenuButtonBoundingClientRect){
		const menuButton = uni.getMenuButtonBoundingClientRect();
		const heightVal =  menuButton.height ? menuButton.height : 0;
		const topVal = menuButton.top ? menuButton.top : 0;
		const statusBarHight = getStatusBarHeight()
		return heightVal + (topVal - statusBarHight) * 2;
	}else{
		return 40;
	}
}
export const getNavBarHeight = ()=> getStatusBarHeight() + getTitleBarHeight();

	

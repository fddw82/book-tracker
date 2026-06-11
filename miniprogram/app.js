// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'YOUR_ENV_ID',  // 请替换为你的云环境 ID
        traceUser: true,
      });
    }

    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    this.globalData.statusBarHeight = systemInfo.statusBarHeight;
    this.globalData.navBarHeight = systemInfo.platform === 'android'
      ? 48 : 44;
  },

  globalData: {
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 0,
  },
});

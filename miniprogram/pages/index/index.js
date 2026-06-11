// pages/index/index.js
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    filters: [
      { label: '全部', value: 'all', count: 0 },
      { label: '想读', value: 'wish', count: 0 },
      { label: '在读', value: 'reading', count: 0 },
      { label: '已读', value: 'read', count: 0 },
    ],
    currentFilter: 'all',
    books: [],
    loading: false,
  },

  onLoad() {
    // 先测试云开发是否正常
    wx.cloud.callFunction({
      name: 'parseDoubanBook',
      data: { url: 'https://book.douban.com/subject/37077202/' },
      success: (res) => {
        console.log('云函数测试成功:', res);
        wx.showToast({ title: '云开发连接正常', icon: 'success' });
        this.loadBooks();
      },
      fail: (err) => {
        console.error('云函数测试失败:', err);
        wx.showToast({ title: '云开发连接失败: ' + err.errMsg, icon: 'none', duration: 5000 });
        // 即使失败也尝试加载
        this.loadBooks();
      },
    });
  },

  onShow() {
    // 每次显示页面时刷新数据（从添加页返回时）
    this.loadBooks();
  },

  onPullDownRefresh() {
    this.loadBooks().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 加载图书列表
   */
  async loadBooks() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const { currentFilter } = this.data;

      // 构建查询条件
      const where = {};
      if (currentFilter !== 'all') {
        where.status = currentFilter;
      }

      // 查询当前筛选的图书（先不加排序，避免索引问题）
      const res = await db.collection('books')
        .where(where)
        .get();

      this.setData({ books: res.data });

      // 统计各状态数量
      await this.loadCounts();
    } catch (err) {
      console.error('加载图书失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载各状态数量统计（前端统计，避免 count() 超时）
   */
  loadCounts() {
    const { books } = this.data;
    const counts = { wish: 0, reading: 0, read: 0 };

    books.forEach(book => {
      if (counts[book.status] !== undefined) {
        counts[book.status]++;
      }
    });

    const total = books.length;

    const filters = this.data.filters.map(f => ({
      ...f,
      count: f.value === 'all' ? total : (counts[f.value] || 0),
    }));

    this.setData({ filters });
  },

  /**
   * 切换筛选
   */
  onFilterTap(e) {
    const { value } = e.currentTarget.dataset;
    if (value === this.data.currentFilter) return;

    this.setData({ currentFilter: value });
    this.loadBooks();
  },

  /**
   * 点击图书卡片 → 跳转详情页
   */
  onBookTap(e) {
    const { book } = e.detail;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${book._id}`,
    });
  },

  /**
   * 点击浮动按钮 → 跳转添加页
   */
  onAddTap() {
    wx.switchTab({
      url: '/pages/add/add',
    });
  },
});

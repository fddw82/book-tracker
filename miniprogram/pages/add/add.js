// pages/add/add.js
const { isDoubanBookUrl } = require('../../utils/util');
const db = wx.cloud.database();

Page({
  data: {
    inputUrl: '',
    parsing: false,
    saving: false,
    errorMsg: '',
    bookData: {},
    selectedStatus: 'wish',
    statusOptions: [
      { value: 'wish', label: '想读', icon: '📌' },
      { value: 'reading', label: '在读', icon: '📖' },
      { value: 'read', label: '已读', icon: '✅' },
    ],
  },

  onUrlInput(e) {
    this.setData({
      inputUrl: e.detail.value,
      errorMsg: '',
      bookData: {},
    });
  },

  onClearTap() {
    this.setData({
      inputUrl: '',
      errorMsg: '',
      bookData: {},
    });
  },

  /**
   * 解析豆瓣链接
   */
  async onParseTap() {
    const { inputUrl } = this.data;

    if (!inputUrl.trim()) {
      this.setData({ errorMsg: '请输入豆瓣图书链接' });
      return;
    }

    if (!isDoubanBookUrl(inputUrl)) {
      this.setData({ errorMsg: '请输入有效的豆瓣图书链接' });
      return;
    }

    this.setData({ parsing: true, errorMsg: '', bookData: {} });

    try {
      const res = await wx.cloud.callFunction({
        name: 'parseDoubanBook',
        data: { url: inputUrl.trim() },
      });

      if (res.result.success) {
        this.setData({ bookData: res.result.data });
      } else {
        this.setData({ errorMsg: res.result.error || '解析失败' });
      }
    } catch (err) {
      console.error('云函数调用失败:', err);
      this.setData({ errorMsg: '网络错误，请稍后重试' });
    } finally {
      this.setData({ parsing: false });
    }
  },

  /**
   * 选择阅读状态
   */
  onStatusTap(e) {
    this.setData({ selectedStatus: e.currentTarget.dataset.status });
  },

  /**
   * 确认添加
   */
  async onConfirmTap() {
    const { bookData, selectedStatus } = this.data;

    if (!bookData.title) {
      wx.showToast({ title: '请先解析图书', icon: 'none' });
      return;
    }

    // 检查是否已添加
    try {
      const existing = await db.collection('books')
        .where({ doubanId: bookData.doubanId })
        .count();

      if (existing.total > 0) {
        wx.showToast({ title: '这本书已经在你的书架上了', icon: 'none' });
        return;
      }
    } catch (err) {
      console.error('检查重复失败:', err);
    }

    this.setData({ saving: true });

    try {
      const now = new Date();

      await db.collection('books').add({
        data: {
          title: bookData.title || '',
          subtitle: bookData.subtitle || '',
          author: bookData.author || '',
          isbn: bookData.isbn || '',
          publisher: bookData.publisher || '',
          pubDate: bookData.pubDate || '',
          pages: bookData.pages || 0,
          price: bookData.price || '',
          cover: bookData.cover || '',
          summary: bookData.summary || '',
          rating: bookData.rating || 0,
          ratingCount: bookData.ratingCount || 0,
          doubanUrl: bookData.doubanUrl || '',
          doubanId: bookData.doubanId || '',
          status: selectedStatus,
          tags: [],
          rating_user: 0,
          comment: '',
          createdAt: now,
          updatedAt: now,
          readDate: selectedStatus === 'read' ? now : null,
        },
      });

      wx.showToast({
        title: '添加成功！',
        icon: 'success',
        duration: 1500,
      });

      // 清空表单
      setTimeout(() => {
        this.setData({
          inputUrl: '',
          bookData: {},
          errorMsg: '',
          selectedStatus: 'wish',
        });
      }, 1500);
    } catch (err) {
      console.error('添加图书失败:', err);
      wx.showToast({ title: '添加失败，请重试', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});

// pages/detail/detail.js
const { STATUS_MAP } = require('../../utils/util');
const db = wx.cloud.database();

Page({
  data: {
    bookId: '',
    book: null,
    statusLabel: '',
    statusClass: '',
    commentLength: 0,
    statusOptions: [
      { value: 'wish', label: '想读', icon: '📌' },
      { value: 'reading', label: '在读', icon: '📖' },
      { value: 'read', label: '已读', icon: '✅' },
    ],
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ bookId: options.id });
      this.loadBook(options.id);
    }
  },

  /**
   * 加载图书详情
   */
  async loadBook(id) {
    try {
      const res = await db.collection('books').doc(id).get();
      const book = res.data;

      const status = STATUS_MAP[book.status] || {};

      this.setData({
        book,
        statusLabel: status.label || '',
        statusClass: status.color || '',
        commentLength: (book.comment || '').length,
      });
    } catch (err) {
      console.error('加载图书详情失败:', err);
      wx.showToast({ title: '加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  /**
   * 修改阅读状态
   */
  async onStatusChange(e) {
    const newStatus = e.currentTarget.dataset.status;
    const { book } = this.data;

    if (newStatus === book.status) return;

    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date(),
      };

      // 如果标记为已读，记录读完日期
      if (newStatus === 'read' && !book.readDate) {
        updateData.readDate = new Date();
      }

      // 如果从已读改为其他，清除读完日期
      if (book.status === 'read' && newStatus !== 'read') {
        updateData.readDate = null;
      }

      await db.collection('books').doc(book._id).update({ data: updateData });

      const status = STATUS_MAP[newStatus] || {};
      this.setData({
        'book.status': newStatus,
        'book.updatedAt': updateData.updatedAt,
        'book.readDate': updateData.readDate !== undefined ? updateData.readDate : book.readDate,
        statusLabel: status.label || '',
        statusClass: status.color || '',
      });

      wx.showToast({ title: '状态已更新', icon: 'success' });
    } catch (err) {
      console.error('更新状态失败:', err);
      wx.showToast({ title: '更新失败', icon: 'none' });
    }
  },

  /**
   * 评分
   */
  async onRatingTap(e) {
    const rating = e.currentTarget.dataset.rating;
    const { book } = this.data;

    // 如果点击相同分数，取消评分
    const newRating = book.rating_user === rating ? 0 : rating;

    try {
      await db.collection('books').doc(book._id).update({
        data: {
          rating_user: newRating,
          updatedAt: new Date(),
        },
      });

      this.setData({ 'book.rating_user': newRating });
    } catch (err) {
      console.error('评分失败:', err);
      wx.showToast({ title: '评分失败', icon: 'none' });
    }
  },

  /**
   * 短评输入
   */
  async onCommentBlur(e) {
    const comment = e.detail.value;
    const { book } = this.data;

    if (comment === book.comment) return;

    try {
      await db.collection('books').doc(book._id).update({
        data: {
          comment,
          updatedAt: new Date(),
        },
      });

      this.setData({
        'book.comment': comment,
        commentLength: comment.length,
      });
    } catch (err) {
      console.error('保存短评失败:', err);
    }
  },

  /**
   * 打开豆瓣链接
   */
  onOpenDouban() {
    const { book } = this.data;
    if (book.doubanUrl) {
      wx.setClipboardData({
        data: book.doubanUrl,
        success: () => {
          wx.showToast({ title: '链接已复制', icon: 'success' });
        },
      });
    }
  },

  /**
   * 删除图书
   */
  onDeleteTap() {
    wx.showModal({
      title: '确认删除',
      content: `确定要从书架中删除《${this.data.book.title}》吗？`,
      confirmColor: '#e74c3c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await db.collection('books').doc(this.data.book._id).remove();
            wx.showToast({ title: '已删除', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (err) {
            console.error('删除失败:', err);
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  },
});

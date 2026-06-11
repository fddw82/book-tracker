// pages/profile/profile.js
const db = wx.cloud.database();
const _ = db.command;

Page({
  data: {
    avatarUrl: '',
    nickname: '',
    stats: {
      total: 0,
      wish: 0,
      reading: 0,
      read: 0,
    },
    ratingDist: [],
    avgRating: 0,
  },

  onShow() {
    this.loadUserInfo();
    this.loadStats();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    const avatarUrl = wx.getStorageSync('avatarUrl') || '';
    const nickname = wx.getStorageSync('nickname') || '';
    this.setData({ avatarUrl, nickname });
  },

  /**
   * 加载阅读统计（前端统计，避免 count() 超时）
   */
  async loadStats() {
    try {
      // 一次性获取所有书籍，前端统计
      const res = await db.collection('books').get();
      const books = res.data || [];

      const stats = { total: books.length, wish: 0, reading: 0, read: 0 };
      books.forEach(book => {
        if (stats[book.status] !== undefined) {
          stats[book.status]++;
        }
      });

      this.setData({ stats });

      // 已读评分分布
      if (stats.read > 0) {
        this.calcRatingDist(books);
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  /**
   * 计算已读书籍评分分布（前端计算）
   */
  calcRatingDist(books) {
    const readBooks = books.filter(b => b.status === 'read' && b.rating_user > 0);

    const dist = [0, 0, 0, 0, 0]; // 1-5星
    let totalRating = 0;

    readBooks.forEach(book => {
      if (book.rating_user >= 1 && book.rating_user <= 5) {
        dist[book.rating_user - 1]++;
        totalRating += book.rating_user;
      }
    });

    const maxCount = Math.max(...dist, 1);
    const ratingDist = [5, 4, 3, 2, 1].map(star => {
      const count = dist[star - 1];
      return {
        star,
        count,
        percent: Math.round((count / maxCount) * 100),
      };
    });

    const avgRating = readBooks.length > 0
      ? (totalRating / readBooks.length).toFixed(1)
      : 0;

    this.setData({ ratingDist, avgRating });
  },

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    wx.setStorageSync('avatarUrl', avatarUrl);
    this.setData({ avatarUrl });
  },

  /**
   * 昵称输入
   */
  onNicknameBlur(e) {
    const nickname = e.detail.value;
    wx.setStorageSync('nickname', nickname);
    this.setData({ nickname });
  },
});

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
   * 加载阅读统计
   */
  async loadStats() {
    try {
      const stats = { total: 0, wish: 0, reading: 0, read: 0 };

      // 总数
      const totalRes = await db.collection('books').count();
      stats.total = totalRes.total;

      // 各状态统计
      const statuses = ['wish', 'reading', 'read'];
      for (const s of statuses) {
        const res = await db.collection('books').where({ status: s }).count();
        stats[s] = res.total;
      }

      this.setData({ stats });

      // 已读评分分布
      if (stats.read > 0) {
        await this.loadRatingDist();
      }
    } catch (err) {
      console.error('加载统计失败:', err);
    }
  },

  /**
   * 加载已读书籍评分分布
   */
  async loadRatingDist() {
    try {
      // 读取所有已读且已评分的书籍
      const res = await db.collection('books')
        .where({
          status: 'read',
          rating_user: _.gt(0),
        })
        .field({ rating_user: true })
        .get();

      const dist = [0, 0, 0, 0, 0]; // 1-5星
      let totalRating = 0;
      let ratedCount = 0;

      res.data.forEach(book => {
        if (book.rating_user >= 1 && book.rating_user <= 5) {
          dist[book.rating_user - 1]++;
          totalRating += book.rating_user;
          ratedCount++;
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

      const avgRating = ratedCount > 0
        ? (totalRating / ratedCount).toFixed(1)
        : 0;

      this.setData({ ratingDist, avgRating });
    } catch (err) {
      console.error('加载评分分布失败:', err);
    }
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

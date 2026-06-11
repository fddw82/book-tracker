/**
 * 工具函数
 */

/**
 * 格式化日期
 * @param {Date|string} date
 * @param {string} format - 'YYYY-MM-DD' | 'YYYY-MM' | etc
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day);
}

/**
 * 提取豆瓣 subject ID
 * 支持格式:
 * - https://book.douban.com/subject/37077202/
 * - https://www.douban.com/doubanapp/dispatch/book/37077202
 * @param {string} url
 * @returns {string|null}
 */
function extractDoubanId(url) {
  // 匹配 /subject/123456 或 /book/123456
  const match = url.match(/(?:subject|book)\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * 验证是否为豆瓣图书链接
 * @param {string} url
 * @returns {boolean}
 */
function isDoubanBookUrl(url) {
  return /douban\.com\/.+\/(?:subject|book)\/\d+/.test(url);
}

/**
 * 状态映射
 */
const STATUS_MAP = {
  wish: { label: '想读', color: 'tag-wish' },
  reading: { label: '在读', color: 'tag-reading' },
  read: { label: '已读', color: 'tag-read' },
};

module.exports = {
  formatDate,
  extractDoubanId,
  isDoubanBookUrl,
  STATUS_MAP,
};

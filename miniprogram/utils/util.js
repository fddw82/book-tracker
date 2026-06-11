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
 * @param {string} url
 * @returns {string|null}
 */
function extractDoubanId(url) {
  const match = url.match(/subject\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * 验证是否为豆瓣图书链接
 * @param {string} url
 * @returns {boolean}
 */
function isDoubanBookUrl(url) {
  return /douban\.com\/.+\/subject\/\d+/.test(url);
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

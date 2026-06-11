// 云函数入口文件
const cloud = require('wx-server-sdk');
const https = require('https');
const http = require('http');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

/**
 * 解析豆瓣图书页面，提取书籍信息
 * 通过解析页面 OG Meta 标签、JSON-LD 和 HTML 结构获取数据
 */
exports.main = async (event, context) => {
  const { url } = event;

  if (!url) {
    return { success: false, error: '请提供豆瓣图书链接' };
  }

  // 提取豆瓣 ID
  const idMatch = url.match(/subject\/(\d+)/);
  if (!idMatch) {
    return { success: false, error: '无法识别的豆瓣链接格式' };
  }

  const doubanId = idMatch[1];
  const bookUrl = `https://book.douban.com/subject/${doubanId}/`;

  try {
    // 抓取豆瓣页面
    const html = await fetchPage(bookUrl);

    // 解析提取数据
    const bookData = parseBookPage(html, doubanId, bookUrl);

    return {
      success: true,
      data: bookData,
    };
  } catch (error) {
    console.error('解析豆瓣页面失败:', error);
    return {
      success: false,
      error: error.message || '解析失败，请检查链接是否正确',
    };
  }
};

/**
 * 抓取网页 HTML
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      timeout: 10000,
    };

    const req = protocol.get(url, options, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchPage(res.headers.location).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: 请求失败`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (err) => {
      reject(new Error(`网络请求失败: ${err.message}`));
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

/**
 * 解析豆瓣图书页面
 */
function parseBookPage(html, doubanId, bookUrl) {
  const book = {
    doubanId,
    doubanUrl: bookUrl,
  };

  // 1. 解析 OG Meta 标签
  book.title = extractMeta(html, 'og:title');
  book.coverLarge = extractMeta(html, 'og:image');
  book.author = extractMeta(html, 'book:author');
  book.isbn = extractMeta(html, 'book:isbn');
  book.summary = extractMeta(html, 'og:description');

  // 2. 解析 JSON-LD 结构化数据
  const jsonLd = extractJsonLd(html);
  if (jsonLd) {
    if (jsonLd.name && !book.title) book.title = jsonLd.name;
    if (jsonLd.isbn && !book.isbn) book.isbn = jsonLd.isbn;
    if (jsonLd.author && !book.author) {
      if (Array.isArray(jsonLd.author)) {
        book.author = jsonLd.author.map(a => a.name).filter(Boolean).join('、');
      } else if (jsonLd.author.name) {
        book.author = jsonLd.author.name;
      }
    }
  }

  // 3. 从 HTML 结构解析更多字段
  const infoText = extractInfoText(html);

  // 解析出版社、出版日期、页数、定价
  if (infoText) {
    const pubMatch = infoText.match(/出版社:\s*(.+?)(?:\n|$)/);
    if (pubMatch) book.publisher = pubMatch[1].trim();

    const subMatch = infoText.match(/副标题:\s*(.+?)(?:\n|$)/);
    if (subMatch) book.subtitle = subMatch[1].trim();

    const dateMatch = infoText.match(/出版年:\s*(.+?)(?:\n|$)/);
    if (dateMatch) book.pubDate = dateMatch[1].trim();

    const pagesMatch = infoText.match(/页数:\s*(.+?)(?:\n|$)/);
    if (pagesMatch) book.pages = parseInt(pagesMatch[1]) || pagesMatch[1].trim();

    const priceMatch = infoText.match(/定价:\s*(.+?)(?:\n|$)/);
    if (priceMatch) book.price = priceMatch[1].trim();

    const bindingMatch = infoText.match(/装帧:\s*(.+?)(?:\n|$)/);
    if (bindingMatch) book.binding = bindingMatch[1].trim();
  }

  // 4. 解析评分
  const ratingMatch = html.match(/<strong class="ll rating_num ".*?>([\d.]+)<\/strong>/);
  if (ratingMatch) {
    book.rating = parseFloat(ratingMatch[1]);
  }

  // 评分人数
  const ratingCountMatch = html.match(/<span property="v:votes">(\d+)<\/span>/);
  if (ratingCountMatch) {
    book.ratingCount = parseInt(ratingCountMatch[1]);
  }

  // 5. 清理数据
  if (book.title) {
    // 标题可能包含 "(豆瓣)" 后缀
    book.title = book.title.replace(/\s*\(豆瓣\)$/, '').trim();
  }

  // 生成小封面 URL (s_public -> l_public)
  if (book.coverLarge) {
    book.cover = book.coverLarge;
  }

  return book;
}

/**
 * 从 HTML 中提取 meta 标签内容
 */
function extractMeta(html, property) {
  // 匹配 <meta property="xxx" content="yyy" />
  const regex = new RegExp(
    `<meta\\s+property=["']${escapeRegex(property)}["']\\s+content=["']([^"']*)["']`,
    'i'
  );
  const match = html.match(regex);
  return match ? decodeHtmlEntities(match[1]) : '';
}

/**
 * 提取 JSON-LD 结构化数据
 */
function extractJsonLd(html) {
  const match = html.match(
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch (e) {
    return null;
  }
}

/**
 * 提取图书信息文本块
 * <div id="info"> 中的内容
 */
function extractInfoText(html) {
  const infoMatch = html.match(/<div\s+id=["']info["'][^>]*>([\s\S]*?)<\/div>/);
  if (!infoMatch) return '';

  // 去除 HTML 标签，保留纯文本
  let text = infoMatch[1]
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  return text;
}

/**
 * HTML 实体解码
 */
function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * 转义正则特殊字符
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

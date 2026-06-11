# 📚 我的书架 — 微信小程序

一个基于**原生微信小程序 + 微信云开发**的个人图书管理工具，通过粘贴豆瓣链接自动获取书籍信息，管理你的「想读 / 在读 / 已读」书单。

---

## 🚀 快速开始

### 1. 前提条件

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 已注册微信小程序 AppID
- 已开通微信云开发

### 2. 配置步骤

#### ① 导入项目

用微信开发者工具打开 `/miniprogram` 目录，填入你的 AppID。

#### ② 开通云开发

在微信开发者工具中点击「云开发」→ 开通 → 创建环境。

#### ③ 修改云环境 ID

编辑 `miniprogram/app.js`，将 `YOUR_ENV_ID` 替换为你的云环境 ID：

```javascript
wx.cloud.init({
  env: '你的云环境ID',  // 例如: 'book-tracker-xxx'
  traceUser: true,
});
```

#### ④ 创建数据库集合

在云开发控制台 → 数据库中创建集合：`books`

#### ⑤ 上传云函数

在 `cloudfunctions/parseDoubanBook` 目录上右键 →「上传并部署：云端安装依赖」。

#### ⑥ 添加 Tab 图标

在 `miniprogram/images/` 目录下放入以下图标文件（建议尺寸 81x81 px）：
- `tab-books.png` / `tab-books-active.png` — 书架图标
- `tab-add.png` / `tab-add-active.png` — 添加图标
- `tab-profile.png` / `tab-profile-active.png` — 我的图标
- `default-cover.png` — 默认封面图
- `default-avatar.png` — 默认头像

---

## 📁 项目结构

```
miniprogram/
├── app.js                  # 入口，云开发初始化
├── app.json                # 全局配置 + Tab Bar
├── app.wxss                # 全局样式 + CSS 变量
├── pages/
│   ├── index/              # 书架首页（筛选 + 列表）
│   ├── add/                # 添加图书（豆瓣链接解析）
│   ├── profile/            # 个人中心（阅读统计）
│   └── detail/             # 图书详情（修改状态/评分/删除）
├── components/
│   └── book-card/          # 图书卡片组件
├── utils/
│   └── util.js             # 工具函数
└── images/                 # 图标资源

cloudfunctions/
└── parseDoubanBook/        # 豆瓣页面解析云函数
```

---

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 📎 豆瓣链接解析 | 粘贴任意豆瓣图书链接，自动提取书名、作者、封面、简介等 |
| 📚 三状态书架 | 想读 / 在读 / 已读，一键切换 |
| ⭐ 个人评分 | 1-5 星评分系统 |
| 💬 短评记录 | 每本书可写 350 字以内的短评 |
| 📊 阅读统计 | 藏书总数、分类统计、评分分布图 |
| 🔍 状态筛选 | 按阅读状态筛选图书列表 |

---

## 🔧 豆瓣解析原理

云函数 `parseDoubanBook` 通过以下方式获取图书信息：

1. **OG Meta 标签** — `og:title`, `og:image`, `book:author`, `book:isbn`
2. **JSON-LD 结构化数据** — `@type: Book`
3. **HTML 页面解析** — 出版社、出版日期、页数、定价、评分

> 无需豆瓣 API Key，直接解析公开页面。通过 Googlebot User-Agent 访问。

---

## ⚠️ 注意事项

1. 云函数抓取豆瓣页面需确保网络可达（微信云开发环境通常可以）
2. 首次使用时需在云开发控制台创建 `books` 集合
3. Tab 图标需要自行准备，可使用 [iconfont](https://www.iconfont.cn/) 下载

# 📚 我的书架 — 从零到发布完整教程

> 本教程将带你从「什么都没有」到「小程序在手机上运行」，每一步都有详细说明。

---

## 第一步：注册微信小程序账号

1. 打开 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击右上角 **「立即注册」**
3. 账号类型选择 **「小程序」**
4. 按提示填写邮箱、密码，完成注册
5. 注册完成后，登录小程序后台

### 获取 AppID（后面要用）

登录小程序后台 → 左侧菜单「开发」→「开发管理」→「开发设置」→ 页面顶部能看到 **AppID(小程序ID)**，形如 `wx1234567890abcdef`，**复制保存好**。

---

## 第二步：下载安装微信开发者工具

1. 打开 [微信开发者工具下载页](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 选择你电脑对应的版本（Windows / Mac）下载安装
3. 安装完成后打开，用**微信扫码登录**

---

## 第三步：创建项目

1. 打开微信开发者工具，点击 **「+」** 新建项目
2. 填写：
   - **项目名称**：我的书架
   - **目录**：选择一个空文件夹（比如桌面新建 `book-tracker` 文件夹）
   - **AppID**：填入第一步获取的 AppID
   - **后端服务**：选择 **「微信云开发」**
3. 点击 **「确定」**，等待项目初始化完成

---

## 第四步：导入代码

初始化的项目有一堆模板代码，我们不需要，**全部替换**：

### 4.1 删除模板文件

在左侧文件列表中，删除 `pages/` 下的所有文件夹、`utils/`、`styles/` 等默认文件，只保留 `app.js`、`app.json`、`app.wxss`。

### 4.2 复制我们的代码

把你收到的 `book-tracker` 项目文件夹中的内容复制到项目目录：

**最简单的方式：直接在电脑文件管理器中操作**

1. 在微信开发者工具中，点击菜单栏 **「项目」→「打开所在文件夹」**
2. 这会打开项目在电脑上的实际文件夹
3. 把收到的 `miniprogram/` 文件夹里的**所有内容**，复制粘贴覆盖进去
4. 把 `cloudfunctions/` 文件夹整个复制进去
5. 回到微信开发者工具，它会自动检测到文件变化并刷新

### 最终文件结构应该是这样的：

```
项目根目录/
├── miniprogram/            ← 小程序前端代码
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   ├── images/
│   ├── pages/
│   ├── components/
│   ├── utils/
│   └── sitemap.json
├── cloudfunctions/         ← 云函数
│   └── parseDoubanBook/
│       ├── index.js
│       ├── package.json
│       └── config.json
└── project.config.json     ← 自动生成的项目配置
```

> ⚠️ **重要**：如果复制后文件结构和上面不一致，请手动调整，确保 `miniprogram/` 和 `cloudfunctions/` 都在项目根目录下。

---

## 第五步：开通云开发

1. 在微信开发者工具中，点击工具栏上的 **「云开发」** 按钮（一朵云的图标）
2. 如果是首次使用，会提示你开通，点击 **「开通」**
3. 输入**环境名称**，比如 `book-tracker`
4. 点击确定，等待环境创建完成（大约 1-2 分钟）

### 记住你的云环境 ID

开通完成后，在云开发控制台的 **「设置」→「环境设置」** 中，能看到**环境 ID**，形如 `book-tracker-5g8xxxxx`。**复制保存好**。

---

## 第六步：修改云环境 ID

1. 在微信开发者工具中，打开 `miniprogram/app.js`
2. 找到这一行：

```javascript
env: 'YOUR_ENV_ID',
```

3. 把 `YOUR_ENV_ID` 替换为你的云环境 ID，比如：

```javascript
env: 'book-tracker-5g8xxxxx',
```

4. 按 **Ctrl+S** 保存

---

## 第七步：创建数据库

1. 点击工具栏 **「云开发」**，打开云开发控制台
2. 点击左侧 **「数据库」**
3. 点击 **「+ 创建集合」**
4. 输入集合名称：`books`
5. 点击确定

> 只需要创建这一个集合，字段不需要手动添加，小程序运行时会自动写入。

### 设置权限（重要！）

1. 点击刚创建的 `books` 集合
2. 点击上方的 **「权限设置」**
3. 选择 **「所有用户可读，仅创建者可读写」**（推荐）
4. 点击保存

---

## 第八步：部署云函数

1. 在微信开发者工具左侧文件列表中，找到 `cloudfunctions/parseDoubanBook` 文件夹
2. **右键点击** `parseDoubanBook` 文件夹
3. 选择 **「上传并部署：云端安装依赖」**
4. 等待部署完成（首次可能需要 1-2 分钟，底部会显示进度）
5. 看到 **「上传成功」** 提示即可

> 💡 如果右键菜单没有这个选项，请确认：
> - 你已经开通了云开发（第五步）
> - 当前选择的环境是正确的

---

## 第九步：编译运行

1. 点击工具栏的 **「编译」** 按钮（或按 Ctrl+B）
2. 模拟器中应该会显示小程序界面
3. 如果看到 **「书架」** 页面，说明成功了！🎉

---

## 第十步：测试功能

### 添加一本书试试

1. 点击底部 Tab **「添加」**
2. 在输入框粘贴一个豆瓣链接，比如：
   ```
   https://book.douban.com/subject/37077202/
   ```
3. 点击 **「解析图书信息」**
4. 等待解析完成，应该会看到《九诗心》的完整信息
5. 选择阅读状态（想读/在读/已读）
6. 点击 **「确认添加」**

### 查看书架

1. 切换到底部 Tab **「书架」**
2. 应该能看到刚添加的书
3. 点击图书可以查看详情、修改状态、评分

---

## 第十一步：真机预览

1. 点击工具栏的 **「预览」** 按钮
2. 会生成一个二维码
3. 用**你的微信**扫描这个二维码
4. 就能在手机上体验小程序了！

---

## 第十二步：发布小程序（让其他人也能用）

1. 确保小程序后台已完成以下设置：
   - **小程序信息**：填写名称、图标、类目等
   - **小程序备案**：根据提示完成备案（国内必须）

2. 在微信开发者工具中，点击右上角 **「上传」** 按钮
3. 填写版本号（如 `1.0.0`）和项目备注
4. 点击 **「上传」**

5. 登录 [微信公众平台](https://mp.weixin.qq.com/)
6. 左侧菜单 **「管理」→「版本管理」**
7. 在「开发版本」中能看到刚上传的版本
8. 点击 **「提交审核」**
9. 填写审核信息，提交

10. 审核通过后（通常 1-7 天），点击 **「发布」**
11. 🎉 你的小程序就正式上线了！

---

## ❓ 常见问题

### Q1：编译报错「请使用 2.2.3 或以上的基础库」

修改 `app.js`，把云开发初始化代码改为：

```javascript
if (wx.cloud) {
  wx.cloud.init({
    env: '你的云环境ID',
    traceUser: true,
  });
}
```

### Q2：云函数调用报错

- 检查云函数是否已部署（第八步）
- 检查云环境 ID 是否正确（第六步）
- 在云开发控制台 → 云函数中，确认能看到 `parseDoubanBook`

### Q3：数据库写入报错

- 检查 `books` 集合是否已创建（第七步）
- 检查权限设置是否正确

### Q4：豆瓣链接解析失败

- 云函数需要能访问豆瓣网站
- 确保链接格式正确：`https://book.douban.com/subject/数字ID/`
- 也可以尝试豆瓣 App 分享链接

### Q5：Tab 图标不显示

- 确认 `miniprogram/images/` 目录下有所有图标文件
- 图标文件大小不能超过 40KB
- `app.json` 中 `iconPath` 路径是否正确

### Q6：project.config.json 不存在

这个文件是开发者工具自动生成的。如果缺失，在开发者工具中点击 **「详情」→「本地设置」**，勾选相关选项即可自动生成。

如果还是不行，手动创建 `project.config.json`（放在项目根目录）：

```json
{
  "description": "项目配置文件",
  "packOptions": {
    "ignore": [],
    "include": []
  },
  "setting": {
    "bundle": false,
    "userConfirmedBundleSwitch": false,
    "urlCheck": true,
    "scopeDataCheck": false,
    "coverView": true,
    "es6": true,
    "postcss": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "preloadBackgroundData": false,
    "minified": true,
    "autoAudits": false,
    "newFeature": false,
    "uglifyFileName": false,
    "uploadWithSourceMap": true,
    "useIsolateContext": true,
    "nodeModules": false,
    "enhance": true,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "showShadowRootInWxmlPanel": true,
    "packNpmManually": false,
    "enableEngineNative": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "showES6CompileOption": false,
    "minifyWXML": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "condition": false
  },
  "compileType": "miniprogram",
  "libVersion": "3.3.4",
  "appid": "你的AppID",
  "projectname": "book-tracker",
  "condition": {},
  "cloudfunctionRoot": "cloudfunctions/",
  "miniprogramRoot": "miniprogram/"
}
```

> 把 `appid` 改成你自己的 AppID。

---

## 📞 需要帮助？

如果按照教程操作还是遇到问题，可以：
1. 截图报错信息
2. 告诉我你卡在哪一步
3. 我会帮你具体排查

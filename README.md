# Image Base64 Converter

A lightweight Manifest V3 Chrome extension for converting images and raw Base64 payloads both ways.

This extension intentionally works with raw Base64 payloads only. It strips and omits headers such as `data:image/png;base64,`.

## 功能

- 图片转 Base64：选择或拖入图片，生成不带 `data:image/...;base64,` 头的 Base64 正文。
- 为避免大图导致插件弹窗卡死，界面只展示前一小段真实 Base64 字符，不会在文本框内混入说明文字。
- “CP”“TXT”“IMG” 按钮会使用完整 Base64 正文；在输出框内手动复制也会复制完整正文。
- Base64 转图片：粘贴纯 Base64 正文后，插件会拦截粘贴并只在输入框展示前一小段，完整正文保存在内存中用于预览和下载。
- 较大的 Base64 不会自动预览，避免弹窗卡死；点击 “Preview” 后再渲染图片。
- 如果误粘贴了完整 data URL，插件会自动去掉头部再处理。
- 已配置 16/32/48/128 尺寸插件图标。

## 本地安装

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 开启右上角“开发者模式”。
3. 点击 “加载已解压的扩展程序”。
4. 选择本项目目录。

## 文件结构

- `manifest.json`：Chrome 扩展配置。
- `popup.html`：弹窗页面结构。
- `popup.css`：弹窗样式。
- `popup.js`：图片/Base64 转换逻辑。
- `icons/`：扩展图标。

## License

MIT

# Base64 Universal Decoder

一个轻量的 Manifest V3 Chrome 扩展：保留图片与 Base64 互转能力，并扩展为本地 Base64 万能解码器。

## 功能

- 图片转 Base64：选择或拖入图片，生成不带 `data:image/...;base64,` 头部的纯 Base64。
- 复制与保存：支持复制纯 Base64、复制完整 Data URL、保存 Base64 TXT。
- 图片专项增强：图片 Base64 可一键送到解码器预览，保留完整大 payload，界面只截断展示。
- Base64 万能解码：支持粘贴纯 Base64 或 `data:*/*;base64,...`。
- 自动识别格式：可识别 PNG、JPEG、GIF、WEBP、BMP、ICO、SVG、文本、JSON、HTML、XML、CSV、PDF、ZIP、RAR、7Z、MP3、WAV、OGG、MP4、WEBM。
- 文本预览：文本类内容可直接预览、复制文本、下载原文件。
- 文件下载：无法预览或未知的二进制内容会按识别结果下载，未知类型使用 `.bin`。
- 本地处理：无网络请求，无额外权限。

## 本地安装

1. 打开 Chrome，进入 `chrome://extensions/`。
2. 开启右上角“开发者模式”。
3. 点击“加载已解压的扩展程序”。
4. 选择本项目目录。

## 文件结构

- `manifest.json`：Chrome 扩展配置。
- `popup.html`：弹窗页面结构。
- `popup.css`：弹窗样式。
- `popup.js`：图片编码、Base64 解析、格式识别、预览和下载逻辑。
- `icons/`：扩展图标。

## License

MIT

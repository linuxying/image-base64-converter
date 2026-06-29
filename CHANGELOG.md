# Changelog

## v1.1.0 - 2026-06-29

### 新增

- 将扩展升级为 Base64 万能解码器，支持纯 Base64 和 `data:*/*;base64,...`。
- 自动识别 PNG、JPEG、GIF、WEBP、BMP、ICO、SVG 等图片格式。
- 支持文本、JSON、HTML、XML、CSV 的直接预览、复制和下载。
- 支持识别 PDF、ZIP、RAR、7Z、MP3、WAV、OGG、MP4、WEBM 等文件类型。
- 未知二进制内容可按 `.bin` 下载保存。
- 图片转 Base64 增加完整 Data URL 复制能力。

### 改进

- 重构弹窗界面为“图片转 Base64”和“Base64 万能解码”两个工作区。
- 大体积 Base64 仍保留完整内容，但界面只展示前一段，降低弹窗卡顿风险。
- README 更新为完整中文说明。

## v1.0.0

- 初始版本：支持图片与纯 Base64 双向转换。

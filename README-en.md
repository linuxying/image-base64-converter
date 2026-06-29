# Base64 Universal Decoder

English | [中文](README-zh.md)

Base64 Universal Decoder is a lightweight Chrome extension built with Manifest V3. It keeps the original image-to-Base64 workflow and extends it into a local universal Base64 decoder.

## Features

- Image to Base64: select or drag in an image and generate plain Base64 without the `data:image/...;base64,` prefix.
- Copy and save: copy plain Base64, copy the full Data URL, or save Base64 as a TXT file.
- Image workflow shortcut: send generated image Base64 directly to the decoder preview.
- Universal Base64 decoding: paste plain Base64 or `data:*/*;base64,...` input.
- Automatic format detection: supports PNG, JPEG, GIF, WEBP, BMP, ICO, SVG, text, JSON, HTML, XML, CSV, PDF, ZIP, RAR, 7Z, MP3, WAV, OGG, MP4, and WEBM.
- Text preview: preview text-like content, copy decoded text, or download the original file.
- File download: unsupported or unknown binary data can be downloaded with a detected extension, or `.bin` when unknown.
- Local processing: no network requests and no extra permissions.

## Local Installation

1. Open Chrome and go to `chrome://extensions/`.
2. Enable Developer mode in the top-right corner.
3. Click Load unpacked.
4. Select this project folder.

## Project Structure

- `manifest.json`: Chrome extension configuration.
- `popup.html`: popup page markup.
- `popup.css`: popup styles.
- `popup.js`: image encoding, Base64 parsing, format detection, preview, and download logic.
- `icons/`: extension icons.

## Development

This project does not require a build step. After changing source files, reload the extension from `chrome://extensions/`.

## License

MIT

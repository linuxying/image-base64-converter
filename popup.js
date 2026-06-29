const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const base64Output = document.getElementById("base64Output");
const copyBase64 = document.getElementById("copyBase64");
const copyDataUrl = document.getElementById("copyDataUrl");
const saveBase64 = document.getElementById("saveBase64");
const previewBase64 = document.getElementById("previewBase64");
const imageMeta = document.getElementById("imageMeta");
const base64Size = document.getElementById("base64Size");
const outputNote = document.getElementById("outputNote");
const base64Input = document.getElementById("base64Input");
const inputNote = document.getElementById("inputNote");
const fallbackType = document.getElementById("fallbackType");
const detectedType = document.getElementById("detectedType");
const decodedSize = document.getElementById("decodedSize");
const detectedSource = document.getElementById("detectedSource");
const previewWrap = document.getElementById("previewWrap");
const previewImage = document.getElementById("previewImage");
const textPreview = document.getElementById("textPreview");
const previewEmpty = document.getElementById("previewEmpty");
const decodeInput = document.getElementById("decodeInput");
const copyDecodedText = document.getElementById("copyDecodedText");
const downloadDecoded = document.getElementById("downloadDecoded");
const clearInput = document.getElementById("clearInput");
const statusLine = document.getElementById("status");

const PREVIEW_LIMIT = 12000;
const TEXT_PREVIEW_LIMIT = 8000;
const AUTO_RENDER_LIMIT = 1500000;

let currentObjectUrl = "";
let rawBase64Payload = "";
let rawBase64DataUrl = "";
let rawBase64FileName = "image-base64.txt";
let rawBase64MimeType = "image/png";
let storedInput = null;
let decodedFileName = "base64-decoded.bin";
let decodedText = "";
let previewTimer = 0;

const TYPE_META = {
  "image/png": { label: "PNG 图片", ext: "png", kind: "image" },
  "image/jpeg": { label: "JPEG 图片", ext: "jpg", kind: "image" },
  "image/gif": { label: "GIF 图片", ext: "gif", kind: "image" },
  "image/webp": { label: "WEBP 图片", ext: "webp", kind: "image" },
  "image/bmp": { label: "BMP 图片", ext: "bmp", kind: "image" },
  "image/x-icon": { label: "ICO 图标", ext: "ico", kind: "image" },
  "image/svg+xml": { label: "SVG 图片", ext: "svg", kind: "image-text" },
  "text/plain": { label: "纯文本", ext: "txt", kind: "text" },
  "application/json": { label: "JSON 文本", ext: "json", kind: "text" },
  "text/html": { label: "HTML 文本", ext: "html", kind: "text" },
  "text/css": { label: "CSS 文本", ext: "css", kind: "text" },
  "text/javascript": { label: "JavaScript 文本", ext: "js", kind: "text" },
  "text/csv": { label: "CSV 文本", ext: "csv", kind: "text" },
  "application/xml": { label: "XML 文本", ext: "xml", kind: "text" },
  "application/pdf": { label: "PDF 文档", ext: "pdf", kind: "file" },
  "application/zip": { label: "ZIP 压缩包", ext: "zip", kind: "file" },
  "application/x-rar-compressed": { label: "RAR 压缩包", ext: "rar", kind: "file" },
  "application/x-7z-compressed": { label: "7Z 压缩包", ext: "7z", kind: "file" },
  "audio/mpeg": { label: "MP3 音频", ext: "mp3", kind: "file" },
  "audio/wav": { label: "WAV 音频", ext: "wav", kind: "file" },
  "audio/ogg": { label: "OGG 音频", ext: "ogg", kind: "file" },
  "video/mp4": { label: "MP4 视频", ext: "mp4", kind: "file" },
  "video/webm": { label: "WEBM 视频", ext: "webm", kind: "file" },
  "application/octet-stream": { label: "未知二进制", ext: "bin", kind: "file" }
};

function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("error", isError);
}

function setOutputStatus(message, isError = false) {
  outputNote.textContent = message;
  outputNote.classList.toggle("error", isError);
}

function setInputStatus(message, isError = false) {
  inputNote.textContent = message;
  inputNote.classList.toggle("error", isError);
}

function parseBase64Value(value) {
  const trimmed = value.trim();
  const dataUrlMatch = trimmed.match(/^data:([^;,]+)?([^,]*),(.*)$/s);

  if (dataUrlMatch) {
    const attributes = dataUrlMatch[2] || "";

    return {
      payload: dataUrlMatch[3].replace(/\s+/g, ""),
      mimeType: dataUrlMatch[1] || "",
      declaredMimeType: dataUrlMatch[1] || "",
      source: attributes.includes(";base64") ? "Data URL" : "Data URL"
    };
  }

  return {
    payload: trimmed.replace(/\s+/g, ""),
    mimeType: "",
    declaredMimeType: "",
    source: "纯 Base64"
  };
}

function isValidBase64(payload) {
  if (!payload || payload.length % 4 === 1) {
    return false;
  }

  return /^[A-Za-z0-9+/]*={0,2}$/.test(payload);
}

function decodePayload(payload) {
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function stripDataUrlHeader(value) {
  return parseBase64Value(value).payload;
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${bytes} B`;
}

function renderBase64Preview(payload) {
  if (!payload) {
    base64Output.value = "";
    setOutputStatus("");
    return;
  }

  if (payload.length <= PREVIEW_LIMIT) {
    base64Output.value = payload;
    setOutputStatus("已展示完整纯 Base64。");
    return;
  }

  base64Output.value = payload.slice(0, PREVIEW_LIMIT);
  setOutputStatus(`仅展示前 ${PREVIEW_LIMIT.toLocaleString()} 个字符；复制、保存和预览会使用完整内容。`);
}

function renderInputPreview(payload) {
  if (!payload) {
    base64Input.value = "";
    setInputStatus("");
    return;
  }

  if (payload.length <= PREVIEW_LIMIT) {
    base64Input.value = payload;
    setInputStatus("已展示完整输入内容。");
    return;
  }

  base64Input.value = payload.slice(0, PREVIEW_LIMIT);
  setInputStatus(`仅展示前 ${PREVIEW_LIMIT.toLocaleString()} 个字符；解码和下载会使用完整内容。`);
}

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META["application/octet-stream"];
}

function readAscii(bytes, start, length) {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

function startsWith(bytes, signature) {
  return signature.every((value, index) => bytes[index] === value);
}

function decodeText(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    return "";
  }
}

function looksLikeText(text) {
  if (!text) {
    return false;
  }

  const sample = text.slice(0, 1000);
  const controlMatches = sample.match(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g);
  return !controlMatches || controlMatches.length / sample.length < 0.02;
}

function detectTextType(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    return "text/plain";
  }

  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
    try {
      JSON.parse(trimmed);
      return "application/json";
    } catch (error) {
      return "text/plain";
    }
  }

  if (/^<!doctype html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return "text/html";
  }

  if (/^<\?xml/i.test(trimmed)) {
    return "application/xml";
  }

  if (/^<svg[\s>]/i.test(trimmed)) {
    return "image/svg+xml";
  }

  if (/^[^,\n]+,[^,\n]+/.test(trimmed) && trimmed.includes("\n")) {
    return "text/csv";
  }

  return "text/plain";
}

function detectMimeType(bytes, hintedType, fallbackMimeType, text) {
  if (hintedType) {
    return hintedType;
  }

  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "image/png";
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (readAscii(bytes, 0, 6) === "GIF87a" || readAscii(bytes, 0, 6) === "GIF89a") return "image/gif";
  if (readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WEBP") return "image/webp";
  if (readAscii(bytes, 0, 2) === "BM") return "image/bmp";
  if (startsWith(bytes, [0x00, 0x00, 0x01, 0x00])) return "image/x-icon";
  if (readAscii(bytes, 0, 4) === "%PDF") return "application/pdf";
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) return "application/zip";
  if (startsWith(bytes, [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07])) return "application/x-rar-compressed";
  if (startsWith(bytes, [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])) return "application/x-7z-compressed";
  if (startsWith(bytes, [0x49, 0x44, 0x33]) || startsWith(bytes, [0xff, 0xfb])) return "audio/mpeg";
  if (readAscii(bytes, 0, 4) === "RIFF" && readAscii(bytes, 8, 4) === "WAVE") return "audio/wav";
  if (readAscii(bytes, 0, 4) === "OggS") return "audio/ogg";
  if (readAscii(bytes, 4, 4) === "ftyp") return "video/mp4";
  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm";

  if (looksLikeText(text)) {
    return detectTextType(text);
  }

  return fallbackMimeType || "application/octet-stream";
}

function revokeObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = "";
  }
}

function resetDecodePreview() {
  revokeObjectUrl();
  previewImage.onload = null;
  previewImage.onerror = null;
  previewImage.removeAttribute("src");
  textPreview.textContent = "";
  previewWrap.classList.remove("has-image", "has-text");
}

function downloadBlob(fileName, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(fileName, text) {
  downloadBlob(fileName, new Blob([text], { type: "text/plain;charset=utf-8" }));
}

async function copyText(text, successMessage, fallbackFileName) {
  try {
    await navigator.clipboard.writeText(text);
    return successMessage;
  } catch (error) {
    downloadTextFile(fallbackFileName, text);
    return "剪贴板不可用，已改为下载 TXT。";
  }
}

function setImageButtons(enabled) {
  copyBase64.disabled = !enabled;
  copyDataUrl.disabled = !enabled;
  saveBase64.disabled = !enabled;
  previewBase64.disabled = !enabled;
}

function updateDecodeButtons(hasPayload, canCopyText) {
  decodeInput.disabled = !hasPayload;
  downloadDecoded.disabled = !hasPayload;
  copyDecodedText.disabled = !canCopyText;
}

function renderDecodedResult(result, autoPreview) {
  const meta = getTypeMeta(result.mimeType);
  const blob = new Blob([result.bytes], { type: result.mimeType });

  decodedFileName = `base64-decoded.${meta.ext}`;
  decodedText = meta.kind === "text" || meta.kind === "image-text" ? result.text : "";
  detectedType.textContent = meta.label;
  decodedSize.textContent = formatBytes(result.bytes.length);
  detectedSource.textContent = result.source;
  updateDecodeButtons(true, Boolean(decodedText));
  resetDecodePreview();

  if (!autoPreview && result.payload.length > AUTO_RENDER_LIMIT) {
    previewEmpty.textContent = "内容较大，已完成识别；需要查看请点击“解码”。";
    setStatus(`${meta.label}，${formatBytes(result.bytes.length)}，可直接下载。`);
    return;
  }

  if (meta.kind === "image" || meta.kind === "image-text") {
    currentObjectUrl = URL.createObjectURL(blob);
    setStatus(`${meta.label} 解码成功，正在生成预览。`);
    previewImage.onload = () => {
      previewWrap.classList.add("has-image");
      setStatus(`${meta.label} 预览已生成。`);
    };
    previewImage.onerror = () => {
      previewEmpty.textContent = "图片预览失败，但仍可下载文件。";
      setStatus(`${meta.label} 解码成功，但浏览器无法预览。`, true);
    };
    previewImage.src = currentObjectUrl;
    return;
  }

  if (meta.kind === "text") {
    const preview = result.text.length > TEXT_PREVIEW_LIMIT
      ? `${result.text.slice(0, TEXT_PREVIEW_LIMIT)}\n\n... 已截断，复制或下载可获得完整文本。`
      : result.text;

    textPreview.textContent = preview;
    previewWrap.classList.add("has-text");
    setStatus(`${meta.label} 解码成功。`);
    return;
  }

  previewEmpty.textContent = `${meta.label} 无内置预览，可下载保存。`;
  setStatus(`${meta.label} 解码成功，可下载文件。`);
}

function decodeCurrentInput(autoPreview = true) {
  const input = storedInput || parseBase64Value(base64Input.value);

  if (!input.payload) {
    storedInput = null;
    resetDecodePreview();
    detectedType.textContent = "等待输入";
    decodedSize.textContent = "0 B";
    detectedSource.textContent = "-";
    updateDecodeButtons(false, false);
    setStatus("");
    return null;
  }

  if (!isValidBase64(input.payload.replace(/-/g, "+").replace(/_/g, "/"))) {
    resetDecodePreview();
    updateDecodeButtons(false, false);
    detectedType.textContent = "无效 Base64";
    decodedSize.textContent = "0 B";
    detectedSource.textContent = input.source;
    setStatus("Base64 格式不合法，请检查是否混入了非 Base64 字符。", true);
    return null;
  }

  try {
    const bytes = decodePayload(input.payload);
    const text = decodeText(bytes);
    const fallback = fallbackType.value === "auto" ? "" : fallbackType.value;
    const declaredMimeType = input.declaredMimeType ?? input.mimeType ?? "";
    const mimeType = detectMimeType(bytes, declaredMimeType, fallback, text);
    const result = { ...input, bytes, text, declaredMimeType, mimeType };

    storedInput = result;
    renderDecodedResult(result, autoPreview);
    return result;
  } catch (error) {
    resetDecodePreview();
    updateDecodeButtons(false, false);
    detectedType.textContent = "解码失败";
    decodedSize.textContent = "0 B";
    detectedSource.textContent = input.source;
    setStatus("解码失败，请确认内容是完整 Base64。", true);
    return null;
  }
}

function scheduleDecode() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(() => {
    if (storedInput) {
      return;
    }

    const input = parseBase64Value(base64Input.value);
    if (!input.payload) {
      decodeCurrentInput();
      return;
    }

    if (input.payload.length <= AUTO_RENDER_LIMIT) {
      decodeCurrentInput(true);
      return;
    }

    storedInput = input;
    setInputStatus(`已读取 ${input.payload.length.toLocaleString()} 个字符；内容较大，点击“解码”可预览。`);
    decodeCurrentInput(false);
  }, 180);
}

function handleFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    imageMeta.textContent = "请选择图片文件。";
    setOutputStatus("图片专项区只接收 image/* 文件。", true);
    return;
  }

  rawBase64Payload = "";
  rawBase64DataUrl = "";
  rawBase64MimeType = file.type || "image/png";
  renderBase64Preview("");
  setImageButtons(false);
  imageMeta.textContent = `正在读取 ${file.name}...`;
  base64Size.textContent = "Working";
  rawBase64FileName = `${file.name.replace(/\.[^.]+$/, "") || "image"}-base64.txt`;

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    rawBase64DataUrl = String(reader.result);
    rawBase64Payload = stripDataUrlHeader(rawBase64DataUrl);
    renderBase64Preview(rawBase64Payload);
    base64Size.textContent = `${rawBase64Payload.length.toLocaleString()} chars`;
    imageMeta.textContent = `${file.name} - ${formatBytes(file.size)}`;
    setImageButtons(rawBase64Payload.length > 0);
  });

  reader.addEventListener("error", () => {
    imageMeta.textContent = "图片读取失败。";
    base64Size.textContent = "0 chars";
    setImageButtons(false);
  });

  reader.readAsDataURL(file);
}

imageInput.addEventListener("change", () => {
  handleFile(imageInput.files[0]);
});

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("dragging");
  handleFile(event.dataTransfer.files[0]);
});

copyBase64.addEventListener("click", async () => {
  if (!rawBase64Payload) {
    return;
  }

  imageMeta.textContent = await copyText(rawBase64Payload, "完整纯 Base64 已复制。", rawBase64FileName);
});

copyDataUrl.addEventListener("click", async () => {
  if (!rawBase64DataUrl) {
    return;
  }

  imageMeta.textContent = await copyText(rawBase64DataUrl, "完整 Data URL 已复制。", "image-data-url.txt");
});

base64Output.addEventListener("copy", (event) => {
  if (!rawBase64Payload) {
    return;
  }

  event.preventDefault();
  event.clipboardData.setData("text/plain", rawBase64Payload);
  imageMeta.textContent = "完整纯 Base64 已复制。";
});

base64Input.addEventListener("copy", (event) => {
  if (!storedInput?.payload) {
    return;
  }

  event.preventDefault();
  event.clipboardData.setData("text/plain", storedInput.payload);
  setStatus("完整输入 Base64 已复制。");
});

saveBase64.addEventListener("click", () => {
  if (!rawBase64Payload) {
    return;
  }

  downloadTextFile(rawBase64FileName, rawBase64Payload);
  imageMeta.textContent = "完整纯 Base64 TXT 已保存。";
});

previewBase64.addEventListener("click", () => {
  if (!rawBase64Payload) {
    return;
  }

  const input = {
    payload: rawBase64Payload,
    mimeType: rawBase64MimeType,
    source: "图片转入"
  };

  storedInput = input;
  renderInputPreview(rawBase64Payload);
  decodeCurrentInput(true);
});

base64Input.addEventListener("input", () => {
  storedInput = null;
  setInputStatus("");
  scheduleDecode();
});

base64Input.addEventListener("paste", (event) => {
  const text = event.clipboardData.getData("text/plain");

  if (!text) {
    return;
  }

  event.preventDefault();
  const input = parseBase64Value(text);
  storedInput = input;
  renderInputPreview(input.payload);
  decodeCurrentInput(input.payload.length <= AUTO_RENDER_LIMIT);
});

fallbackType.addEventListener("change", () => {
  decodeCurrentInput(true);
});

decodeInput.addEventListener("click", () => {
  decodeCurrentInput(true);
});

clearInput.addEventListener("click", () => {
  storedInput = null;
  decodedText = "";
  base64Input.value = "";
  setInputStatus("");
  decodeCurrentInput();
});

copyDecodedText.addEventListener("click", async () => {
  if (!decodedText) {
    return;
  }

  setStatus(await copyText(decodedText, "解码文本已复制。", "base64-decoded.txt"));
});

downloadDecoded.addEventListener("click", () => {
  const result = storedInput?.bytes ? storedInput : decodeCurrentInput(true);

  if (!result?.bytes) {
    return;
  }

  const blob = new Blob([result.bytes], { type: result.mimeType });
  downloadBlob(decodedFileName, blob);
});

decodeCurrentInput();

const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const base64Output = document.getElementById("base64Output");
const copyBase64 = document.getElementById("copyBase64");
const saveBase64 = document.getElementById("saveBase64");
const previewBase64 = document.getElementById("previewBase64");
const imageMeta = document.getElementById("imageMeta");
const base64Size = document.getElementById("base64Size");
const outputNote = document.getElementById("outputNote");
const base64Input = document.getElementById("base64Input");
const inputNote = document.getElementById("inputNote");
const mimeType = document.getElementById("mimeType");
const previewWrap = document.getElementById("previewWrap");
const previewImage = document.getElementById("previewImage");
const previewEmpty = document.getElementById("previewEmpty");
const previewInput = document.getElementById("previewInput");
const downloadImage = document.getElementById("downloadImage");
const clearInput = document.getElementById("clearInput");
const statusLine = document.getElementById("status");

const PREVIEW_LIMIT = 12000;
const AUTO_RENDER_LIMIT = 1500000;

let currentObjectUrl = "";
let rawBase64Payload = "";
let rawBase64FileName = "image-base64.txt";
let rawBase64MimeType = "image/png";
let pastedBase64Payload = "";
let pastedBase64MimeType = "image/png";
let previewTimer = 0;

function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.classList.toggle("error", isError);
}

function stripDataUrlHeader(value) {
  return value.replace(/^data:[^,]+,/, "").trim();
}

function readBase64Input(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/^data:([^;,]+)[^,]*,(.*)$/s);

  if (match) {
    return {
      payload: match[2].replace(/\s+/g, ""),
      type: match[1]
    };
  }

  return {
    payload: trimmed.replace(/\s+/g, ""),
    type: mimeType.value
  };
}

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(1)} KB`;
}

function renderBase64Preview(payload) {
  if (!payload) {
    base64Output.value = "";
    outputNote.textContent = "";
    return;
  }

  if (payload.length <= PREVIEW_LIMIT) {
    base64Output.value = payload;
    outputNote.textContent = "Showing the complete raw Base64 payload.";
    return;
  }

  base64Output.value = payload.slice(0, PREVIEW_LIMIT);
  outputNote.textContent = `Showing first ${PREVIEW_LIMIT.toLocaleString()} chars only. Use CP, TXT, or IMG for the complete payload.`;
}

function renderInputPreview(payload) {
  if (!payload) {
    base64Input.value = "";
    inputNote.textContent = "";
    return;
  }

  if (payload.length <= PREVIEW_LIMIT) {
    base64Input.value = payload;
    inputNote.textContent = "Showing the complete pasted payload.";
    return;
  }

  base64Input.value = payload.slice(0, PREVIEW_LIMIT);
  inputNote.textContent = `Showing first ${PREVIEW_LIMIT.toLocaleString()} chars only. Preview and download use the complete pasted payload.`;
}

function getExtension(type) {
  const map = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg"
  };
  return map[type] || "png";
}

function revokeObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = "";
  }
}

function downloadTextFile(fileName, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function setImageButtons(enabled) {
  copyBase64.disabled = !enabled;
  saveBase64.disabled = !enabled;
  previewBase64.disabled = !enabled;
}

function renderImageFromBase64(payload, type) {
  revokeObjectUrl();
  previewImage.onload = null;
  previewImage.onerror = null;
  previewImage.removeAttribute("src");
  previewWrap.classList.remove("has-image");

  if (!payload) {
    previewEmpty.textContent = "Image preview appears here";
    previewInput.disabled = true;
    downloadImage.disabled = true;
    setStatus("");
    return;
  }

  previewInput.disabled = false;
  downloadImage.disabled = false;
  previewImage.onload = () => {
    previewWrap.classList.add("has-image");
    setStatus(`${payload.length.toLocaleString()} chars, preview ready.`);
  };

  previewImage.onerror = () => {
    previewEmpty.textContent = "Invalid Base64 payload";
    setStatus("Decode failed. Paste the raw payload body only.", true);
  };

  previewImage.src = `data:${type};base64,${payload}`;
}

function updatePreview() {
  const input = pastedBase64Payload
    ? { payload: pastedBase64Payload, type: pastedBase64MimeType }
    : readBase64Input(base64Input.value);

  if ([...mimeType.options].some((option) => option.value === input.type)) {
    mimeType.value = input.type;
  }

  renderImageFromBase64(input.payload, input.type);
}

function setStoredInput(input) {
  pastedBase64Payload = input.payload;
  pastedBase64MimeType = input.type;

  if ([...mimeType.options].some((option) => option.value === pastedBase64MimeType)) {
    mimeType.value = pastedBase64MimeType;
  }

  renderInputPreview(pastedBase64Payload);
  previewInput.disabled = !pastedBase64Payload;
  downloadImage.disabled = !pastedBase64Payload;

  if (!pastedBase64Payload) {
    renderImageFromBase64("", pastedBase64MimeType);
    return;
  }

  if (pastedBase64Payload.length <= AUTO_RENDER_LIMIT) {
    window.setTimeout(() => renderImageFromBase64(pastedBase64Payload, pastedBase64MimeType), 0);
    return;
  }

  previewImage.removeAttribute("src");
  previewWrap.classList.remove("has-image");
  previewEmpty.textContent = "Large payload stored. Click Preview when needed.";
  setStatus(`${pastedBase64Payload.length.toLocaleString()} chars stored. Preview and download use the complete payload.`);
}

function schedulePreviewUpdate() {
  window.clearTimeout(previewTimer);
  previewTimer = window.setTimeout(updatePreview, 180);
}

function handleFile(file) {
  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    imageMeta.textContent = "Please choose an image file.";
    return;
  }

  rawBase64Payload = "";
  rawBase64MimeType = file.type || "image/png";
  renderBase64Preview("");
  setImageButtons(false);
  imageMeta.textContent = `Reading ${file.name}...`;
  base64Size.textContent = "Working";
  rawBase64FileName = `${file.name.replace(/\.[^.]+$/, "") || "image"}-base64.txt`;

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    rawBase64Payload = stripDataUrlHeader(String(reader.result));
    if ([...mimeType.options].some((option) => option.value === rawBase64MimeType)) {
      mimeType.value = rawBase64MimeType;
    }
    renderBase64Preview(rawBase64Payload);
    base64Size.textContent = `${rawBase64Payload.length.toLocaleString()} chars`;
    imageMeta.textContent = `${file.name} - ${formatSize(file.size)}`;
    setImageButtons(rawBase64Payload.length > 0);
  });

  reader.addEventListener("error", () => {
    imageMeta.textContent = "Failed to read image.";
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

  try {
    await navigator.clipboard.writeText(rawBase64Payload);
    imageMeta.textContent = "Full raw Base64 copied.";
  } catch (error) {
    downloadTextFile(rawBase64FileName, rawBase64Payload);
    imageMeta.textContent = "Clipboard failed, saved TXT instead.";
  }
});

base64Output.addEventListener("copy", (event) => {
  if (!rawBase64Payload) {
    return;
  }

  event.preventDefault();
  event.clipboardData.setData("text/plain", rawBase64Payload);
  imageMeta.textContent = "Full raw Base64 copied.";
});

base64Input.addEventListener("copy", (event) => {
  if (!pastedBase64Payload) {
    return;
  }

  event.preventDefault();
  event.clipboardData.setData("text/plain", pastedBase64Payload);
  setStatus("Full pasted Base64 copied.");
});

saveBase64.addEventListener("click", () => {
  if (!rawBase64Payload) {
    return;
  }

  downloadTextFile(rawBase64FileName, rawBase64Payload);
  imageMeta.textContent = "Full raw Base64 TXT saved.";
});

previewBase64.addEventListener("click", () => {
  if (!rawBase64Payload) {
    return;
  }

  if ([...mimeType.options].some((option) => option.value === rawBase64MimeType)) {
    mimeType.value = rawBase64MimeType;
  }

  pastedBase64Payload = rawBase64Payload;
  pastedBase64MimeType = rawBase64MimeType;
  renderInputPreview(pastedBase64Payload);
  renderImageFromBase64(rawBase64Payload, rawBase64MimeType);
  setStatus("Generated Base64 previewed from the complete payload.");
});

base64Input.addEventListener("input", () => {
  pastedBase64Payload = "";
  pastedBase64MimeType = mimeType.value;
  inputNote.textContent = "";
  schedulePreviewUpdate();
});
base64Input.addEventListener("paste", (event) => {
  const text = event.clipboardData.getData("text/plain");

  if (!text) {
    return;
  }

  event.preventDefault();
  const input = readBase64Input(text);
  setStoredInput(input);
});
mimeType.addEventListener("change", () => {
  if (pastedBase64Payload) {
    pastedBase64MimeType = mimeType.value;
  }

  updatePreview();
});

previewInput.addEventListener("click", updatePreview);

clearInput.addEventListener("click", () => {
  pastedBase64Payload = "";
  pastedBase64MimeType = mimeType.value;
  base64Input.value = "";
  inputNote.textContent = "";
  updatePreview();
});

downloadImage.addEventListener("click", () => {
  const input = pastedBase64Payload
    ? { payload: pastedBase64Payload, type: pastedBase64MimeType }
    : readBase64Input(base64Input.value);

  if (!input.payload) {
    return;
  }

  const link = document.createElement("a");
  link.href = `data:${input.type};base64,${input.payload}`;
  link.download = `base64-image.${getExtension(input.type)}`;
  link.click();
});

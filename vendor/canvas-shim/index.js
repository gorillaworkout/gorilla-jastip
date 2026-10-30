// Adapter untuk pdfjs-dist: factory kanvas internal pdf.js mengimpor
// paket bernama "canvas". Di sini paket itu dialihkan ke @napi-rs/canvas
// yang sudah punya binary prebuilt (tanpa apt/Cairo).
module.exports = require("@napi-rs/canvas");

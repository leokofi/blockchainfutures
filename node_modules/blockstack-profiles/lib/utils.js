"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.nextYear = nextYear;
function nextYear() {
  return new Date(new Date().setFullYear(new Date().getFullYear() + 1));
}
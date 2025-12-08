"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/isows@1.0.3_ws@8.13.0";
exports.ids = ["vendor-chunks/isows@1.0.3_ws@8.13.0"];
exports.modules = {

/***/ "(ssr)/./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/index.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/index.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WebSocket: () => (/* binding */ WebSocket)\n/* harmony export */ });\n/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ws */ \"(ssr)/./node_modules/.pnpm/ws@8.13.0/node_modules/ws/wrapper.mjs\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ \"(ssr)/./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/utils.js\");\n\n\nconst WebSocket = (() => {\n  try {\n    return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getNativeWebSocket)();\n  } catch {\n    if (ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket) return ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket;\n    return ws__WEBPACK_IMPORTED_MODULE_0__;\n  }\n})();//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vaXNvd3NAMS4wLjNfd3NAOC4xMy4wL25vZGVfbW9kdWxlcy9pc293cy9fZXNtL2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFpQztBQUNlO0FBQ3pDLE1BQU1FLFNBQVMsR0FBRyxDQUFDLE1BQU07RUFDNUIsSUFBSTtJQUNBLE9BQU9ELDZEQUFrQixDQUFDLENBQUM7RUFDL0IsQ0FBQyxDQUNELE1BQU07SUFDRixJQUFJRCx5Q0FBb0IsRUFDcEIsT0FBT0EseUNBQW9CO0lBQy9CLE9BQU9BLCtCQUFVO0VBQ3JCO0FBQ0osQ0FBQyxFQUFFLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdHJlYW1wYXktZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvLnBucG0vaXNvd3NAMS4wLjNfd3NAOC4xMy4wL25vZGVfbW9kdWxlcy9pc293cy9fZXNtL2luZGV4LmpzP2M4MDciXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgV2ViU29ja2V0XyBmcm9tIFwid3NcIjtcbmltcG9ydCB7IGdldE5hdGl2ZVdlYlNvY2tldCB9IGZyb20gXCIuL3V0aWxzLmpzXCI7XG5leHBvcnQgY29uc3QgV2ViU29ja2V0ID0gKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gZ2V0TmF0aXZlV2ViU29ja2V0KCk7XG4gICAgfVxuICAgIGNhdGNoIHtcbiAgICAgICAgaWYgKFdlYlNvY2tldF8uV2ViU29ja2V0KVxuICAgICAgICAgICAgcmV0dXJuIFdlYlNvY2tldF8uV2ViU29ja2V0O1xuICAgICAgICByZXR1cm4gV2ViU29ja2V0XztcbiAgICB9XG59KSgpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl0sIm5hbWVzIjpbIldlYlNvY2tldF8iLCJnZXROYXRpdmVXZWJTb2NrZXQiLCJXZWJTb2NrZXQiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/utils.js":
/*!***********************************************************************************!*\
  !*** ./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/utils.js ***!
  \***********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getNativeWebSocket: () => (/* binding */ getNativeWebSocket)\n/* harmony export */ });\nfunction getNativeWebSocket() {\n  if (typeof WebSocket !== \"undefined\") return WebSocket;\n  if (typeof global.WebSocket !== \"undefined\") return global.WebSocket;\n  if (typeof window.WebSocket !== \"undefined\") return window.WebSocket;\n  if (typeof self.WebSocket !== \"undefined\") return self.WebSocket;\n  throw new Error(\"`WebSocket` is not supported in this environment\");\n}//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvLnBucG0vaXNvd3NAMS4wLjNfd3NAOC4xMy4wL25vZGVfbW9kdWxlcy9pc293cy9fZXNtL3V0aWxzLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBTyxTQUFTQSxrQkFBa0JBLENBQUEsRUFBRztFQUNqQyxJQUFJLE9BQU9DLFNBQVMsS0FBSyxXQUFXLEVBQ2hDLE9BQU9BLFNBQVM7RUFDcEIsSUFBSSxPQUFPQyxNQUFNLENBQUNELFNBQVMsS0FBSyxXQUFXLEVBQ3ZDLE9BQU9DLE1BQU0sQ0FBQ0QsU0FBUztFQUMzQixJQUFJLE9BQU9FLE1BQU0sQ0FBQ0YsU0FBUyxLQUFLLFdBQVcsRUFDdkMsT0FBT0UsTUFBTSxDQUFDRixTQUFTO0VBQzNCLElBQUksT0FBT0csSUFBSSxDQUFDSCxTQUFTLEtBQUssV0FBVyxFQUNyQyxPQUFPRyxJQUFJLENBQUNILFNBQVM7RUFDekIsTUFBTSxJQUFJSSxLQUFLLENBQUMsa0RBQWtELENBQUM7QUFDdkUiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdHJlYW1wYXktZnJvbnRlbmQvLi9ub2RlX21vZHVsZXMvLnBucG0vaXNvd3NAMS4wLjNfd3NAOC4xMy4wL25vZGVfbW9kdWxlcy9pc293cy9fZXNtL3V0aWxzLmpzPzZhNTciXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGdldE5hdGl2ZVdlYlNvY2tldCgpIHtcbiAgICBpZiAodHlwZW9mIFdlYlNvY2tldCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIFdlYlNvY2tldDtcbiAgICBpZiAodHlwZW9mIGdsb2JhbC5XZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiBnbG9iYWwuV2ViU29ja2V0O1xuICAgIGlmICh0eXBlb2Ygd2luZG93LldlYlNvY2tldCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5XZWJTb2NrZXQ7XG4gICAgaWYgKHR5cGVvZiBzZWxmLldlYlNvY2tldCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIHNlbGYuV2ViU29ja2V0O1xuICAgIHRocm93IG5ldyBFcnJvcihcImBXZWJTb2NrZXRgIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBlbnZpcm9ubWVudFwiKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCJdLCJuYW1lcyI6WyJnZXROYXRpdmVXZWJTb2NrZXQiLCJXZWJTb2NrZXQiLCJnbG9iYWwiLCJ3aW5kb3ciLCJzZWxmIiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/.pnpm/isows@1.0.3_ws@8.13.0/node_modules/isows/_esm/utils.js\n");

/***/ })

};
;
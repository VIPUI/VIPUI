/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var selector_1 = __webpack_require__(1);
var VIPUI = (function () {
    function VIPUI() {
        this.version = "0.0.1";
        this.selector = new selector_1.Selector();
        var lib = new VIPUI(), $ = lib.selector.$;
    }
    return VIPUI;
}());
exports.VIPUI = VIPUI;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var Selector = (function () {
    function Selector() {
    }
    Selector.prototype.$ = function (selectorString) {
        var self = this;
        var selectorSymbols = {}, selector, indexChart = selectorString.substr(0, 1);
        if (!document.querySelector) {
            selectorSymbols = {
                ".": "getElementsByClassName",
                "#": "getElementById"
            };
            selector = selectorString.substr(1);
        }
        else {
            selectorSymbols = {
                ".": "querySelectorAll",
                "#": "querySelector"
            };
            selector = selectorString;
        }
        var fetcher = selectorSymbols[indexChart];
        return document[fetcher](selector);
    };
    return Selector;
}());
exports.Selector = Selector;


/***/ })
/******/ ]);
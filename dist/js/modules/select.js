"use strict";
/* global Tether */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var _a = Tether.Utils, extend = _a.extend, addClass = _a.addClass, removeClass = _a.removeClass, hasClass = _a.hasClass, getBounds = _a.getBounds, Evented = _a.Evented;
var ENTER = 13;
var ESCAPE = 27;
var SPACE = 32;
var UP = 38;
var DOWN = 40;
var touchDevice = 'ontouchstart' in document.documentElement;
var clickEvent = touchDevice ? 'touchstart' : 'click';
function useNative() {
    var innerWidth = window.innerWidth, innerHeight = window.innerHeight;
    return touchDevice && (innerWidth <= 640 || innerHeight <= 640);
}
function isRepeatedChar(str) {
    return Array.prototype.reduce.call(str, function (a, b) {
        return a === b ? b : false;
    });
}
function getFocusedSelect() {
    var focusedTarget = document.querySelector('.select-target-focused');
    return focusedTarget ? focusedTarget.selectInstance : null;
}
var searchText = '';
var searchTextTimeout;
document.addEventListener('keypress', function (e) {
    var select = getFocusedSelect();
    if (!select || e.charCode === 0) {
        return;
    }
    if (e.keyCode === SPACE) {
        e.preventDefault();
    }
    clearTimeout(searchTextTimeout);
    searchTextTimeout = setTimeout(function () {
        searchText = '';
    }, 500);
    searchText += String.fromCharCode(e.charCode);
    var options = select.findOptionsByPrefix(searchText);
    if (options.length === 1) {
        // We have an exact match, choose it
        select.selectOption(options[0]);
    }
    if (searchText.length > 1 && isRepeatedChar(searchText)) {
        // They hit the same char over and over, maybe they want to cycle through
        // the options that start with that char
        var repeatedOptions = select.findOptionsByPrefix(searchText[0]);
        if (repeatedOptions.length) {
            var selected = repeatedOptions.indexOf(select.getChosen());
            // Pick the next thing (if something with this prefix wasen't selected
            // we'll end up with the first option)
            selected += 1;
            selected = selected % repeatedOptions.length;
            select.selectOption(repeatedOptions[selected]);
            return;
        }
    }
    if (options.length) {
        // We have multiple things that start with this prefix.  Based on the
        // behavior of native select, this is considered after the repeated case.
        select.selectOption(options[0]);
        return;
    }
    // No match at all, do nothing
});
document.addEventListener('keydown', function (e) {
    // We consider this independently of the keypress handler so we can intercept
    // keys that have built-in functions.
    var select = getFocusedSelect();
    if (!select) {
        return;
    }
    if ([UP, DOWN, ESCAPE].indexOf(e.keyCode) >= 0) {
        e.preventDefault();
    }
    if (select.isOpen()) {
        switch (e.keyCode) {
            case UP:
            case DOWN:
                select.moveHighlight(e.keyCode);
                break;
            case ENTER:
                select.selectHighlightedOption();
                break;
            case ESCAPE:
                select.close();
                select.target.focus();
        }
    }
    else {
        if ([UP, DOWN, SPACE].indexOf(e.keyCode) >= 0) {
            select.open();
        }
    }
});
var Select = (function (_super) {
    __extends(Select, _super);
    function Select(options) {
        var _this = _super.call(this, options) || this;
        _this.options = extend({}, Select.defaults, options);
        _this.select = _this.options.el;
        if (typeof _this.select.selectInstance !== 'undefined') {
            throw new Error('This element has already been turned into a Select');
        }
        _this.update = _this.update.bind(_this);
        _this.setupTarget();
        _this.renderTarget();
        _this.setupDrop();
        _this.renderDrop();
        _this.setupSelect();
        _this.setupTether();
        _this.bindClick();
        _this.bindMutationEvents();
        _this.value = _this.select.value;
        return _this;
    }
    Select.prototype.useNative = function () {
        var native = this.options.useNative;
        return native === true || (useNative() && native !== false);
    };
    Select.prototype.setupTarget = function () {
        var _this = this;
        this.target = document.createElement('a');
        this.target.href = 'javascript:;';
        addClass(this.target, 'select-target');
        var tabIndex = this.select.getAttribute('tabindex') || 0;
        this.target.setAttribute('tabindex', tabIndex);
        if (this.options.className) {
            addClass(this.target, this.options.className);
        }
        this.target.selectInstance = this;
        this.target.addEventListener('click', function () {
            if (!_this.isOpen()) {
                _this.target.focus();
            }
            else {
                _this.target.blur();
            }
        });
        this.target.addEventListener('focus', function () {
            addClass(_this.target, 'select-target-focused');
        });
        this.target.addEventListener('blur', function (_a) {
            var relatedTarget = _a.relatedTarget;
            if (_this.isOpen()) {
                if (relatedTarget && !_this.drop.contains(relatedTarget)) {
                    _this.close();
                }
            }
            removeClass(_this.target, 'select-target-focused');
        });
        this.select.parentNode.insertBefore(this.target, this.select.nextSibling);
    };
    Select.prototype.setupDrop = function () {
        var _this = this;
        this.drop = document.createElement('div');
        addClass(this.drop, 'select');
        if (this.options.className) {
            addClass(this.drop, this.options.className);
        }
        document.body.appendChild(this.drop);
        this.drop.addEventListener('click', function (e) {
            if (hasClass(e.target, 'select-option')) {
                _this.pickOption(e.target);
            }
            // Built-in selects don't propagate click events in their drop directly
            // to the body, so we don't want to either.
            e.stopPropagation();
        });
        this.drop.addEventListener('mousemove', function (e) {
            if (hasClass(e.target, 'select-option')) {
                _this.highlightOption(e.target);
            }
        });
        this.content = document.createElement('div');
        addClass(this.content, 'select-content');
        this.drop.appendChild(this.content);
    };
    Select.prototype.open = function () {
        var _this = this;
        addClass(this.target, 'select-open');
        if (this.useNative()) {
            var event_1 = document.createEvent("MouseEvents");
            event_1.initEvent("mousedown", true, true);
            this.select.dispatchEvent(event_1);
            return;
        }
        addClass(this.drop, 'select-open');
        setTimeout(function () {
            _this.tether.enable();
        });
        var selectedOption = this.drop.querySelector('.select-option-selected');
        if (!selectedOption) {
            return;
        }
        this.highlightOption(selectedOption);
        this.scrollDropContentToOption(selectedOption);
        var positionSelectStyle = function () {
            if (hasClass(_this.drop, 'tether-abutted-left') ||
                hasClass(_this.drop, 'tether-abutted-bottom')) {
                var dropBounds = getBounds(_this.drop);
                var optionBounds = getBounds(selectedOption);
                var offset = dropBounds.top - (optionBounds.top + optionBounds.height);
                _this.drop.style.top = (parseFloat(_this.drop.style.top) || 0) + offset + "px";
            }
        };
        var alignToHighlighted = this.options.alignToHighlighted;
        var _a = this.content, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
        if (alignToHighlighted === 'always' || (alignToHighlighted === 'auto' && scrollHeight <= clientHeight)) {
            setTimeout(function () {
                positionSelectStyle();
            });
        }
        this.trigger('open');
    };
    Select.prototype.close = function () {
        removeClass(this.target, 'select-open');
        if (this.useNative()) {
            this.select.blur();
        }
        this.tether.disable();
        removeClass(this.drop, 'select-open');
        this.trigger('close');
    };
    Select.prototype.toggle = function () {
        if (this.isOpen()) {
            this.close();
        }
        else {
            this.open();
        }
    };
    Select.prototype.isOpen = function () {
        return hasClass(this.drop, 'select-open');
    };
    Select.prototype.bindClick = function () {
        var _this = this;
        this.target.addEventListener(clickEvent, function (e) {
            e.preventDefault();
            _this.toggle();
        });
        document.addEventListener(clickEvent, function (event) {
            if (!_this.isOpen()) {
                return;
            }
            // Clicking inside dropdown
            if (event.target === _this.drop ||
                _this.drop.contains(event.target)) {
                return;
            }
            // Clicking target
            if (event.target === _this.target ||
                _this.target.contains(event.target)) {
                return;
            }
            _this.close();
        });
    };
    Select.prototype.setupTether = function () {
        this.tether = new Tether(extend({
            element: this.drop,
            target: this.target,
            attachment: 'top left',
            targetAttachment: 'bottom left',
            classPrefix: 'select',
            constraints: [{
                    to: 'window',
                    attachment: 'together'
                }]
        }, this.options.tetherOptions));
    };
    Select.prototype.renderTarget = function () {
        this.target.innerHTML = '';
        var options = this.select.querySelectorAll('option');
        for (var i = 0; i < options.length; ++i) {
            var option = options[i];
            if (option.selected) {
                this.target.innerHTML = option.innerHTML;
                break;
            }
        }
        this.target.appendChild(document.createElement('b'));
    };
    Select.prototype.renderDrop = function () {
        var optionList = document.createElement('ul');
        addClass(optionList, 'select-options');
        var options = this.select.querySelectorAll('option');
        for (var i = 0; i < options.length; ++i) {
            var el = options[i];
            var option = document.createElement('li');
            addClass(option, 'select-option');
            option.setAttribute('data-value', el.value);
            option.innerHTML = el.innerHTML;
            if (el.selected) {
                addClass(option, 'select-option-selected');
            }
            optionList.appendChild(option);
        }
        this.content.innerHTML = '';
        this.content.appendChild(optionList);
    };
    Select.prototype.update = function () {
        this.renderDrop();
        this.renderTarget();
    };
    Select.prototype.setupSelect = function () {
        this.select.selectInstance = this;
        addClass(this.select, 'select-select');
        this.select.addEventListener('change', this.update);
    };
    Select.prototype.bindMutationEvents = function () {
        if (typeof window.MutationObserver !== 'undefined') {
            this.observer = new MutationObserver(this.update);
            this.observer.observe(this.select, {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
        }
        else {
            this.select.addEventListener('DOMSubtreeModified', this.update);
        }
    };
    Select.prototype.findOptionsByPrefix = function (text) {
        var options = this.drop.querySelectorAll('.select-option');
        text = text.toLowerCase();
        return Array.prototype.filter.call(options, function (option) {
            return option.innerHTML.toLowerCase().substr(0, text.length) === text;
        });
    };
    Select.prototype.findOptionsByValue = function (val) {
        var options = this.drop.querySelectorAll('.select-option');
        return Array.prototype.filter.call(options, function (option) {
            return option.getAttribute('data-value') === val;
        });
    };
    Select.prototype.getChosen = function () {
        if (this.isOpen()) {
            return this.drop.querySelector('.select-option-highlight');
        }
        return this.drop.querySelector('.select-option-selected');
    };
    Select.prototype.selectOption = function (option) {
        if (this.isOpen()) {
            this.highlightOption(option);
            this.scrollDropContentToOption(option);
        }
        else {
            this.pickOption(option, false);
        }
    };
    Select.prototype.resetSelection = function () {
        this.selectOption(this.drop.querySelector('.select-option'));
    };
    Select.prototype.highlightOption = function (option) {
        var highlighted = this.drop.querySelector('.select-option-highlight');
        if (highlighted) {
            removeClass(highlighted, 'select-option-highlight');
        }
        addClass(option, 'select-option-highlight');
        this.trigger('highlight', { option: option });
    };
    Select.prototype.moveHighlight = function (directionKeyCode) {
        var highlighted = this.drop.querySelector('.select-option-highlight');
        if (!highlighted) {
            this.highlightOption(this.drop.querySelector('.select-option'));
            return;
        }
        var options = this.drop.querySelectorAll('.select-option');
        var highlightedIndex = Array.prototype.indexOf.call(options, highlighted);
        if (!(highlightedIndex >= 0)) {
            return;
        }
        if (directionKeyCode === UP) {
            highlightedIndex -= 1;
        }
        else {
            highlightedIndex += 1;
        }
        if (highlightedIndex < 0 || highlightedIndex >= options.length) {
            return;
        }
        var newHighlight = options[highlightedIndex];
        this.highlightOption(newHighlight);
        this.scrollDropContentToOption(newHighlight);
    };
    Select.prototype.scrollDropContentToOption = function (option) {
        var _a = this.content, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight, scrollTop = _a.scrollTop;
        if (scrollHeight > clientHeight) {
            var contentBounds = getBounds(this.content);
            var optionBounds = getBounds(option);
            this.content.scrollTop = optionBounds.top - (contentBounds.top - scrollTop);
        }
    };
    Select.prototype.selectHighlightedOption = function () {
        this.pickOption(this.drop.querySelector('.select-option-highlight'));
    };
    Select.prototype.pickOption = function (option, close) {
        var _this = this;
        if (close === void 0) { close = true; }
        this.value = this.select.value = option.getAttribute('data-value');
        this.triggerChange();
        if (close) {
            setTimeout(function () {
                _this.close();
                _this.target.focus();
            });
        }
    };
    Select.prototype.triggerChange = function () {
        var event = document.createEvent("HTMLEvents");
        event.initEvent("change", true, false);
        this.select.dispatchEvent(event);
        this.trigger('change', { value: this.select.value });
    };
    Select.prototype.change = function (val) {
        var options = this.findOptionsByValue(val);
        if (!options.length) {
            throw new Error("Select Error: An option with the value \"" + val + "\" doesn't exist");
        }
        this.pickOption(options[0], false);
    };
    return Select;
}(Evented));
exports.Select = Select;
Select.defaults = {
    alignToHighlighed: 'auto',
    className: 'select-theme-default'
};
Select.init = function (options) {
    if (options === void 0) { options = {}; }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { return Select.init(options); });
        return;
    }
    if (typeof options.selector === 'undefined') {
        options.selector = 'select';
    }
    var selectors = document.querySelectorAll(options.selector);
    for (var i = 0; i < selectors.length; ++i) {
        var el = selectors[i];
        if (!el.selectInstance) {
            new Select(extend({ el: el }, options));
        }
    }
};

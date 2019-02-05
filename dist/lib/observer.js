"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-05-22 16:39
 */
var mobx_1 = require("mobx");
var vue_1 = tslib_1.__importDefault(require("vue"));
var collectData_1 = tslib_1.__importDefault(require("./collectData"));
// @formatter:off
// tslint:disable-next-line
var noop = function () { };
var disposerSymbol = Symbol('disposerSymbol');
function observer(Component) {
    var name = Component.name || Component._componentTag || (Component.constructor && Component.constructor.name) || '<component>';
    var originalOptions = typeof Component === 'object' ? Component : Component.options;
    // To not mutate the original component options, we need to construct a new one
    var dataDefinition = originalOptions.data;
    var disposers = [];
    var originalComputed = {};
    var __mobx = {};
    if (originalOptions.computed) {
        var _loop_1 = function (computedName) {
            if (originalOptions.computed[computedName] instanceof Function) {
                __mobx[computedName] = 0;
                originalComputed[computedName] = originalOptions.computed[computedName];
                originalOptions.computed[computedName] = function (vm) {
                    vm._data.__mobx[computedName] = vm._data.__mobx[computedName];
                    return originalComputed[computedName].call(vm, vm);
                };
            }
        };
        for (var _i = 0, _a = Object.keys(originalOptions.computed); _i < _a.length; _i++) {
            var computedName = _a[_i];
            _loop_1(computedName);
        }
    }
    var options = tslib_1.__assign({}, originalOptions, { name: name, data: function (vm) {
            var data = collectData_1.default(vm, dataDefinition);
            data.__mobx = __mobx;
            return data;
        }, 
        // overrider the cached constructor to avoid extending skip
        // @see https://github.com/vuejs/vue/blob/6cc070063bd211229dff5108c99f7d11b6778550/src/core/global-api/extend.js#L24
        _Ctor: {} });
    // we couldn't use the Component as super class when Component was a VueClass, that will invoke the lifecycle twice after we called Component.extend
    var superProto = typeof Component === 'function' && Object.getPrototypeOf(Component.prototype);
    var Super = superProto instanceof vue_1.default ? superProto.constructor : vue_1.default;
    var ExtendedComponent = Super.extend(options);
    var _b = ExtendedComponent.prototype, $mount = _b.$mount, $destroy = _b.$destroy;
    ExtendedComponent.prototype.$mount = function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var mounted = false;
        this[disposerSymbol] = noop;
        var nativeRenderOfVue;
        var reactiveRender = function () {
            reaction.track(function () {
                if (!mounted) {
                    $mount.apply(_this, args);
                    mounted = true;
                    nativeRenderOfVue = _this._watcher.getter;
                    // rewrite the native render method of vue with our reactive tracker render
                    // thus if component updated by vue watcher, we could re track and collect dependencies by mobx
                    _this._watcher.getter = reactiveRender;
                }
                else {
                    nativeRenderOfVue.call(_this, _this);
                }
            });
            return _this;
        };
        var _loop_2 = function (computed) {
            disposers.push(mobx_1.autorun(function () {
                _this._data.__mobx[computed]++;
                originalComputed[computed].call(_this, _this);
            }));
        };
        for (var _a = 0, _b = Object.keys(originalComputed); _a < _b.length; _a++) {
            var computed = _b[_a];
            _loop_2(computed);
        }
        var reaction = new mobx_1.Reaction(name + ".render()", reactiveRender);
        this[disposerSymbol] = reaction.getDisposer();
        return reactiveRender();
    };
    ExtendedComponent.prototype.$destroy = function () {
        disposers.forEach(function (disposer) { return disposer(); });
        disposers = [];
        this[disposerSymbol]();
        $destroy.apply(this);
    };
    Object.defineProperty(ExtendedComponent, 'name', {
        writable: false,
        value: name,
        enumerable: false,
        configurable: false,
    });
    return ExtendedComponent;
}
exports.observer = observer;
exports.Observer = observer;

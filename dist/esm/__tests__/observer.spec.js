import * as tslib_1 from "tslib";
/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-05-24 13:36
 */
import { shallowMount } from '@vue/test-utils';
import { action, computed, observable } from 'mobx';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Observer, observer } from '../observer';
import Base from './fixtures/Base.vue';
import ClassBase from './fixtures/ClassBase.vue';
import Conditional from './fixtures/Conditional.vue';
import DecoratedClassBase from './fixtures/DecoratedClassBase.vue';
import ModelClassBase from './fixtures/ModelClassBase.vue';
import UserComponent from './fixtures/User.vue';
var Model = /** @class */ (function () {
    function Model() {
        this.age = 10;
    }
    Object.defineProperty(Model.prototype, "computedAge", {
        get: function () {
            return this.age + 1;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.setAge = function () {
        this.age++;
    };
    tslib_1.__decorate([
        observable
    ], Model.prototype, "age", void 0);
    tslib_1.__decorate([
        computed
    ], Model.prototype, "computedAge", null);
    tslib_1.__decorate([
        action.bound
    ], Model.prototype, "setAge", null);
    return Model;
}());
test('observer with a object literal component', function () {
    var model = observable({
        age: 10,
        setAge: function () {
            model.age++;
        },
    });
    var Component = observer({
        data: function () {
            return {
                model: model,
            };
        },
        name: 'HelloWorld',
        render: function (h) {
            return h('button', {
                on: { click: this.model.setAge }, domProps: { textContent: this.model.age },
            });
        },
    });
    var wrapper = shallowMount(Component);
    expect(wrapper.name()).toBe('HelloWorld');
    expect(wrapper.find('button').text()).toBe('10');
    wrapper.find('button').trigger('click');
    expect(wrapper.find('button').text()).toBe('11');
    wrapper.destroy();
});
test('observer with a base component', function () {
    var Component = observer(Base);
    var wrapper = shallowMount(Component);
    expect(wrapper.name()).toBe(Base.name);
    expect(wrapper.find('p').text()).toBe('10');
    wrapper.find('button').trigger('click');
    expect(wrapper.find('p').text()).toBe('11');
    wrapper.destroy();
});
test('observer with a class component', function () {
    var Component = observer(ClassBase);
    var wrapper = shallowMount(Component);
    expect(wrapper.name()).toBe(ClassBase.name);
    expect(wrapper.find('[role="age"]').text()).toBe('10');
    wrapper.find('button').trigger('click');
    expect(wrapper.find('[role="age"]').text()).toBe('11');
    wrapper.destroy();
});
//
test('use observer function with class component and observable model constructed by class', function () {
    var Component = observer(ModelClassBase);
    var wrapper = shallowMount(Component);
    expect(wrapper.name()).toBe(ModelClassBase.name);
    expect(wrapper.find('[role="age"]').text()).toBe('10');
    expect(wrapper.find('[role="computed-age"]').text()).toBe('11');
    wrapper.find('button').trigger('click');
    expect(wrapper.find('[role=age]').text()).toBe('11');
    expect(wrapper.find('[role="computed-age"]').text()).toBe('12');
    wrapper.destroy();
});
//
describe('use observer decorator with class component and observable model constructed by class', function () {
    var wrapper = shallowMount(DecoratedClassBase);
    test('component should be reactive', function () {
        expect(wrapper.name()).toBe(DecoratedClassBase.name);
        expect(wrapper.find('[role="age"]').text()).toBe('10');
        expect(wrapper.find('[role="computed-age"]').text()).toBe('11');
        wrapper.find('button').trigger('click');
        wrapper.find('button').trigger('click');
        expect(wrapper.find('[role=age]').text()).toBe('12');
        expect(wrapper.find('[role="computed-age"]').text()).toBe('13');
        wrapper.destroy();
    });
    test('mobx reaction should be disposed while component destroyed', function () {
        var spy = jest.fn();
        var $destroy = DecoratedClassBase.prototype.$destroy;
        DecoratedClassBase.prototype.$destroy = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            $destroy.apply(this, args);
            spy();
        };
        wrapper.destroy();
        expect(spy.mock.calls.length).toBe(1);
    });
});
//
test('compatible with traditional component definition', function () {
    var Component = observer({
        name: 'HelloWorld',
        data: function () {
            return { name: 'kuitos', model: new Model() };
        },
        methods: {
            setName: function () {
                this.name = 'lk';
            },
        },
        render: function (h) {
            return h('button', {
                on: { click: this.model.setAge, focus: this.setName }, domProps: { textContent: this.model.age + " " + this.name },
            });
        },
    });
    var wrapper = shallowMount(Component);
    wrapper.trigger('click');
    expect(wrapper.find('button').text()).toBe('11 kuitos');
    wrapper.trigger('focus');
    expect(wrapper.find('button').text()).toBe('11 lk');
});
test('component lifecycle should worked well', function () {
    var Component = observer({
        name: 'HelloWorld',
        data: function () {
            return { model: new Model() };
        },
        beforeCreate: function () {
            expect(this.model).toBeUndefined();
        },
        created: function () {
            expect(this.model.age).toBe(10);
        },
        beforeUpdate: function () {
            expect(this.model.age).toBe(11);
        },
        updated: function () {
            expect(this.model.age).toBe(11);
        },
        render: function (h) {
            return h('button', {
                on: { click: this.model.setAge }, domProps: { textContent: this.model.age },
            });
        },
    });
    var wrapper = shallowMount(Component);
    wrapper.trigger('click');
});
test('conditional render should be re tracked', function () {
    var wrapper = shallowMount(Conditional);
    expect(wrapper.find('[role=age]').text()).toBe('10');
    wrapper.find('[role=toggle]').trigger('click');
    expect(wrapper.find('[role=count]').text()).toBe('0');
    wrapper.find('[role=increase]').trigger('click');
    expect(wrapper.find('[role=count]').text()).toBe('1');
    wrapper.find('[role=native-toggle]').trigger('click');
    expect(wrapper.find('[role=native-count]').text()).toBe('0');
    wrapper.find('[role=native-increase]').trigger('click');
    expect(wrapper.find('[role=native-count]').text()).toBe('1');
});
test('mobx state should not be collect by vue', function () {
    var ObservableModel = /** @class */ (function () {
        function ObservableModel() {
            this.name = '';
        }
        tslib_1.__decorate([
            observable
        ], ObservableModel.prototype, "name", void 0);
        return ObservableModel;
    }());
    var prop = function (value) { return function () {
        return {
            configurable: true,
            get: function () {
                return value;
            },
        };
    }; };
    var model1 = observable({ xx: 10 });
    var Model = /** @class */ (function () {
        function Model() {
        }
        return Model;
    }());
    var App = /** @class */ (function (_super) {
        tslib_1.__extends(App, _super);
        function App() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.model = new Model();
            _this.om = new ObservableModel();
            _this.om1 = model1;
            _this.age = 10;
            return _this;
        }
        App.prototype.render = function (h) {
            return h('div');
        };
        tslib_1.__decorate([
            prop('kuitos')
        ], App.prototype, "name", void 0);
        App = tslib_1.__decorate([
            Observer,
            Component
        ], App);
        return App;
    }(Vue));
    var vm = shallowMount(App).vm;
    expect(vm.$data.hasOwnProperty('om')).toBeFalsy();
    expect(vm.$data.hasOwnProperty('om1')).toBeFalsy();
    expect(vm.$data.hasOwnProperty('age')).toBeTruthy();
    expect(vm.$data.hasOwnProperty('model')).toBeTruthy();
    expect(vm.name).toBe('kuitos');
    expect(vm.$data.hasOwnProperty('name')).toBeFalsy();
});
test('changes in mobx state should be trigger recompute vue computed fields', function () {
    var wrapper = shallowMount(UserComponent);
    var fullName = wrapper.find('#full-name');
    var changeFirstName = wrapper.find('#change-first-name');
    var changeNickName = wrapper.find('#change-nick-name');
    expect(fullName.text()).toBe('A1 B C1');
    changeNickName.trigger('click');
    expect(fullName.text()).toBe('A1 B C2');
    changeFirstName.trigger('click');
    expect(fullName.text()).toBe('A2 B C2');
});

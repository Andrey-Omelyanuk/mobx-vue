/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-05-22 16:39
 */
import { autorun, Reaction } from 'mobx';
import Vue, { ComponentOptions } from 'vue';
import collectDataForVue from './collectData';

export type VueClass<V> = { new(...args: any[]): V & Vue } & typeof Vue;

// @formatter:off
// tslint:disable-next-line
const noop = () => {};
const disposerSymbol = Symbol('disposerSymbol');
// @formatter:on
function observer<VC extends VueClass<Vue>>(Component: VC | ComponentOptions<Vue>): VC;
function observer<VC extends VueClass<Vue>>(Component: VC | ComponentOptions<Vue>) {

	const name = (Component as any).name || (Component as any)._componentTag || (Component.constructor && Component.constructor.name) || '<component>';

	const originalOptions = typeof Component === 'object' ? Component : (Component as any).options;
	// To not mutate the original component options, we need to construct a new one
	const dataDefinition = originalOptions.data;

	let disposers: any = [];
	const originalComputed: any = {};
	const __mobx: any = {};
	if (originalOptions.computed) {
		for (const computedName of Object.keys(originalOptions.computed)) {
			if (originalOptions.computed[computedName] instanceof Function) {
				console.log(originalOptions.computed, computedName);
				__mobx[computedName] = 0;
				originalComputed[computedName] = originalOptions.computed[computedName];
				originalOptions.computed[computedName] = (vm: any) => {
					vm._data.__mobx[computedName] = vm._data.__mobx[computedName];
					return originalComputed[computedName].call(vm, vm);
				};
			}
		}
	}

	const options = {
		...originalOptions,
		name,
		data: (vm: Vue) => {
			const data = collectDataForVue(vm, dataDefinition);
			data.__mobx = __mobx;
			return data;
		},
		// overrider the cached constructor to avoid extending skip
		// @see https://github.com/vuejs/vue/blob/6cc070063bd211229dff5108c99f7d11b6778550/src/core/global-api/extend.js#L24
		_Ctor: {},
	};

	// we couldn't use the Component as super class when Component was a VueClass, that will invoke the lifecycle twice after we called Component.extend
	const superProto = typeof Component === 'function' && Object.getPrototypeOf(Component.prototype);
	const Super = superProto instanceof Vue ? superProto.constructor : Vue;
	const ExtendedComponent = Super.extend(options);

	const { $mount, $destroy } = ExtendedComponent.prototype;

	ExtendedComponent.prototype.$mount = function (this: any, ...args: any[]) {
		let mounted = false;
		this[disposerSymbol] = noop;

		let nativeRenderOfVue: any;
		const reactiveRender = () => {
			reaction.track(() => {
				if (!mounted) {
					$mount.apply(this, args);
					mounted = true;
					nativeRenderOfVue = this._watcher.getter;
					// rewrite the native render method of vue with our reactive tracker render
					// thus if component updated by vue watcher, we could re track and collect dependencies by mobx
					this._watcher.getter = reactiveRender;
				} else {
					nativeRenderOfVue.call(this, this);
				}
			});

			return this;
		};

		for (const computed of Object.keys(originalComputed)) {
			disposers.push(autorun(() => {
				this._data.__mobx[computed]++;
				originalComputed[computed].call(this, this);
			}));
		}
		const reaction = new Reaction(`${name}.render()`, reactiveRender);

		this[disposerSymbol] = reaction.getDisposer();

		return reactiveRender();
	};

	ExtendedComponent.prototype.$destroy = function (this: Vue) {
		disposers.forEach((disposer: any) => disposer());
		disposers = [];
		(this as any)[disposerSymbol]();
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

export {
	observer,
	observer as Observer,
};

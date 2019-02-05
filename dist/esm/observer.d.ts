import Vue, { ComponentOptions } from 'vue';
export declare type VueClass<V> = {
    new (...args: any[]): V & Vue;
} & typeof Vue;
declare function observer<VC extends VueClass<Vue>>(Component: VC | ComponentOptions<Vue>): VC;
export { observer, observer as Observer, };

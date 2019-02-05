/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-06-08 10:16
 */
import Vue from 'vue';
import { DefaultData } from 'vue/types/options';
/**
 * collect the data which defined for vue
 * and filter the mobx data to avoid duplicated watching by vue
 * @param {Vue} vm
 * @param {DefaultData<Vue>} data
 * @returns {any} filtered data for vue definition
 */
export default function collectData(vm: Vue, data?: DefaultData<Vue>): any;

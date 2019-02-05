/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2018-06-08 10:16
 */
import { isObservable } from 'mobx';
/**
 * collect the data which defined for vue
 * and filter the mobx data to avoid duplicated watching by vue
 * @param {Vue} vm
 * @param {DefaultData<Vue>} data
 * @returns {any} filtered data for vue definition
 */
export default function collectData(vm, data) {
    var dataDefinition = typeof data === 'function' ? data.call(vm, vm) : (data || {});
    var filteredData = Object.keys(dataDefinition).reduce(function (result, field) {
        var value = dataDefinition[field];
        if (isObservable(value)) {
            Object.defineProperty(vm, field, {
                configurable: true,
                get: function () {
                    return value;
                },
                // @formatter:off
                // tslint:disable-next-line
                set: function () { }
                // @formatter:on
            });
        }
        else {
            result[field] = value;
        }
        return result;
    }, {});
    return filteredData;
}

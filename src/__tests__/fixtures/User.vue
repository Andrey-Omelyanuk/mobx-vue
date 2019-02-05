<template>

	<section>
		<p id='full-name'>{{ full_name }} </p>
		<button id='change-first-name' @click="changeFirstName"></button>
		<button id='change-nick-name' @click="changeNickName"></button>
	</section>

</template>
<script lang="ts">

    import { computed, observable } from "mobx";
    import { observer } from '../../observer';

	class User {
		@observable first_name = '';
		@observable last_name  = '';
		@computed get full_name() {
			return `${this.first_name} ${this.last_name}`;
		}
	}
	const user = new User();
	user.first_name = 'A1';
	user.last_name  = 'B';

	export default observer(<any>{
		data() {
			return { nick_name: 'C1' };
        },
        methods: {
            changeFirstName() {
                user.first_name = 'A2'
            },
            changeNickName(this: any) {
                this.nick_name = 'C2'
            }
        },
		computed: {
			full_name(this: any) {
				return `${user.full_name} ${this.nick_name}`;
			},
		}
    })

</script>

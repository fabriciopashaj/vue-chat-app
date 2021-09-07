"use strict";

/** @type {Vue} */
var app = new Vue({
	store,
	router,
	components : AppComponents,
	lang: 'Handlebars',
	template: '#App',
	computed:
	Vuex.mapState(['messages', 'userData']),
	methods: {
		clearMessages() {
			this.$store.dispatch(`clearAllMessages`);
		},
		addMessage(msgObj) {
			this.$store.dispatch('addNewMessage', msgObj)
			.then(() => {
			})
			.catch(e => console.error(String(e)));
		},
		getSourceById: () => null
	},
	filters: {
		formatDate() {
			return formatTime(...arguments);
		}
	}
});
let send = () => document.querySelector('#send-img').click();
let clr = () => document.querySelector('#bin-img').click();

setTimeout(
	app.$store.commit,
	1000,
	'load-messages',
	messages.map(message => new Message(
		message.sender,
		message.text,
		message.time,
		message.seen
	))
);
/*
const Q = Vue.component("Q", {
	functional: true,
	template: `
<div>
	<p>Hello world</p>
	<div>
		<b>foo</b>
		<b>bar</b>
		<b>baz</b>
</div>
`
});
*/

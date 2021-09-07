"use strict";

class MyVueRouter extends VueRouter {
	constructor(options) {
		super(options);/*
		if(!!options.beforeHooks)
			options.beforeHooks.forEach(this.beforeEach);
		if(!!options.afterHooks)
			options.afterHooks.forEach(this.afterEach)*/
	}
}

const router = (() => {
	return new MyVueRouter({
		routes: [
			{
				path: '/chats',
				name: 'chats-list',
				component: {
					template: '#Chats',
					data() {
						return {
							filterString: ''
						};
					},
					computed: {
						filteredChatsList() {
							return this.$store.state.chats.filter(chat => chat.data.includes(this.filterString));
						}
					}
				}
			},
			{
				path: '/chats/:room',
				name: 'chatroom',
				component: {
					data() {
						return {

						};
					},
					computed: {
						messages() {
							let type = this.$route.query.type;
							let room = this.$route.options.room;
							let chats = this.$store.state.chats;
							return chats.find(mo=>mo[(type==='name'||!type?'name':'id')]===room);
						}
					}
				}
			}
			,
			{
				path: '/messages',
				component: AppComponents.AppChatView
			},
			{
				path: '/messages-table',
				component: AppComponents.MessagesTableView
			}
		],
		beforeHooks: [console.log]
	})

})();

"use strict";

Vue.use(Vuex);
Vue.use(VueRouter);
setTimeout(() => window.t = anime({
	targets: '.message-container',
	loop: 1,
	//easing: 'ease-in-out',
	duration: 2500,
	rotateX: 360,
	complete() {
		this.animatables.forEach(e => e.target.style.transform = null);
	}
}), 2500);

var AppComponents = (() => {

	let Components = {
		AppChatView: resolve => resolve({
			template: '#AppChatView',
			components: {
				MessagesContainer: resolve => resolve({
					template: '#MessagesContainer',
					props: {
						messages: {
							validator: value => (Array.isArray(value) &&
							(value.filter(m => m instanceof Message)
							 .length === value.length))
						}
					},
					delimiters: ['#{', '}'],
					components: {
						Message: resolve => resolve({
							template: '#Message',
							delimiters: [ '#{', '}' ],
							props: {
								messageData: {
									type: Object,
									required: true
								},
								id: Number
							},
							methods: {
								remove() {
									this.$store.commit('remove', this.id);
								}
							}
						})
					},
					data: () => ({ test: '' })
				}),
				WriteField: resolve => resolve({
					template: '#WriteField',
					data: () => ({
						message: ''
					}),
					methods: {
						addMessage() {
							this.$refs.input.focus();
							let text = this.message.trim();
							if(!!text)
								app.$store.dispatch(
									'addNewMessage',
									new Message(this.$store.state.userData.username, text)
								).then(() => {
									this.message = '';
									let ascroll = () => document.querySelector('#scroll').scrollIntoView(true);
									setTimeout(() => {
										for(let i = 0; i <= document.getElementById('msg-field').scrollHeight - document.querySelectorAll('.message-container')[this.$store.state.messages.length - 1].scrollHeight; i++)
											ascroll();
										document.querySelector('#msg-field').scrollTop = 9999 * document.querySelector('#msg-field').scrollHeight;
									}, 100);
								}).catch(console.error);
						}
					},
				})
			}
		}),
		MessagesTableView: resolve => resolve({
			data: () => ({
				keys: ['Id', 'Send', 'Text', 'Time', 'Seen']
			}),
			render(h) {
				return h('table', {
					attrs: {
						class: 'messages-table', border: '12'
					}
				},
				[
					h('thead',
						this.keys.map((key, u) => h('td',
							{ key: u },
							key)
						)
					),
					h('tbody',
					this.$store.state.messages.length == 0 ? [
						h('tr',
						[
							h('td', { style: { border: '0' } }), h('td', { style: { border: '0' } }),
							h('td', { style: { fontSize: '30px', width: 'inherit', display: 'inline-block', transform: 'translate(60px, 0)', border: '0' } }, 'No messages'),
							h('td', { style: { border: '0' } }), h('td', { style: { border: '0' } })
						])
					] : this.$store.state.messages.map(
						(message, i) => h('tr', { key: i }, [
							h('td',  i + 1),
							h('td', message.sender),
							h('td', { staticClass: 'text' }, message.text),
							h('td', message.time),
							h('td', message.seen || (this.$store.state.userData.username === message.sender ? ' . '.repeat(6).trim() : '——'))
						])
					)
					)
				])
			}
		}),
		AppProfileView: resolve=> resolve({
			delimiters: ['<#&', '%>'],
			template: '#ProfileView',

		})
	};


	Vue.directive('define-attributes', {
		bind(value) {
			if(!!value)
				Object.assign(this.el, value);
		},
		update(value) {
			Object.assign(this.el, value);
		}
	});

	Vue.directive('demo', {
		bind(el, binding, vnode) {
			let s = JSON.stringify;
			el.innerHTML =
			'name: '       + s(binding.name) + '<br>' +
			'value: '      + s(binding.value) + '<br>' +
			'expression: ' + s(binding.expression) + '<br>' +
			'argument: '   + s(binding.arg) + '<br>' +
			'modifiers: '  + s(binding.modifiers) + '<br>' +
			'vnode keys: ' + Object.keys(vnode).map(option => `${option}: ${vnode[option]}`).join('<br />')
		}
	});

	Vue.component('ExtraOption', {
		props: {
			optionData: {
				type: Object,
				required: true,
				default: {}
			},
			type: {
				type: String,
				default: "sidebar"
			},
			extraOptions: {
				type: Array,
				default: () => ([])
			}
		},
		render(h) {
			let classes = '';
			if(this.type !== 'custom')
				classes += `profile ${this.type}-option-type`;
			else
				classes += `profile ${this.extraOptions.find(e => e.target === '@root').classes.join(' ')}`;


			return h('div', Object.assign({
				domProps: { class: classes },
			}, this.optionData.events || {}),
			[
				h('img', {
					domProps: { src: this.optionData.imageSource }
				}),
				h('h4', this.optionData.optionText)
			]);
		}
	});

	Vue.component('AppHeader', {
		template: '#Header',
		components: {
			RouteSwitcher: {template:'#RouteSwitcher'}
		}
	});

	Vue.component('AppSidebar', {
		template: '#Sidebar',
		getters: {
			sidebarList() {
				/*try{*/return this.$store.state.sidebar.listType/*;} catch(e){return*/|| 'friends';//}
			},
			servers() {
				try{return this.$store.state.chats.servers.items;} catch(e){return [];}
			},
			friends() {
				try{return this.$store.state.chats.friends.items;} catch(e){return [];}
			},
			selectedServer() {
				let mt = {channels:[]};
				try{
					return this.sidebarList==='servers'?
						this.servers.filter(
						server=>server.id==
						this.$store.state.sidebar.selectedServerId
					):mt;} catch(e){return mt;}
			}
		},
		methods: {
			showCreateOptions(e) {}
		},
		components: {
			ServerChannel: {
				props: {
					channel: {
						type: Object,
						required: true
					}
				},
				data() {
					return { hasSubchannels: false };
				},
				render(h) {
					return h('div', [
						h('h3', [
							(this.hasSubchannels?h('span', '&gt;'):this._e()),
							h('b', '# '),
							this._v(this.channel.name)
						]),
						this.hasSubchannels?h('div',
						this.channel.subchannels.map(channel => h('h3', [
							h('b', '# '),
							this._v(channel.name)
						]))):
						this._e()
					]);
				},
				beforeCreate() {
					this.hasSubchannels=(!this.channel.subchannels?false:(this.channel.subchannels.length===0));
				}
			},
			Friend: {
				props: ['friendData'],
				staticRenderFns: [
					function(h) {
						let d = '../../chat_app/public/icons/ninja.svg';
						return h('div', [
							h('h3', [
								h('img',{attrs:{src:this.friendData.iconSrc||d}}),
								this._v(this.friendData.name)
							])
						]);
					}
				]
			}
		}
	});

	Vue.component('AppProfileView', {
		/*
		props: {
			userData: {
				type: Object,
				required: true
			},
			type: {
				type: String,
				required: false,
				default: 'big'
			}
		},*/
		template: '#MyProfile'/*
		render(h) {
			let self = this;
			return h('div', {
				domProps: { class: `${self.type}-profile-view profile` }
			},
			[
				h('div', {
					domProps: {
						class: 'profile-pic-and-on_off-line_hidden-indicator'
					}
				},
				[
					h('object', {
						attrs: {
							data: self.userData.profilePicSrc || DefaultProfilePicSrc,
							type: !!this.userData.profilePicSrc ? (this.userData.profilePicSrc.split('.').pop() === 'svg' ? this.userData.profilePicSrc.split('.').pop() + '+xml': this.userData.profilePicSrc.split('.').pop()) : 'img/svg+xml'
						}
					},
					[
						h('img', {
							attrs: {
								src: self.userData.profilePicSrc || DefaultProfilePicSrc,
								alt: self.picAlt || 'The pictute isn\'t avalible for the moment, check your network connection',
							}
						})
					]),
					h('svg', {
						class: {
							'am-online': self.status == 'online',
							'am-offline': self.status == 'offline',
							'am-hidden': self.status == 'hidden'
						}
					},
					[
						h('circle', { attrs: cirlceAttrs  })
					]),
				]),
				h('h4', { domProps: { textContent: self.userData.username, class: 'profile-username' } }),
				h('span', `#${self.userTag}`)
			])
		}*/
	});

	Vue.component('Ejs', {
		props: ['data', 'options', 'string'],
		render(h) {
			let ff = Vue.compile(ejs.render(this.string, this.data, this.options));
			return ff.staticRenderFns.length == 0 ? ff.render.call(app) : ff.staticRenderFns[0].call(app);
		}
	});

	return Components;

})();

var messages = [
	{
		"sender": "fabriciopashaj",
		"text": "hello",
		"time": "17: 38",
		"seen": /*new Date(Date.now() - 1500000)*/"20: 13"
	},
	{
		"sender": "fabriciopashaj",
		"text": "cpb",
		"time": "17: 38",
		"seen": "20: 13"
	},
	{
		"sender": "fabriciopashaj",
		"text": "ne pun je ??",
		"time": "17: 39",
		"seen": "20: 14"
	},
	{
		"sender":"__k_a_y_d_a__",
		"text": "hello",
		"time": "21: 35"
	},
	{
		"sender": "__k_a_y_d_a__",
		"text": "jo po rri",
		"time": "21: 36"
	},
	{
		"sender": "__k_a_y_d_a__",
		"text": "po ti ca po ben",
		"time": "21: 36"
	}
];

function formatTime(fstr, date) {
	let months = 'Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec'.split(', ');
	let days = ['Mon', 'Tue', 'Thu', '', 'Fri', 'Sat', 'Sun'];
	let d = date || new Date();
	let ms = fstr;
	ms = ms.replace(/hh/gi, d.getHours().toString().length === 1 ? '0' + d.getHours() : d.getHours().toString());
	ms = ms.replace(/dd/gi, days[d.getDay() + 1]);
	ms = ms.replace(/yyyy/gi, d.getFullYear());
	ms = ms.replace(/mm/gi, months[d.getMonth()]);
	ms = ms.replace(/min/gi, d.getMinutes().toString().length === 1 ? '0' + d.getMinutes() : d.getMinutes().toString());
	ms = ms.replace(/ss/gi, d.getSeconds());
	return ms;
} function Message(sender, text, time, seen) {
	this.sender = sender;
	this.text = text;
	this.seen = seen||(sender===userData.username?null:undefined);
	this.time = time||formatTime('hh: min');
}

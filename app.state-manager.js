"use strict";

var userData = {
	username: 'fabriciopashaj',
	tag: '#00000'
};

const store = ((Vue, Vuex, bubleSort, formatTime) => {

	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let days = ['Mon', 'Tue', 'Thu', '', 'Fri', 'Sat', 'Sun'];

	let mutations = () => ({
		add: (state, message) => {
			if(state.messages.length < Math.pow(8, 12))
				state.messages.push(message);
			else
				throw new RangeError(`The chat can't have more than ${Math.pow(8, 12)} messages`);
		},
		remove: (state, index) => state.messages.splice(index, 1),
		sortByTime: state => bubleSort(state.messages, (j, a) => new Date(a[j]).valueOf() < new Date(a[j + 1]).valueOf()),
		change: (state, data) => {
			for(let prop in data.props)
				Vue.set(state.messages[data.target], prop, data.props[prop]);
		},
		setAllSeen: state => {
			for(let msg of state.messages) {
				if(!!msg.seen) continue;
				Vue.set(msg, 'seen', formatTime('hh: min'));
			}
		},
		'load-messages': (state, messages) => Vue.set(state, 'messages', messages),
		clearMessages: state => Vue.set(state, 'messages', []),
		setNewMessage: (state, string) => Vue.set(state, 'newMessage', string)
	}),
			actions = () => ({

			});

	const store = new Vuex.Store({
		state: {
			messages: [],
			userData,
			currentRoute: '',
			routes: [
				{ path: '/messages', text: 'Messages' },
				{ path: '/messages-table', text: 'Messages Table' }
			]
		},
		mutations: {
			add: (state, message) => {
				if(state.messages.length < Math.pow(8, 12))
					state.messages.push(message);
				else
					throw new RangeError("The chat can't have more than "+Math.pow(8, 12)+" messages");
			},
			remove: (state, index) => state.messages.splice(index, 1),
			sortByTime: state => bubleSort(state.messages, (j, a) => new Date(a[j]).valueOf() < new Date(a[j + 1]).valueOf()),
			change: (state, data) => {
				for(let prop in data.props)
					Vue.set(state.messages[data.target], prop, data.props[prop]);
			},
			setAllSeen: state => {
				for(let msg of state.messages) {
					if(!!msg.seen) continue;
					Vue.set(msg, 'seen', formatTime('hh: min'));
				}
			},
			'load-messages': (state, messages) => Vue.set(state, 'messages', messages),
			clearMessages: state => Vue.set(state, 'messages', []),
			changeRoute: (state, componentsName) => Vue.set(state, 'currentRoute', componentsName)
		},
		actions: {
			clearAllMessages: ctx => ctx.commit(`clearMessages`),
			addNewMessage: (ctx, message) => new Promise((resolve, reject) => {
				try {
					setTimeout(resolve, 250);
					ctx.commit('add', message);
				} catch(e) {
					reject(''+e);
				}
			})
		},
		modules: {
			sidebar: {
				namespaced: true,
				state: {
					isOpen: true,
					listType: 'friends',
					selectedServerId: null
				},
				mutations: {
					setState: (state, open_state)=>(open_state==='open'||open_state==='closed')?(open_state==='open'):null
				}
			},
			chats: {
				namespaced: true,
				modules: {
					friends: {
						namespaced: true,
						state: {
							items: [
								{
									name: 'MajlindaSinanajPashaj',
									type: 'account',
									id: 1,
									messages: [
										new Message(`fabriciopashaj`, `o ma, ca ben`, '12: 44', '12: 53'),
										new Message(`majlinda_pashaj`, `po rri, ca do bej`, '12: 55'),
										new Message(`fabriciopashaj`, `e mbarove punen ??`, '12: 55', '13: 02'),
										new Message(`majlinda_pashaj`, `ja, edhe nje cik kam`, '13: 14'),
										new Message(`fabriciopashaj`, `po mir pastaj, mbaroje`, '13: 15', '13: 20')
									],
									newMessage: ''
								},
								{
									name: '__k_a_y_d_a__',
									type: 'account',
									id: 2,
									messages: messages.map(message => new Message(
										message.sender,
										message.text,
										message.time,
										message.seen
									)),
									newMessage: ''
								}
							]
						}
					},
					servers: {namespaced:!0,state:{items:[]}}
				}
			}
		},
		strict: !0
	});
	return store;
})(Vue, Vuex, bubleSort, formatTime);
function bubleSort(array, validator) {
	for(let i in array) {
		for(let j = 0; j < array.length - 1; j++) {
			if(validator(j, array))
				swap(array, j, j + 1)
		}
	}
	return array;
}
/*
	 * @template AT
	 * @param {AT[]} array
	 * @param {number|string} a
	 * @param {number|string} b
	 * @return {AT[]}
	 */
function swap(array, a, b) {
	let temp = array[a];
	array[a] = array[b];
	array[b] = temp;
}
(() => {
	window.chr = () => app.$store.commit('changeRoute', 'MessagesTableView');
	setTimeout(() => app.$store.commit(`changeRoute`, `AppChatView`), 20);
})();
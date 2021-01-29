import bank from './bank.js'

export default  function init(store) {
	if (!store.hasModule(['chain','cosmos'])) {	
		store.registerModule(['chain', 'cosmos'],{namespaced:true})	
	}
	store.registerModule(['chain', 'cosmos', 'bank'], bank)
	store.subscribe(mutation => {
		if (mutation.type == 'chain/common/env/INITIALIZE_WS_COMPLETE') {
			store.dispatch('chain/cosmos/bank/init', null, { root: true })
		}
		if (mutation.type == 'chain/common/wallet/SET_ACTIVE_CLIENT') {
			store.dispatch('chain/cosmos/bank/registerTypes', null, { root: true })
		}
	})
}
<template>
	<div class="sp-status-ws">
		<SpStatusLED
			:status="nodeStatus"
			:alt="'WebSocket ' + wsNode"
			:title="'WebSocket ' + wsNode"
		/>
		<div
			class="sp-status-ws__text"
			v-if="showText"
			:alt="'WebSocket ' + wsNode"
			:title="'WebSocket ' + wsNode"
		>
			WebSocket
		</div>
	</div>
</template>
<script>
import SpStatusLED from '../SpStatusLED'

export default {
	name: 'SpStatusWS',
	components: {
		SpStatusLED
	},
	props: {
		showText: {
			type: Boolean
		}
	},
	computed: {
		wsNode() {
			return this.$store.getters['common/env/apiWS']
		},
		nodeStatus() {
			return this.$store.getters['common/env/wsConnected']
		}
	}
}
</script>

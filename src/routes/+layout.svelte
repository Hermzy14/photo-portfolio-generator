<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<style>
	:global {
		section {
			font-family: sans-serif;
			background-color: azure;
		}
	}
</style>

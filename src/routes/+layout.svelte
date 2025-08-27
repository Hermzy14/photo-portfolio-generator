<script lang="ts">
	let { children } = $props();
</script>

{@render children()}

<style>
	:global {
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}

		section {
			display: grid;
			place-content: center;
			font-family: sans-serif;
			background-color: azure;
			height: 100dvh;
			width: calc(100dvw-10dvw);
			padding: 0 10dvw;
		}

		input {
			border: 1px solid black;
			border-radius: 8px;
			padding: 0.5rem 1rem;
			width: 15rem;
		}

		.error {
			color: red;
		}

		.btn {
			background-color: antiquewhite;
			color: black;
			text-decoration: none;
			text-align: center;
			border: 1px solid black;
			border-radius: 8px;
			padding: 0.5rem 1rem;
			cursor: pointer;
			width: 15rem;
			justify-self: center;
		}
		.btn:hover {
			background-color: rgb(227, 203, 173);
		}
	}
</style>

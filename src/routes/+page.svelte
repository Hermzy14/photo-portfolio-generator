<script lang="ts">
	import { isSession } from '$lib/supabase';
	import { onMount } from 'svelte';

	let sessionExists: boolean = false;

	onMount(async () => {
		sessionExists = await isSession();
		// if session exists we redirect to dashboard
		if (sessionExists) {
			window.location.href = '/dashboard';
		}
	});
</script>

{#if !sessionExists}
	<section id="landing-screen">
		<h1>Create collections, add images, <br /> and share with anyone you want!</h1>
		<p>A platform where likes and comments don't exist.</p>
		<a href="/login" id="log-in-btn">Log in</a>
	</section>
{/if}

<style>
	#landing-screen {
		height: 100dvh;
		display: grid;
		place-content: center;
	}

	#log-in-btn {
		background-color: antiquewhite;
		color: black;
		text-decoration: none;
		text-align: center;
		border: 1px solid black;
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
	}
	#log-in-btn:hover {
		background-color: rgb(227, 203, 173);
	}
</style>

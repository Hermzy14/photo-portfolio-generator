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
		<a href="/login" class="btn">Log in</a>
	</section>
{/if}

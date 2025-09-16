<script lang="ts">
	import { isSession } from '$lib/supabase';
	import { onMount } from 'svelte';
	import '../app.css';
	import Hero from '$lib/components/Hero.svelte';

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
	<!-- <section id="landing-screen" class="hero-content">
		<h1 class="text-5xl font-bold">
			Create collections, add images, <br /> and share with anyone you want!
		</h1>
		<p>A platform where likes and comments don't exist.</p>
		<a href="/login" class="btn btn-primary">Log in</a>
	</section> -->
	<Hero
		title="Create collections, add images, and share with anyone you want!"
		content="A platform where likes and comments don't exist."
		slug="/login"
		buttonText="Log in"
	/>
{/if}

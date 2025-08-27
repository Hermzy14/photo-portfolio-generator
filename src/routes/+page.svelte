<!-- TODO: Create a check to see if user is authenticated, if they are, navigate to dashboard -->
<script lang="ts">
	import { isSession } from '$lib/supabase';
	import { redirect } from '@sveltejs/kit';
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
	<a href="/login">Log in</a>
{/if}

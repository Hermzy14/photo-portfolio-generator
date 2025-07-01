<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { onMount } from 'svelte';

	let username: string | null = null;

	onMount(async () => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (user) {
			username = user.user_metadata.username || null;
		}
	});

	async function handleSignOut() {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error('Sign out error:', error.message);
		} else {
			// Redirect to login page after sign out
			window.location.href = '/login';
		}
	}
</script>

<div>
	<h1>Welcome to the Dashboard</h1>
	{#if username}
		<p>Hello, {username}!</p>
		<button onclick={handleSignOut}>Sign out</button>
	{:else}
		<p>Please log in to see your dashboard.</p>
		<p>
			<a href="/login">Log in</a> | <a href="/signup">Sign up</a>
		</p>
	{/if}
</div>

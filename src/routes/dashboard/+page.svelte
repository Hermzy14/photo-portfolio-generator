<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getImageUrl } from '$lib/imageUpload';
	import { onMount } from 'svelte';

	let username: string | null = null;
	let collections = [];

	onMount(async () => {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (user) {
			// User is authenticated, set user data
			username = user.user_metadata.username || null;
		}

		const { data, error } = await supabase
			.from('collections')
			.select('*, images(*)')
			.eq('user_id', user?.id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('Error fetching collections:', error.message);
		} else {
			// Store collections in a reactive variable
			collections = data || [];
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
		{#if collections.length > 0}
			<div>
				<h1>My Collections</h1>
				<a href="/collections/new">Create new collection</a>
			</div>
			<ul>
				{#each collections as collection}
					{#if collection.title}
						<h2>{collection.title}</h2>
					{/if}

					{#if collection.description}
						<p>{collection.description}</p>
					{/if}

					{#if collection.images && collection.images.length > 0}
						<img src={getImageUrl(collection.images[0].file_path)} alt={collection.title} />

						<a href="/collections/{collection.id}">Edit</a>
						<a href="/collection/{collection.slug}">View</a>
					{:else}
						<span>No images</span>
						<a href="/collections/{collection.id}">Add an image</a>
					{/if}
				{/each}
			</ul>
		{:else}
			<p>You have no collections yet.</p>
			<p>
				<a href="/collections/new">Create your first collection</a>
			</p>
		{/if}
	{:else}
		<p>Please log in to see your dashboard.</p>
		<p>
			<a href="/login">Log in</a> | <a href="/signup">Sign up</a>
		</p>
	{/if}
</div>

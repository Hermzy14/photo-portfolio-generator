<script lang="ts">
	import { supabase } from '$lib/supabase';
	import { getImageUrl } from '$lib/imageUpload';
	import { onMount } from 'svelte';

	let username: string | null = null;
	let collections: any[] = [];

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

<main id="dashboard">
	{#if username}
		<nav>
			<h1>Welcome to the Dashboard</h1>
			<p>Hello, {username}!</p>
			<button onclick={handleSignOut} class="btn">Sign out</button>
		</nav>

		<section id="dashboard-collection">
			{#if collections.length > 0}
				<div id="collection-title-wrapper">
					<h1>My Collections</h1>
					<a href="/collections/new" class="btn">Create new collection</a>
				</div>
				{#each collections as collection}
					<div class="collection">
						{#if collection.title}
							<h2>{collection.title}</h2>
						{/if}

						{#if collection.description}
							<p>{collection.description}</p>
						{/if}

						{#if collection.images && collection.images.length > 0}
							<div class="images-container">
								{#each collection.images as image}
									<img
										src={getImageUrl(image.file_path)}
										alt={collection.title}
										class="collection-images"
									/>
								{/each}
							</div>
							<div class="image-edit-view">
								<a href="/collections/{collection.id}" class="btn">Edit</a>
								<a href="/collection/{collection.slug}" target="_blank" class="btn">View</a>
							</div>
						{:else}
							<span>No images</span>
							<a href="/collections/{collection.id}">Add an image</a>
						{/if}
					</div>
				{/each}
			{:else}
				<div id="no-collection-cta">
					<h1>You have no collections yet.</h1>
					<p>
						<a href="/collections/new" class="btn">Create your first collection</a>
					</p>
				</div>
			{/if}
		</section>
	{:else}
		<p>Please log in to see your dashboard.</p>
		<p>
			<a href="/login">Log in</a> | <a href="/signup">Sign up</a>
		</p>
	{/if}
</main>

<style>
	nav {
		display: flex;
		justify-content: space-evenly;
		padding: 2rem;
		background-color: rgb(212, 228, 228);
		border-bottom: 1px solid black;
	}

	#collection-title-wrapper {
		display: flex;
		flex-direction: column;
	}

	#dashboard-collection {
		gap: 1rem;
		height: auto;
		padding: 2rem 0;
	}

	.collection {
		background-color: whitesmoke;
		border: 1px solid black;
		border-radius: 8px;
		padding: 1rem;
		max-width: 50dvw;
	}

	.images-container {
		display: flex;
		flex-wrap: nowrap;
		gap: 1rem;
		overflow-x: auto;
		white-space: nowrap;
	}

	.collection-images {
		width: 20dvw;
		height: 20dvw;
		object-fit: cover;
		border: 1px solid black;
		border-radius: 8px;
		margin: 1rem 0 0.25rem 0;
	}

	.image-edit-view {
		margin-top: 1rem;
	}

	#no-collection-cta {
		height: calc(100dvh - 8rem - 64px);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}
</style>

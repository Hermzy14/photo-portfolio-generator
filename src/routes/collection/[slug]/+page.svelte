<script lang="ts">
	import { page } from '$app/stores';
	import { getCollectionBySlug } from '$lib/collections';
	import { getImageUrl } from '$lib/imageUpload';
	import { onMount } from 'svelte';

	let collectionData: any = null;
	let errorMessage = '';
	let slug = $page.params.slug;

	onMount(async () => {
		try {
			collectionData = await getCollectionBySlug(slug);
			if (!collectionData) {
				throw new Error('Collection not found');
			}
		} catch (error) {
			console.error('Error fetching collection:', error);
			errorMessage =
				'An error occurred while fetching the collection. Likely the collection is private or does not exist.';
		}
	});
</script>

<section id="collection-view">
	{#if errorMessage}
		<p class="error">{errorMessage}</p>
	{:else if collectionData}
		<h1>{collectionData.title}</h1>
		<p>{collectionData.description}</p>
		{#if collectionData.images && collectionData.images.length > 0}
			<div class="image-grid">
				{#each collectionData.images as image}
					<img src={getImageUrl(image.file_path)} alt={image.title} />
				{/each}
			</div>
		{:else}
			<p>No images available in this collection.</p>
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}
</section>

<style>
	#collection-view {
		height: auto;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.image-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		width: 100%;
		margin-top: 1rem;
	}

	.image-grid > img {
		max-width: 30dvw;
		aspect-ratio: auto;
		object-fit: contain;
	}
</style>

<script lang="ts">
	import { page } from '$app/stores';
	import { updateCollection, deleteCollection, getCollectionById } from '$lib/collections';
	import { getImageUrl, uploadImage } from '$lib/imageUpload';
	import { supabase, isSession } from '$lib/supabase';
	// Remove image from collection
	async function handleRemoveImage(imageId: string, filePath: string) {
		try {
			// Remove from storage
			await supabase.storage.from('portfolio-images').remove([filePath]);
			// Remove from images table
			await supabase.from('images').delete().eq('id', imageId);
			// Remove from local state
			collectionData.images = collectionData.images.filter((img: any) => img.id !== imageId);
			// Also update data.images if present (for UI)
			if (data && data.images) {
				data.images = data.images.filter((img: any) => img.id !== imageId);
			}
		} catch (error) {
			console.error('Failed to remove image:', error);
		}
	}
	import { onMount } from 'svelte';

	// Collection ID from the route
	$: collectionId = $page.params.id;

	let collectionData = {
		title: '',
		description: '',
		isPublic: false,
		images: []
	};

	let userId: string | null = null;
	let notAuthorized = false;

	let isSaving = false;
	let saveMessage = '';

	// Fetch current collection
	let data: any = null;
	let errorMessage = '';

	onMount(async () => {
		// 1. Check if user is logged in
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) {
			window.location.href = '/login';
			return;
		}
		userId = user.id;

		try {
			data = await getCollectionById(collectionId);
			// 2. Check ownership
			if (!data || data.user_id !== userId) {
				notAuthorized = true;
				return;
			}
			// Initialize editable fields
			collectionData.title = data.title;
			collectionData.description = data.description;
			collectionData.isPublic = data.is_public;
			collectionData.images = data.images || [];
		} catch (error) {
			console.error(error);
			errorMessage = 'An error occured while fetching collection.';
		}
	});

	// Function to handle image upload
	async function handleImageChange(event: any) {
		const files = event.target.files;
		if (files && files.length > 0) {
			for (const file of files) {
				try {
					const imageUrl = await uploadImage(file, collectionId);
					collectionData.images.push(imageUrl);
				} catch (error) {
					console.error('Image upload failed:', error);
				}
			}
		}
	}

	// Save updated collection
	async function handleSave() {
		isSaving = true;
		saveMessage = '';
		try {
			await updateCollection(collectionId, {
				title: collectionData.title,
				description: collectionData.description,
				is_public: collectionData.isPublic
			});
			saveMessage = 'Collection updated!';
			// Optionally, refresh data
			data.title = collectionData.title;
			data.description = collectionData.description;
			data.is_public = collectionData.isPublic;
		} catch (error) {
			saveMessage = 'Failed to update collection.';
			console.error(error);
		} finally {
			isSaving = false;
		}
	}

	// Displays a confirmation modal for user to confirm deletion of collection
	let showDeleteConfirm = false;
	function confirmDelete() {
		showDeleteConfirm = true;
	}
	function cancelDelete() {
		showDeleteConfirm = false;
	}
	function confirmDeleteAction() {
		showDeleteConfirm = false;
		handleDeleteCollection();
	}

	// handle delete collection
	async function handleDeleteCollection() {
		try {
			const { success } = await deleteCollection(collectionId);
			if (success) {
				window.location.href = '/dashboard';
			}
		} catch (error) {
			console.error('Unable to delete collection: ', error);
		}
	}
</script>

<section id="collection-edit">
	<a class="btn" href="/dashboard">Go back to Dashboard</a>
	{#if notAuthorized}
		<p class="error">You are not authorized to edit this collection.</p>
	{:else if errorMessage}
		<p class="error">{errorMessage}</p>
	{:else if data}
		<!-- Collection title editable field -->
		<div class="collection-edit-section">
			<h2>Title</h2>
			<input type="text" bind:value={collectionData.title} class="input" />
		</div>

		<!-- Collection description editable field -->
		<div class="collection-edit-section">
			<h2>Description</h2>
			<textarea bind:value={collectionData.description} class="input" rows="3"></textarea>
		</div>

		<!-- Add and remove images -->
		<div class="collection-edit-section">
			<h2>Images</h2>
			<div id="images-wrapper">
				{#each data.images as image (image.id)}
					<div class="image-container">
						<img class="collection-images" src={getImageUrl(image.file_path)} alt={image.title} />
						<button class="btn" onclick={() => handleRemoveImage(image.id, image.file_path)}
							>Remove</button
						>
					</div>
				{/each}
			</div>
			<input type="file" accept="image/*" multiple onchange={handleImageChange} />
		</div>

		<button
			class="btn"
			onclick={handleSave}
			disabled={isSaving}
			style="background-color: lightgreen;">{isSaving ? 'Saving...' : 'Save'}</button
		>
		{#if saveMessage}
			<span>{saveMessage}</span>
		{/if}
		<button onclick={confirmDelete} class="btn" id="delete-btn">Delete collection</button>

		{#if showDeleteConfirm}
			<div class="modal-backdrop">
				<div class="modal">
					<p>Are you sure you want to delete this collection?</p>
					<button class="btn" onclick={confirmDeleteAction}>Yes, delete</button>
					<button class="btn" onclick={cancelDelete}>Cancel</button>
				</div>
			</div>
		{/if}
	{:else}
		<p>Loading...</p>
	{/if}
</section>

<style>
	#collection-edit {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		gap: 1rem;
		padding: 1rem;
	}

	.collection-edit-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 1px solid black;
		border-radius: 8px;
		padding: 1rem;
	}

	#images-wrapper {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.image-container {
		display: flex;
		flex-direction: column;
	}

	.collection-images {
		width: 20dvw;
		height: 20dvw;
		object-fit: cover;
		border: 1px solid black;
		border-radius: 8px;
		margin: 1rem 0 0.25rem 0;
	}

	#delete-btn {
		background-color: lightcoral;
	}

	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: azure;
		padding: 2rem;
		border-radius: 10px;
		box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 300px;
		align-items: center;
	}
</style>

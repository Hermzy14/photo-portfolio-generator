<script lang="ts">
	//TODO: Make sure only authenticated users can access this page
	import { page } from '$app/stores';
	import { updateCollection, deleteCollection } from '$lib/collections';
	import { uploadImage } from '$lib/imageUpload';
	import { onMount } from 'svelte';

	// Collection ID from the route
	$: collectionId = $page.params.id;
	let collectionData = {
		title: '',
		description: '',
		isPublic: false,
		images: []
	};

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
	<!-- Collection title with an edit button/field -->
	<div class="collection-edit-section">
		<h1>Collection Title</h1>
		<button class="btn">Edit</button>
	</div>

	<!-- Collection description with an edit button/field -->
	<div class="collection-edit-section">
		<p>Collection description goes here.</p>
		<button class="btn">Edit</button>
	</div>

	<!-- Update if public or not -->
	<div class="collection-edit-section">
		<label>
			<input type="checkbox" checked />
			Public Collection
		</label>
	</div>

	<!-- Add image button -->
	<div class="collection-edit-section">
		<input type="file" accept="image/*" multiple onchange={handleImageChange} />
	</div>

	<a href="/dashboard" class="btn">Save</a>
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
		gap: 1rem;
		border: 1px solid black;
		border-radius: 8px;
		padding: 1rem;
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

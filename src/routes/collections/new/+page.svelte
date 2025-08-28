<script lang="ts">
	// TODO: Make sure only authenticated users can access this page
	import { createCollection } from '$lib/collections';
	import { uploadImage } from '$lib/imageUpload';

	let title: string = '';
	let description: string = '';
	let error: string = '';
	let selectedFiles: FileList | null = null;
	let createStatus: string = 'Create Collection';

	/**
	 * Handles the creation of a new collection.
	 * @returns {Promise<void>} - A promise that resolves when the collection is created.
	 */
	async function handleCreateCollection() {
		try {
			createStatus = 'Creating Collection...';
			const {
				success,
				collection,
				error: createError
			} = await createCollection(title, description, true);

			if (createError || !success || !collection) {
				error = createError || 'Failed to create collection.';
				createStatus = 'Create Collection';
				return;
			}

			// Upload all selected images if any
			if (selectedFiles && selectedFiles.length > 0) {
				for (const file of Array.from(selectedFiles)) {
					try {
						await uploadImage(file, collection.id);
					} catch (imgErr) {
						console.error('Image upload failed:', imgErr);
					}
				}
			}

			// Redirect to the new collection page or dashboard
			window.location.href = '/dashboard';
		} catch (error) {
			console.error('Error creating collection:', error);
		}
	}

	function handleImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		selectedFiles = input.files;
	}
</script>

<section id="new-collection-section">
	<input type="text" placeholder="Collection Title" bind:value={title} />
	<textarea placeholder="Collection Description" bind:value={description}></textarea>
	<input type="file" accept="image/*" multiple onchange={handleImageChange} />
	<button onclick={handleCreateCollection} class="btn">{createStatus}</button>
	{#if error}
		<p>{error}</p>
	{/if}
</section>

<style>
	#new-collection-section {
		gap: 1rem;
	}
</style>

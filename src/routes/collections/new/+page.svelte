<script lang="ts">
	// TODO: Make sure only authenticated users can access this page
	import { createCollection } from '$lib/collections';
	import { uploadImage } from '$lib/imageUpload';

	let title: string = '';
	let description: string = '';
	let isPublic: boolean = false;
	let error: string = '';
	let selectedFiles: FileList | null = null;

	/**
	 * Handles the creation of a new collection.
	 * @returns {Promise<void>} - A promise that resolves when the collection is created.
	 */
	async function handleCreateCollection() {
		try {
			const {
				success,
				collection,
				error: createError
			} = await createCollection(title, description, isPublic);

			if (createError || !success || !collection) {
				error = createError || 'Failed to create collection.';
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

<input type="text" placeholder="Collection Title" bind:value={title} />
<textarea placeholder="Collection Description" bind:value={description}></textarea>
<input type="checkbox" name="is-public-checkbox" id="public-checkbox" bind:checked={isPublic} />
<label for="public-checkbox">Make this collection public</label>
<input type="file" accept="image/*" multiple onchange={handleImageChange} />
<button onclick={handleCreateCollection}>Create Collection</button>
{#if error}
	<p>{error}</p>
{/if}

<script lang="ts">
	import { createCollection } from '$lib/collections';

	let title: string = '';
	let description: string = '';
	let isPublic: boolean = false;
	let error: string = '';

	/**
	 * Handles the creation of a new collection.
	 * @returns {Promise<void>} - A promise that resolves when the collection is created.
	 */
	async function handleCreateCollection() {
		try {
			const { error: createError } = await createCollection(title, description, isPublic);

			if (createError) {
				error = createError;
			} else {
				// Redirect to the new collection page or dashboard
				window.location.href = '/dashboard';
			}
		} catch (error) {
			console.error('Error creating collection:', error);
		}
	}
</script>

<input type="text" placeholder="Collection Title" bind:value={title} />
<textarea placeholder="Collection Description" bind:value={description}></textarea>
<input type="checkbox" name="is-public-checkbox" id="public-checkbox" bind:checked={isPublic} />
<label for="public-checkbox">Make this collection public</label>
<button onclick={handleCreateCollection}>Create Collection</button>
{#if error}
	<p>{error}</p>
{/if}

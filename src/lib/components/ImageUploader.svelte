<script>
	import { createEventDispatcher } from 'svelte';
	import { uploadImage } from '$lib/imageUpload';

	export let collectionId;
	export let multiple = false;
	export let accept = 'image/*';

	const dispatch = createEventDispatcher();

	let uploading = false;
	let uploadProgress = 0;
	let dragOver = false;
	let fileInput;

	/**
	 * Handles the file selection from the input or drag-and-drop.
	 * @param event - The event triggered by file selection or drop.
	 */
	async function handleFileSelect(event) {
		const files = event.target.files || event.dataTransfer?.files;
		if (!files?.length) return; // No files selected

		await uploadFiles(Array.from(files));
	}

	/**
	 * Handles the upload of files.
	 * @param files - The array of files to upload.
	 */
	async function uploadFiles(files) {
		uploading = true;
		uploadProgress = 0;

		try {
			const results = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				uploadProgress = Math.round(((i + 1) / files.length) * 100);

				const result = await uploadImage(file, collectionId);
				results.push(result);

				if (result.success) {
					dispatch('imageUploaded', result);
				} else {
					dispatch('uploadError', { error: result.error, file: file.name });
				}
			}

			uploadProgress = 100;
			dispatch('uploadComplete', { results });
		} catch (error) {
			dispatch('uploadError', { error: error.message });
		} finally {
			uploading = false;
			uploadProgress = 0;
			if (fileInput) fileInput.value = ''; // Reset file input
		}
	}

	/**
	 * Handles the drop event to allow dropping files.
	 * @param event - The drag event.
	 */
	function handleDrop(event) {
		event.preventDefault();
		dragOver = false;
		handleFileSelect(event);
	}

	/**
	 * Handles the drag over event.
	 * @param event - The drag event.
	 */
	function handleDragOver(event) {
		event.preventDefault();
		dragOver = true;
	}

	/**
	 * Handles the drag leave event.
	 * @param event - The drag event.
	 */
	function handleDragLeave(event) {
		event.preventDefault();
		dragOver = false;
	}
</script>

<div class="upload-container">
	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		onchange={handleFileSelect}
		disabled={uploading}
		class="hidden"
		id="file-input"
	/>

	<div
		class="drop-zone"
		class:drag-over={dragOver}
		class:uploading
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		role="button"
		tabindex="0"
		onclick={() => fileInput?.click()}
		onkeydown={(e) => e.key === 'Enter' && fileInput?.click()}
	>
		{#if uploading}
			<div class="upload-status">
				<div class="spinner"></div>
				<p>Uploading... {uploadProgress}%</p>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {uploadProgress}%"></div>
				</div>
			</div>
		{:else}
			<div class="upload-prompt">
				<svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
					/>
				</svg>
				<p class="main-text">Click to upload or drag and drop</p>
				<p class="sub-text">PNG, JPG, GIF up to 10MB</p>
			</div>
		{/if}
	</div>
</div>

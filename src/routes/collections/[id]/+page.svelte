<script>
	import { page } from '$app/stores';
	import { updateCollection } from '$lib/collections';
	import { uploadImage } from '$lib/imageUpload';

	// Collection ID from the route
	$: collectionId = $page.params.id;
	let collectionData = {
		title: '',
		description: '',
		isPublic: false,
		images: []
	};

	// Function to handle image upload
	async function handleImageChange(event) {
		const file = event.target.files[0];
		if (file) {
			try {
				const imageUrl = await uploadImage(file, collectionId);
				collectionData.images.push(imageUrl);
			} catch (error) {
				console.error('Image upload failed:', error);
			}
		}
	}
</script>

<!-- Collection title with an edit button/field -->
<div>
	<h1>Collection Title</h1>
	<button>Edit</button>
</div>

<!-- Collection description with an edit button/field -->
<div>
	<p>Collection description goes here.</p>
	<button>Edit</button>
</div>

<!-- Update if public or not -->
<div>
	<label>
		<input type="checkbox" checked />
		Public Collection
	</label>
</div>

<!-- Add image button -->
<div>
	<input type="file" accept="image/*" onchange={handleImageChange} />
</div>
<a href="/dashboard">Save</a>

import { supabase } from '$lib/supabase';

/**
 * Creates a new collection.
 * @param {string} title - The title of the collection.
 * @param {string} description - The description of the collection.
 * @param {boolean} isPublic - Whether the collection is public or private.
 * @return {Promise<{ success: boolean, collection?: object, error?: string }>} - The result of the creation operation.
 * @throws {Error} - If there is an error during the creation process.
 */
export async function createCollection(
	title: string,
	description: string = '',
	ispublic: boolean = true
) {
	try {
		const {
			data: { user }
		} = await supabase.auth.getUser();
		if (!user) {
			throw new Error('User not authenticated');
		}

		const slug = generateSlug(title);

		const { data, error } = await supabase
			.from('collections')
			.insert({
				title,
				slug,
				description,
				is_public: ispublic,
				user_id: user.id
			})
			.select()
			.single();

		if (error) {
			throw new Error(`Error creating collection: ${error.message}`);
		}

		return { success: true, collection: data };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Get a user's collections.
 * @param {string} userId - The ID of the user whose collections to retrieve.
 * @return {Promise<object[]>} - An array of collections belonging to the user.
 * @throws {Error} - If there is an error fetching the collections.
 */
export async function getUserCollections(userId: string) {
	try {
		const { data, error } = await supabase
			.from('collections')
			.select(`*, images(count)`)
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (error) {
			throw new Error(`Error fetching collections: ${error.message}`);
		}

		return data;
	} catch (error) {
		console.error('Error fetching user collections:', error);
	}
}

/**
 * Get a collection by its slug.
 * @param {string} slug - The slug of the collection to retrieve.
 * @param {boolean} includePrivate - Whether to include private collections.
 * @return {Promise<object>} - The collection data.
 * @throws {Error} - If there is an error fetching the collection or if the collection is not found.
 */
export async function getCollectionBySlug(slug: string, includePrivate: boolean = false) {
	let query = supabase
		.from('collections')
		.select(
			`
            *, 
            images(
				id,
				file_path,
				file_name,
				title,
				description,
				sort_order
            )
        `
		)
		.eq('slug', slug);

	if (!includePrivate) {
		query = query.eq('is_public', true);
	}

	const { data, error } = await query.single();

	if (error) {
		console.error(`Error fetching collection with slug "${slug}":`, error);
		throw new Error(`Collection not found or error fetching collection: ${error.message}`);
	}

	// Sort images by sort_order
	if (data.images) {
		data.images.sort((a: any, b: any) => a.sort_order - b.sort_order);
	}

	return data;
}

/**
 * Updates a collection.
 * @param {string} id - The ID of the collection to update.
 * @param {object} updates - The updates to apply to the collection.
 * @param {string} [updates.title] - The new title of the collection.
 * @param {string} [updates.description] - The new description of the collection.
 * @param {boolean} [updates.is_public] - Whether the collection should be public or private.
 * @return {Promise<object>} - The updated collection data.
 * @throws {Error} - If there is an error updating the collection or if the collection is not found.
 */
export async function updateCollection(
	id: string,
	updates: { title?: string; description?: string; is_public?: boolean }
) {
	const { data, error } = await supabase
		.from('collections')
		.update({
			...updates,
			updated_at: new Date().toISOString()
		})
		.eq('id', id)
		.select()
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return data;
}

/**
 * Deletes a collection and its associated images.
 * @param id - The ID of the collection to delete.
 * @returns {Promise<{ success: boolean, error?: string }>} - The result of the deletion operation.
 * @throws {Error} - If there is an error deleting the collection or if the collection is not found.
 */
export async function deleteCollection(id: string): Promise<{ success: boolean; error?: string }> {
	try {
		// Get all images in the collection
		const { data: images } = await supabase
			.from('images')
			.select('file_path')
			.eq('collection_id', id);

		// Delete all images from storage
		if (images && images.length > 0) {
			const filePaths = images.map((img) => img.file_path);
			await supabase.storage.from('portfolio-images').remove(filePaths);
		}

		// Delete collection (images will be deleted via CASCADE)
		const { error } = await supabase.from('collections').delete().eq('id', id);

		if (error) {
			throw new Error(error.message);
		}

		return { success: true };
	} catch (error) {
		return { success: false, error: (error as Error).message };
	}
}

/**
 * Generates a URL-friendly slug from a title.
 * @param {string} title - The title to generate a slug from.
 * @return {string} - The generated slug.
 */
function generateSlug(title: string): string {
	return (
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '') +
		'-' +
		Math.random().toString(36).substring(2, 8)
	);
}

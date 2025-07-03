import { supabase } from '$lib/supabase';

/**
 * Uploads an image to the Supabase storage bucket.
 * @param {File} file - The image file to upload.
 * @param {string} collectionId - The ID of the collection to which the image belongs
 * @return {Promise<{ success: boolean, imageData?: object, filePath?: string, error?: string }>} - The result of the upload operation.
 * @throws {Error} - If the file is invalid or if there is an error during the upload or database insertion.
 */
export async function uploadImage(file: File, collectionId: string) {
	try {
		// Validate the file
		if (!file || !file.type.startsWith('image/')) {
			throw new Error('Invalid file type. Please upload an image.');
		}

		// TODO: Validate image size

		// Generate a unique file name
		const fileExtension = file.name.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
		const filePath = `collections/${collectionId}/${fileName}`;

		// Upload the file to Supabase storage
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('portfolio-images')
			.upload(filePath, file, {
				cacheControl: '3600', // Cache for 1 hour
				upsert: false // Set to true if you want to overwrite existing files with the same name
			});

		if (uploadError) {
			throw new Error(`Error uploading image: ${uploadError.message}`);
		}

		// Save image metadata to the database
		const { data: imageData, error: dbError } = await supabase
			.from('images')
			.insert({
				collection_id: collectionId,
				file_path: uploadData.path,
				file_name: file.name, // TODO: Store original file name or the generated file name?
				file_size: file.size,
				title: file.name.split('.')[0], // Use the file name without extension as the title
				sort_order: 0
			})
			.select()
			.single();

		if (dbError) {
			// Clean up the uploaded file if database insertion fails
			await supabase.storage.from('portfolio-images').remove([uploadData.path]);
			throw new Error(`Error saving image metadata: ${dbError.message}`);
		}

		return {
			success: true,
			imageData,
			filePath: uploadData.path
		};
	} catch (error) {
		console.error('Image upload error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred.'
		};
	}
}

/**
 * Gets the public URL for the image.
 * @param {string} filePath - The path of the image in the storage bucket.
 * @return {string} - The public URL of the image.
 * @throws {Error} - If the file path is not provided.
 */
export function getImageUrl(filePath: string): string {
	if (!filePath) {
		throw new Error('File path is required to get the image URL.');
	}

	const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);

	return data.publicUrl;
}

/**
 * Deletes an image from the storage and database.
 * @param {string} imageId - The ID of the image to delete.
 * @return {Promise<{ success: boolean, error?: string }>} - The result of the deletion operation.
 * @throws {Error} - If there is an error fetching the image data, deleting from storage, or deleting from the database.
 */
export async function deleteImage(imageId: string) {
	try {
		// Get image data
		const { data: imageData, error: fetchError } = await supabase
			.from('images')
			.select('file_path')
			.eq('id', imageId)
			.single();

		if (fetchError) {
			throw new Error(`Error fetching image data: ${fetchError.message}`);
		}

		// Delete from storage
		const { error: deleteError } = await supabase.storage
			.from('portfolio-images')
			.remove([imageData.file_path]);

		if (deleteError) {
			throw new Error(`Error deleting image from storage: ${deleteError.message}`);
		}

		// Delete from database
		const { error: databaseError } = await supabase.from('images').delete().eq('id', imageId);

		if (databaseError) {
			throw new Error(`Error deleting image from database: ${databaseError.message}`);
		}

		return { success: true };
	} catch (error) {
		console.error('Image deletion error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'An unexpected error occurred.'
		};
	}
}

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

		// Downscale the image before upload (max 1000x1000px)
		async function downscaleImage(file: File, maxSize = 1000): Promise<Blob> {
			return new Promise((resolve, reject) => {
				const img = new window.Image();
				const url = URL.createObjectURL(file);
				img.onload = () => {
					let { width, height } = img;
					if (width > maxSize || height > maxSize) {
						const aspect = width / height;
						if (aspect > 1) {
							width = maxSize;
							height = Math.round(maxSize / aspect);
						} else {
							height = maxSize;
							width = Math.round(maxSize * aspect);
						}
					}
					const canvas = document.createElement('canvas');
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext('2d');
					if (!ctx) return reject('Could not get canvas context');
					ctx.drawImage(img, 0, 0, width, height);
					canvas.toBlob(
						(blob) => {
							if (blob) resolve(blob);
							else reject('Failed to convert canvas to Blob');
						},
						file.type,
						0.92 // quality
					);
				};
				img.onerror = (e) => reject('Image load error');
				img.src = url;
			});
		}

		// Downscale image if needed
		const resizedBlob = await downscaleImage(file, 1600);

		// Generate a unique file name
		const fileExtension = file.name.split('.').pop();
		const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
		const filePath = `collections/${collectionId}/${fileName}`;

		// Upload the resized file to Supabase storage
		const { data: uploadData, error: uploadError } = await supabase.storage
			.from('portfolio-images')
			.upload(filePath, resizedBlob, {
				cacheControl: '3600',
				upsert: false
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
				file_name: file.name, // Store original file name
				file_size: resizedBlob.size,
				title: file.name.split('.')[0],
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

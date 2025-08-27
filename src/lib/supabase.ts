import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

/**
 * Checks if there exists a session.
 *
 * @returns {boolean} true if session exists, false if not
 */
export async function isSession(): Promise<boolean> {
	let sessionExists: boolean;
	const { data, error } = await supabase.auth.getSession();

	if (data.session) {
		// a session exists
		sessionExists = true;
	} else {
		// a session does not exist
		sessionExists = false;
	}

	return sessionExists;
}

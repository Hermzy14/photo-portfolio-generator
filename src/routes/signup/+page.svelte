<!-- Sign up with Supabase -->
<script lang="ts">
	import { supabase } from '$lib/supabase';
	let email: string = '';
	let password: string = '';
	let username: string = '';
	let error: string | null = null;

	/**
	 * Handles user signup by calling Supabase's signUp method.
	 */
	async function handleSignup() {
		const { data, error: signupError } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username
				}
			}
		});
		// Handle signup error
		if (signupError) {
			error = signupError.message;
		} else {
			// Redirect to dashboard after successful signup
			window.location.href = '/dashboard';
		}
	}
</script>

<!-- Signup form -->
<div>
	<h1>Sign Up</h1>
	<form onsubmit={handleSignup}>
		<input type="text" bind:value={username} placeholder="Username" required />
		<input type="email" bind:value={email} placeholder="Email" required />
		<input type="password" bind:value={password} placeholder="Password" required />
		<button type="submit">Sign Up</button>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</form>
</div>
<p>Already have an account? <a href="/login">Log In</a></p>

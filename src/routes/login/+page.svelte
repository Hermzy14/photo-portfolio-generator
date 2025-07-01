<!-- Log in with Supabase -->
<script lang="ts">
	import { supabase } from '$lib/supabase';
	let email: string = '';
	let password: string = '';
	let error: string | null = null;

	/**
	 * Handles user login by calling Supabase's signInWithPassword method.
	 */
	async function handleLogin() {
		const { error: loginError } = await supabase.auth.signInWithPassword({
			email,
			password
		});
		// Handle login error
		if (loginError) {
			error = loginError.message;
		} else {
			// Redirect to dashboard after successful login
			window.location.href = '/dashboard';
		}
	}
</script>

<!-- Login form -->
<div>
	<h1>Log In</h1>
	<form onsubmit={handleLogin}>
		<input type="email" bind:value={email} placeholder="Email" required />
		<input type="password" bind:value={password} placeholder="Password" required />
		<button type="submit">Log In</button>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</form>
	<p>Don't have an account? <a href="/signup">Sign Up</a></p>
</div>

<style>
	.error {
		color: red;
	}
</style>

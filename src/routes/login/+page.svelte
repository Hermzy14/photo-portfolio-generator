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
<section id="log-in-page">
	<h1>Log In</h1>
	<form onsubmit={handleLogin}>
		<div id="email-password-wrapper">
			<input type="email" bind:value={email} placeholder="Email" required />
			<input type="password" bind:value={password} placeholder="Password" required />
		</div>
		<button type="submit" class="btn">Log In</button>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</form>
	<p id="cta-text">Don't have an account? <a href="/signup">Sign Up</a></p>
</section>

<style>
	#email-password-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 1rem 0 0.5rem 0;
	}

	#cta-text {
		margin-top: 1rem;
	}
</style>

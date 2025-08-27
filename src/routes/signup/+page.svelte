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
<section id="sign-up-page">
	<h1>Sign Up</h1>
	<form onsubmit={handleSignup}>
		<div id="sign-up-wrapper">
			<input type="text" bind:value={username} placeholder="Username" required />
			<input type="email" bind:value={email} placeholder="Email" required />
			<input type="password" bind:value={password} placeholder="Password" required />
			<button type="submit" class="btn">Sign Up</button>
		</div>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</form>
	<p id="cta-text">Already have an account? <a href="/login">Log In</a></p>
</section>

<style>
	#sign-up-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 1rem 0 0.5rem 0;
	}

	#cta-text {
		margin-top: 1rem;
	}
</style>

<script lang="ts">
	import '../../app.css';
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
<section class="flex flex-col justify-center items-center min-h-screen gap-4">
	<h1 class="text-5xl font-bold">Sign Up</h1>
	<form onsubmit={handleSignup}>
		<div class="flex flex-col">
			<input
				class="input validator mb-2"
				type="text"
				bind:value={username}
				placeholder="Username"
				required
			/>
			<input
				class="input validator mb-2"
				type="email"
				bind:value={email}
				placeholder="Email"
				required
			/>
			<input
				class="input validator mb-2"
				type="password"
				bind:value={password}
				placeholder="Password"
				required
			/>
		</div>
		<button type="submit" class="btn btn-primary">Sign Up</button>
		{#if error}
			<p class="error">{error}</p>
		{/if}
	</form>
	<p class="mt-4">Already have an account? <a href="/login" class="link">Log In</a></p>
</section>

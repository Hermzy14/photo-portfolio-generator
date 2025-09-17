<!-- Log in with Supabase -->
<script lang="ts">
	import Error from '$lib/components/Error.svelte';
	import { supabase } from '$lib/supabase';
	import '../../app.css';
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
<section class="flex flex-col justify-center items-center min-h-screen gap-4">
	<h1 class="text-5xl font-bold">Log In</h1>
	<form onsubmit={handleLogin}>
		<div class="flex flex-col">
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
		<button type="submit" class="btn btn-primary">Log In</button>
		{#if error}
			<Error {error} />
		{/if}
	</form>
	<p class="mt-4">Don't have an account? <a href="/signup" class="link">Sign Up</a></p>
</section>

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
<section class="grid place-content-center gap-4 min-h-screen min-w-screen">
	<h1 class="text-5xl font-bold">Log In</h1>
	<form onsubmit={handleLogin}>
		<div>
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
	<p class="mt-4">Don't have an account? <a href="/signup" class="btn btn-soft">Sign Up</a></p>
</section>

<script lang="ts">
	import '../../app.css';

	export let title: string;
	export let content: string;
	export let slug: string;
	export let buttonText: string;
</script>

<div class="hero bg-base-200 min-h-screen">
	<div class="hero-content text-center flex-col max-w-2xl">
		<h1 class="text-5xl font-bold">{title}</h1>
		<p class="py-6">{content}</p>
		<a href={slug} class="btn btn-primary">{buttonText}</a>
	</div>
</div>

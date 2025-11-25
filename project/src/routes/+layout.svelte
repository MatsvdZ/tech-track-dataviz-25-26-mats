<script>
import favicon from '$lib/assets/favicon.svg';

let { children } = $props();

// Globale styles en favicon voor alle pagina's
import "../lib/styles/globaal.css";
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}

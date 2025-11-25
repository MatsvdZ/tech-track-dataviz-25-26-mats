export async function load({ fetch }) {
	// Haal alle benodigde datasets parallel op via de API-routes
	const [statRes, brandstofRes, resVerkoop] = await Promise.all([
		fetch('/api/statistieken'),
		fetch('/api/brandstof_verdeling'),
		fetch('/api/verkoop_per_jaar')
	]);

	// Geef alles door aan +page.svelte via `data`
	return {
		statistieken: await statRes.json(),
		brandstofVerdeling: await brandstofRes.json(),
		verkoopPerJaar: await resVerkoop.json()
	};
}

// src/routes/api/voertuigen/+server.js
// API endpoints
const RDW_VOERTUIGEN = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const RDW_BRANDSTOF = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

/**
 * Haal voertuigen op met paginering en optionele filters.
 * Query parameters:
 *   - page (default 1)
 *   - limit (default 100)
 *   - merk (optioneel)
 *   - brandstof (optioneel)
 */

export async function GET({ url }) {
	try {
		// Query parameters uit URL halen
		const page = parseInt(url.searchParams.get('page')) || 1;
		const limit = parseInt(url.searchParams.get('limit')) || 100;
		const merk = url.searchParams.get('merk');
		const brandstofFilter = url.searchParams.get('brandstof');

		// Alleen personenauto's ophalen
		let where = "voertuigsoort = 'Personenauto'";
		if (merk) {
			where += ` AND merk like '${merk.toUpperCase()}'`;
		}
		// Berekent welke rijen je moet overslaan om de juiste pagina data op te halen
		const offset = (page - 1) * limit;

		// Haal voertuigdata op
		// Bouwt een URL voor de RDW API, met je filters en paginering.
		// Haalt de resultaten op en zet ze om naar een JSON-array met voertuigen.
		const voertuigenUrl = `${RDW_VOERTUIGEN}?$where=${encodeURIComponent(where)}&$limit=${limit}&$offset=${offset}`;
		const voertuigenRes = await fetch(voertuigenUrl);
		const voertuigen = await voertuigenRes.json();

		// Haal brandstofinfo op voor de kentekens in deze pagina
		// Pakt alle kentekens uit de opgehaalde voertuigen
		// Zoekt de bijbehorende brandstofinformatie op in de tweede dataset
		const kentekens = voertuigen.map((v) => `'${v.kenteken}'`).join(',');
		const brandstofUrl = `${RDW_BRANDSTOF}?$where=kenteken in(${kentekens})`;
		const brandstofRes = await fetch(brandstofUrl);
		const brandstofData = await brandstofRes.json();

		// Maak een lookup-map
		const brandstofMap = new Map();
		for (const b of brandstofData) {
			brandstofMap.set(b.kenteken, b.brandstof_omschrijving);
		}

		// Combineer datasets
		let gecombineerd = voertuigen.map((v) => ({
			kenteken: v.kenteken,
			merk: v.merk,
			handelsbenaming: v.handelsbenaming,
			voertuigsoort: v.voertuigsoort,
			brandstof: brandstofMap.get(v.kenteken) || 'Onbekend'
		}));

		// Filter op brandstofsoort indien opgegeven
		// Als de gebruiker in de URL brandstof=elektrisch opgeeft, blijven alleen elektrische voertuigen over.
		if (brandstofFilter) {
			gecombineerd = gecombineerd.filter((v) =>
				v.brandstof?.toLowerCase().includes(brandstofFilter.toLowerCase())
			);
		}

		// De server stuurt een JSON-respons terug met de paginering (page en limit), het aantal resultaten, de eigenlijke data
		return new Response(
			JSON.stringify({
				page,
				limit,
				count: gecombineerd.length,
				data: gecombineerd
			}),
			{
				headers: { 'Content-Type': 'application/json' },
				status: 200
			}
		);
	// Error handling	
	} catch (err) {
		console.error('Fout bij ophalen RDW data:', err);
		return new Response(JSON.stringify({ error: 'Kon RDW data niet ophalen' }), { status: 500 });
	}
}

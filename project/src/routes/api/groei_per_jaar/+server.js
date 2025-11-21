const VOERTUIGEN_URL = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const BRANDSTOF_URL = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

// Helper: alle batches ophalen met parallelle requests
async function fetchAll(urlBase, limit = 100000, maxBatches = 50, concurrency = 10, label = '') {
	let allData = [];
	let offset = 0;

	while (offset < maxBatches * limit) {
		const batchPromises = [];

		for (let i = 0; i < concurrency; i++) {
			const currentOffset = offset + i * limit;
			const url = `${urlBase}&$limit=${limit}&$offset=${currentOffset}`;
			batchPromises.push(
				fetch(url)
					.then(async (res) => {
						if (!res.ok) throw new Error(`Fout ${res.status}`);
						const data = await res.json();
						console.log(
							`📦 Batch opgehaald (${label}) offset ${currentOffset}: ${data.length} records`
						);
						return data;
					})
					.catch((err) => {
						console.error(`❌ Fout bij batch ${currentOffset} (${label}):`, err);
						return [];
					})
			);
		}

		// Wacht tot alle batches van deze “wave” klaar zijn
		const results = await Promise.all(batchPromises);
		const valid = results.flat();

		allData = allData.concat(valid);
		console.log(`✅ Totaal records (${label}) tot nu: ${allData.length}`);

		// Stop als minder dan limit*concurrency records ontvangen
		if (valid.length < limit * concurrency) break;

		offset += limit * concurrency;

		// Korte pauze om RDW niet te overbelasten
		await new Promise((r) => setTimeout(r, 1000));
	}

	return allData;
}

export async function GET() {
	try {
		// 1️⃣ Personenauto’s vanaf 2010 ophalen (parallel)
		const voertuigenQuery =
			`${VOERTUIGEN_URL}?$select=kenteken,datum_eerste_toelating,voertuigsoort` +
			`&$where=voertuigsoort='Personenauto' AND datum_eerste_toelating>='20100101'`;

		const voertuigenData = await fetchAll(voertuigenQuery, 50000, 40, 5, 'Voertuigen');

		console.log(`🚗 Totaal voertuigen ontvangen: ${voertuigenData.length}`);

		// 2️⃣ Brandstofdata ophalen (alle elektrische auto's)
		const brandstofQuery =
			`${BRANDSTOF_URL}?$select=kenteken` + `&$where=brandstof_omschrijving='Elektriciteit'`;

		const brandstofData = await fetchAll(brandstofQuery, 50000, 40, 5, 'Brandstof');

		console.log(`⚡ Totaal elektrische brandstofrecords: ${brandstofData.length}`);

		const elektrischeKentekens = new Set(brandstofData.map((b) => b.kenteken));

		// 3️⃣ Tel per jaar
        const telling = {}; // jaar -> { totaal, elektrisch }

        voertuigenData.forEach(v => {
          const jaar = v.datum_eerste_toelating?.substring(0, 4);
          if (!jaar || +jaar < 2018) return; // alleen vanaf 2018
        
          if (!telling[jaar]) telling[jaar] = { totaal: 0, elektrisch: 0 };
          telling[jaar].totaal++;
          if (elektrischeKentekens.has(v.kenteken)) {
            telling[jaar].elektrisch++;
          }
        });
        

		// 4️⃣ Format output
        const resultaat = Object.keys(telling)
        .sort((a, b) => +a - +b)
        .map(jaar => {
          return {
            jaar,
            elektrisch: telling[jaar].elektrisch,
            nietElektrisch: telling[jaar].totaal - telling[jaar].elektrisch
          };
        });
		console.log('📊 Geformatteerde data (eerste 5):', resultaat.slice(0, 5));

		return new Response(JSON.stringify(resultaat), {
			headers: { 'Content-Type': 'application/json' },
			status: 200
		});
	} catch (err) {
		console.error('💥 Fout bij ophalen RDW data:', err);
		return new Response(JSON.stringify({ error: 'Fout bij ophalen RDW data' }), { status: 500 });
	}
}

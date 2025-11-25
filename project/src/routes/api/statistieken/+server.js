// src/routes/api/statistieken/+server.js
const RDW_VOERTUIGEN = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const RDW_BRANDSTOF = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

let cache = { data: null, timestamp: 0 };
const CACHE_TTL = 1000 * 60 * 60; // 1 uur

async function fetchJSON(url) {
  // Standaard fetch helper met foutafhandeling
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fout bij fetch: ${res.status}`);
  return await res.json();
}

export async function GET() {
  try {
    // Bij cache hit meteen teruggeven
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cache.data), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Totaal voertuigen
    const totaalRes = await fetchJSON(`${RDW_VOERTUIGEN}?$select=count(kenteken)`);
    const totaal = parseInt(totaalRes[0]?.count_kenteken || 0);

    // Totaal elektrisch
    const elektrischRes = await fetchJSON(`${RDW_BRANDSTOF}?$select=count(kenteken)&$where=brandstof_omschrijving='Elektriciteit'`);
    const elektrisch = parseInt(elektrischRes[0]?.count_kenteken || 0);

    // Percentage
    const percentage = totaal > 0 ? ((elektrisch / totaal) * 100).toFixed(2) : '0.00';

    const result = { totaal, elektrisch, percentage };
    cache = { data: result, timestamp: Date.now() };
    return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('❌ /api/statistieken fout:', err);
    return new Response(JSON.stringify({ error: 'Kon RDW data niet ophalen' }), { status: 500 });
  }
}

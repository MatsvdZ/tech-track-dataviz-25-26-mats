// src/routes/api/statistieken/+server.js

const RDW_VOERTUIGEN = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const RDW_BRANDSTOF = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

/**
 * We halen eerst een telling op van ALLE personenauto’s
 * en daarna van alle elektrische personenauto’s.
 * De RDW API ondersteunt $select en $where voor dit soort queries.
 */

export async function GET() {
  try {
    // 🟢 Totaal aantal personenauto’s
    const totaalRes = await fetch(
      `${RDW_VOERTUIGEN}?$select=count(kenteken)&$where=voertuigsoort='Personenauto'`
    );
    const totaalData = await totaalRes.json();
    const totaal = parseInt(totaalData[0].count_kenteken);

    // ⚡ Aantal elektrische auto's
    // In de brandstofdataset staan de elektrische voertuigen met brandstof_omschrijving = 'Elektriciteit'
    const elektrischRes = await fetch(
      `${RDW_BRANDSTOF}?$select=count(kenteken)&$where=brandstof_omschrijving='Elektriciteit'`
    );
    const elektrischData = await elektrischRes.json();
    const elektrisch = parseInt(elektrischData[0].count_kenteken);

    const percentage = ((elektrisch / totaal) * 100).toFixed(2);

    return new Response(
      JSON.stringify({
        totaal,
        elektrisch,
        percentage,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Fout bij ophalen RDW statistieken:', error);
    return new Response(JSON.stringify({ error: 'Fout bij ophalen RDW data' }), { status: 500 });
  }
}
const RDW_VOERTUIGEN = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const RDW_BRANDSTOF = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

export async function GET() {
  try {
    // 1️⃣ Haal totaal voertuigen per jaar (alle types)
    const voertuigenRes = await fetch(
      `${RDW_VOERTUIGEN}?$select=substr(datum_eerste_toelating,1,4) as jaar,count(kenteken)` +
      `&$where=substr(datum_eerste_toelating,1,4) >= '2018'` +
      `&$group=jaar&$order=jaar`
    );
    let voertuigenData = await voertuigenRes.json();
    if (!Array.isArray(voertuigenData)) voertuigenData = [];

    // 2️⃣ Haal elektrische voertuigen per jaar
    const elektrischRes = await fetch(
      `${RDW_BRANDSTOF}?$select=substr(datum_eerste_toelating,1,4) as jaar,count(kenteken)` +
      `&$where=brandstof_omschrijving='Elektriciteit' AND substr(datum_eerste_toelating,1,4) >= '2018'` +
      `&$group=jaar&$order=jaar`
    );
    let elektrischData = await elektrischRes.json();
    if (!Array.isArray(elektrischData)) elektrischData = [];

    // 3️⃣ Combineer beide datasets
    const resultaat = voertuigenData.map(v => {
      const e = elektrischData.find(el => el.jaar === v.jaar);
      const totaalPerJaar = parseInt(v.count_kenteken);
      const elektrischPerJaar = e ? parseInt(e.count_kenteken) : 0;

      return {
        jaar: v.jaar,
        elektrisch: elektrischPerJaar,
        nietElektrisch: totaalPerJaar - elektrischPerJaar
      };
    });

    return new Response(JSON.stringify(resultaat), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('❌ /api/groei_per_jaar fout:', err);
    return new Response(JSON.stringify([]), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
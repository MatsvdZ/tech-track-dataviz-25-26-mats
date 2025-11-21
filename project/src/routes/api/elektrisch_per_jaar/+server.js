const VOERTUIGEN_URL = 'https://opendata.rdw.nl/resource/m9d7-ebf2.json';
const BRANDSTOF_URL = 'https://opendata.rdw.nl/resource/8ys7-d773.json';

export async function GET() {
  try {
    // 1️⃣ Personenauto’s vanaf 2010 ophalen
    const voertuigenUrl = `${VOERTUIGEN_URL}?$select=kenteken,datum_eerste_toelating,voertuigsoort&$where=voertuigsoort='Personenauto' AND datum_eerste_toelating>='20100101'&$limit=50000`;
    console.log("🚗 Ophalen voertuigen:", voertuigenUrl);
    const voertuigenRes = await fetch(voertuigenUrl);
    if (!voertuigenRes.ok) throw new Error(`Voertuigen fout: ${voertuigenRes.status}`);
    const voertuigenData = await voertuigenRes.json();
    console.log(`✅ Ontvangen voertuigen: ${voertuigenData.length}`);

    // 2️⃣ Kentekens eruit halen
    const kentekens = voertuigenData.map(v => `'${v.kenteken}'`).join(',');
    if (!kentekens) throw new Error('Geen kentekens gevonden');

    // 3️⃣ Brandstofdata voor die kentekens ophalen
    //   We halen ALLEEN elektrische voertuigen op
    const brandstofUrl = `${BRANDSTOF_URL}?$select=kenteken&$where=brandstof_omschrijving='Elektriciteit'&$limit=50000`;
    console.log("⚡ Ophalen brandstofdata:", brandstofUrl);
    const brandstofRes = await fetch(brandstofUrl);
    if (!brandstofRes.ok) throw new Error(`Brandstof fout: ${brandstofRes.status}`);
    const brandstofData = await brandstofRes.json();
    console.log(`✅ Ontvangen brandstofrecords: ${brandstofData.length}`);

    const elektrischeKentekens = new Set(brandstofData.map(b => b.kenteken));

    // 4️⃣ Combineer beide datasets
    const elektrischPerJaar = voertuigenData
      .filter(v => elektrischeKentekens.has(v.kenteken))
      .map(v => v.datum_eerste_toelating?.substring(0, 4))
      .filter(jaar => jaar && +jaar >= 2010)
      .reduce((acc, jaar) => {
        acc[jaar] = (acc[jaar] || 0) + 1;
        return acc;
      }, {});

    const resultaat = Object.entries(elektrischPerJaar)
      .map(([jaar, aantal]) => ({ jaar, aantal }))
      .sort((a, b) => a.jaar - b.jaar);

    console.log("📊 Resultaat voorbeeld:", resultaat.slice(0, 10));

    return new Response(JSON.stringify(resultaat), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error("💥 Fout bij ophalen RDW data:", err);
    return new Response(JSON.stringify({ error: "Fout bij ophalen RDW data" }), { status: 500 });
  }
}
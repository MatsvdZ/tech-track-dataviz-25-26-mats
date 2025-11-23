export async function load({ fetch }) {
  const [statRes, jaarRes, brandstofRes, resVerkoop] = await Promise.all([
    fetch('/api/statistieken'),
    fetch('/api/groei_per_jaar'),
    fetch('/api/brandstof_verdeling'),
    fetch('/api/verkoop_per_jaar')
  ]);

  return {
    statistieken: await statRes.json(),
    perJaar: await jaarRes.json(),
    brandstofVerdeling: await brandstofRes.json(),
    verkoopPerJaar: await resVerkoop.json()
  };
}
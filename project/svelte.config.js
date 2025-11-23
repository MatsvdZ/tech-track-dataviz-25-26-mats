import vercel from '@sveltejs/adapter-vercel';

export default {
  kit: {
    adapter: vercel(),
    // andere instellingen blijven hetzelfde
  }
};
const fallbackImages = {
  mumbai: "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1600&q=82",
  coast: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=82",
  beach: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=82",
  heritage: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1600&q=82",
  pilgrimage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=82",
  hills: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=82",
  mountain: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=82",
  trek: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=82",
  corporate: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=82",
  blog: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=82",
  travel: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=82",
};

export function imageFallbackFor(context = "") {
  const value = String(context).toLowerCase();
  if (/mumbai|marine|gateway/.test(value)) return fallbackImages.mumbai;
  if (/goa|konkan|coast|beach|alibaug/.test(value)) return fallbackImages.coast;
  if (/shirdi|temple|pilgrim|nashik|ashtavinayak/.test(value)) return fallbackImages.pilgrimage;
  if (/ajanta|ellora|heritage|aurangabad|sambhajinagar|fort/.test(value)) return fallbackImages.heritage;
  if (/mahabaleshwar|matheran|lonavala|hill/.test(value)) return fallbackImages.hills;
  if (/trek|expedition|ladakh|kashmir|spiti|manali|mountain|himalaya/.test(value)) return fallbackImages.trek;
  if (/corporate|mice|school|college/.test(value)) return fallbackImages.corporate;
  if (/blog|article|guide/.test(value)) return fallbackImages.blog;
  return fallbackImages.travel;
}

export function imageCandidates(primary, context, fallback) {
  return [...new Set([primary, fallback, imageFallbackFor(context), fallbackImages.travel].filter(Boolean))];
}

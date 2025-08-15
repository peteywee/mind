export type SearchResult = { title: string; url: string; snippet?: string };
export type SearchProvider = 'serpapi' | 'duckduckgo';

async function ddgSearch(query: string): Promise<SearchResult[]> {
  const ddgUrl = new URL('https://duckduckgo.com/html/');
  ddgUrl.searchParams.set('q', query);
  const res = await fetch(ddgUrl.toString(), { method: 'GET', headers: { 'User-Agent': 'data-gpt/1.0' } });
  const text = await res.text();
  const results: SearchResult[] = [];
  const regex = /<a rel="nofollow" class="result__a" href="([^"]+)".*?>(.*?)<\/a>/gms;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) && results.length < 10) {
    const url = m[1];
    const title = m[2].replace(/<.*?>/g, '');
    results.push({ title, url });
  }
  return results;
}

export async function webSearch(query: string, opts: { provider?: SearchProvider } = {}): Promise<SearchResult[]> {
  const provider = opts.provider || (process.env.SERPAPI_KEY ? 'serpapi' : 'duckduckgo');
  if (provider === 'serpapi') {
    const key = process.env.SERPAPI_KEY;
    const engine = process.env.SERPAPI_ENGINE || 'google';
    if (!key) return ddgSearch(query);
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('engine', engine);
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', key);
    const res = await fetch(url, { method: 'GET' });
    if (res.status === 401 || res.status === 402 || res.status === 403) return ddgSearch(query);
    if (!res.ok) throw new Error('SERPAPI request failed: ' + res.statusText);
    const data = await res.json();
    const organic = data.organic_results || data.items || [];
    return organic.slice(0, 10).map((o: any) => ({
      title: o.title || o.position || 'Result',
      url: o.link || o.url,
      snippet: o.snippet || o.snippets?.[0]
    }));
  }
  return ddgSearch(query);
}

export async function httpGet(url: string): Promise<{ status: number; body: string }> {
  const res = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'data-gpt/1.0' } });
  const body = await res.text();
  return { status: res.status, body };
}

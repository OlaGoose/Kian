const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID;
const GA_SERVICE_ACCOUNT_B64 = process.env.GA_SERVICE_ACCOUNT_B64;

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken(): Promise<string> {
  if (!GA_SERVICE_ACCOUNT_B64) throw new Error('GA_SERVICE_ACCOUNT_B64 not set');

  const sa = JSON.parse(atob(GA_SERVICE_ACCOUNT_B64)) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/analytics.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    })
  );

  const signingInput = `${header}.${claims}`;

  const pemKey = sa.private_key.replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g,
    ''
  );
  const keyBytes = Uint8Array.from(atob(pemKey), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBytes = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const jwt = `${signingInput}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type GAPageRow = {
  path: string;
  pageviews: number;
  sessions: number;
};

export type GAReport = {
  users: number;
  sessions: number;
  pageviews: number;
  pages: GAPageRow[];
};

type GADataRow = {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
};

type GADataResponse = {
  rows?: GADataRow[];
  totals?: { metricValues: { value: string }[] }[];
};

export async function fetchGAReport(days: number): Promise<GAReport> {
  if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_B64) {
    throw new Error('GA credentials not configured');
  }

  const token = await getAccessToken();

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'sessions' },
          { name: 'activeUsers' },
        ],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 25,
        metricAggregations: ['TOTAL'],
      }),
    }
  );

  const data = (await res.json()) as GADataResponse;

  const pages: GAPageRow[] = (data.rows ?? []).map((row) => ({
    path: row.dimensionValues[0].value,
    pageviews: parseInt(row.metricValues[0].value, 10),
    sessions: parseInt(row.metricValues[1].value, 10),
  }));

  const totals = data.totals?.[0]?.metricValues ?? [];

  return {
    pageviews: parseInt(totals[0]?.value ?? '0', 10),
    sessions: parseInt(totals[1]?.value ?? '0', 10),
    users: parseInt(totals[2]?.value ?? '0', 10),
    pages,
  };
}

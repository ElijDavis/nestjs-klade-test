import { Injectable } from '@nestjs/common';

const DEFAULT_API = 'https://jsonplaceholder.typicode.com/todos/1';

export type ProbePayload = {
  framework: string;
  appName: string;
  appNameSet: boolean;
  apiUrl: string;
  apiUrlFromEnv: boolean;
  remote: unknown;
};

@Injectable()
export class AppService {
  async getStatus(): Promise<ProbePayload> {
    const appName = process.env.APP_NAME || '';
    const apiUrl = process.env.API_URL || DEFAULT_API;
    return {
      framework: 'nestjs',
      appName: appName || '(not set)',
      appNameSet: Boolean(appName),
      apiUrl,
      apiUrlFromEnv: Boolean(process.env.API_URL),
      remote: await this.fetchRemote(apiUrl),
    };
  }

  async getHtml(): Promise<string> {
    const payload = await this.getStatus();
    const badge = payload.appNameSet ? 'ok' : 'bad';
    const badgeLabel = payload.appNameSet ? 'APP_NAME injected' : 'APP_NAME missing';
    const remote = this.esc(JSON.stringify(payload.remote, null, 2));
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Klade NestJS Probe</title>
  <style>
    body { margin:0; font-family:ui-sans-serif,system-ui,sans-serif; background:#0b1220; color:#e8eef7; }
    main { max-width:44rem; margin:0 auto; padding:2.5rem 1.25rem; }
    h1 { margin:0 0 .4rem; font-size:1.6rem; }
    .sub { color:#9fb0c8; margin-bottom:1.5rem; }
    .card { background:#121b2c; border:1px solid #24324a; border-radius:12px; padding:1.1rem 1.2rem; margin-bottom:1rem; }
    .row { display:flex; justify-content:space-between; gap:1rem; padding:.45rem 0; border-bottom:1px solid #1e2a40; }
    .row:last-child { border-bottom:0; }
    .k { color:#9fb0c8; }
    .v { font-family:ui-monospace,monospace; word-break:break-all; }
    .ok { color:#4ade80; } .bad { color:#f87171; }
    pre { margin:0; white-space:pre-wrap; word-break:break-word; font-size:.85rem; }
  </style>
</head>
<body>
  <main>
    <h1>Klade NestJS probe</h1>
    <p class="sub">Set <code>APP_NAME</code> and <code>API_URL</code> in Klade. Nest reads them from process env at runtime.</p>
    <div class="card">
      <div class="row"><span class="k">Status</span><span class="v ${badge}">${badgeLabel}</span></div>
      <div class="row"><span class="k">APP_NAME</span><span class="v">${this.esc(payload.appName)}</span></div>
      <div class="row"><span class="k">API_URL</span><span class="v">${this.esc(payload.apiUrl)}</span></div>
    </div>
    <div class="card">
      <div class="row"><span class="k">Fetched JSON</span><span class="k">GET ${this.esc(payload.apiUrl)}</span></div>
      <pre>${remote}</pre>
    </div>
  </main>
</body>
</html>`;
  }

  private async fetchRemote(apiUrl: string): Promise<unknown> {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }
      return await response.json();
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }

  private esc(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

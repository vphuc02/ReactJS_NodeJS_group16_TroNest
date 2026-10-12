const crypto = require('crypto');

class TestClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.cookies = new Map();
    // Pre-seed a valid CSRF token in cookie jar
    const defaultCsrf = crypto.randomBytes(32).toString('hex');
    this.cookies.set('csrf_token', defaultCsrf);
  }

  getCookieString() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  updateCookies(response) {
    const setCookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    for (const cookieHeader of setCookies) {
      const parts = cookieHeader.split(';')[0].split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (value === '') {
        this.cookies.delete(name);
      } else {
        this.cookies.set(name, value);
      }
    }
  }

  async request(method, path, { body, headers = {}, wantsJson = true } = {}) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const reqHeaders = { ...headers };

    if (wantsJson) {
      reqHeaders['Accept'] = 'application/json';
    }

    const cookieHeader = this.getCookieString();
    if (cookieHeader) {
      reqHeaders['Cookie'] = cookieHeader;
    }

    const upperMethod = method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(upperMethod)) {
      const csrf = this.cookies.get('csrf_token');
      if (csrf && !reqHeaders['x-csrf-token'] && !reqHeaders['X-CSRF-Token']) {
        reqHeaders['x-csrf-token'] = csrf;
      }
    }

    let requestBody;
    if (body !== undefined) {
      if (typeof FormData !== 'undefined' && body instanceof FormData) {
        requestBody = body;
      } else if (typeof body === 'object' && !(body instanceof Buffer)) {
        reqHeaders['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
      } else {
        requestBody = body;
      }
    }

    const res = await globalThis.fetch(url, {
      method: upperMethod,
      headers: reqHeaders,
      body: requestBody,
      redirect: 'manual'
    });

    this.updateCookies(res);

    const contentType = res.headers.get('content-type') || '';
    let parsedBody;
    if (contentType.includes('application/json')) {
      parsedBody = await res.json().catch(() => null);
    } else {
      parsedBody = await res.text().catch(() => '');
    }

    return {
      status: res.status,
      headers: res.headers,
      body: parsedBody
    };
  }

  get(path, options = {}) {
    return this.request('GET', path, options);
  }

  post(path, body, options = {}) {
    return this.request('POST', path, { body, ...options });
  }

  put(path, body, options = {}) {
    return this.request('PUT', path, { body, ...options });
  }

  delete(path, options = {}) {
    return this.request('DELETE', path, options);
  }
}

module.exports = { TestClient };

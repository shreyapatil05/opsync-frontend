class ApiClient {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://opsync.onrender.com/api';
  }

  async request(url, options = {}) {
    const fullURL = `${this.baseURL}${url}`;
    try {
      const response = await fetch(fullURL, {
        ...options,
        credentials: 'include',
      });
      console.log(` API: ${options.method || 'GET'} ${url} - ${response.status}`);
      return response;
    } catch (err) {
      console.error(' API request failed:', err);
      throw err;
    }
  }

  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  async post(url, data = {}, options = {}) {
    const config = {
      ...options,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };

    if (data instanceof FormData) {
      config.body = data;
      delete config.headers['Content-Type'];
    } else {
      config.body = JSON.stringify(data);
    }

    return this.request(url, config);
  }

  async put(url, data = {}, options = {}) {
    const config = {
      ...options,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };

    if (data instanceof FormData) {
      config.body = data;
      delete config.headers['Content-Type'];
    } else {
      config.body = JSON.stringify(data);
    }

    return this.request(url, config);
  }

  async patch(url, data = {}, options = {}) {
    const config = {
      ...options,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    };

    if (data instanceof FormData) {
      config.body = data;
      delete config.headers['Content-Type'];
    } else {
      config.body = JSON.stringify(data);
    }

    return this.request(url, config);
  }

  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  async upload(url, formData, options = {}) {
    const fullURL = `${this.baseURL}${url}`;
    try {
      const response = await fetch(fullURL, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        ...options,
        headers: { ...options.headers },
      });
      console.log(` Upload: ${url} - ${response.status}`);
      return response;
    } catch (err) {
      console.error(' Upload failed:', err);
      throw err;
    }
  }

  
  async download(url, filename) {
    const fullURL = `${this.baseURL}${url}`;
    try {
      const response = await fetch(fullURL, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`Download failed: ${response.statusText}`);

      const blob = await response.blob();
      const link = document.createElement('a');
      const href = window.URL.createObjectURL(blob);
      link.href = href;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
      console.log(`File downloaded: ${filename}`);
    } catch (err) {
      console.error('File download failed:', err);
      throw err;
    }
  }
}

const apiClient = new ApiClient();
export default apiClient;

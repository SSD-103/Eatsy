const axios = require('axios');
const { isUrlAllowed } = require('./urlValidator');

function isAbsoluteUrl(u) {
  return /^https?:\/\//i.test(u);
}

async function requestWithValidation(method, url, data = undefined, config = {}) {
  try {
    if (isAbsoluteUrl(url)) {
      if (!isUrlAllowed(url)) {
        const err = new Error('Outbound URL is not allowed');
        err.code = 'URL_NOT_ALLOWED';
        throw err;
      }
    }

    const opts = Object.assign({}, config, { method, url });
    if (data !== undefined) opts.data = data;
    return await axios.request(opts);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  get: (url, config) => requestWithValidation('get', url, undefined, config),
  post: (url, data, config) => requestWithValidation('post', url, data, config),
  put: (url, data, config) => requestWithValidation('put', url, data, config),
  patch: (url, data, config) => requestWithValidation('patch', url, data, config),
  delete: (url, config) => requestWithValidation('delete', url, undefined, config),
  request: (opts) => requestWithValidation(opts.method || 'get', opts.url, opts.data, opts),
};

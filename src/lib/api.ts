/**
 * Standard fetch wrapper for OMS Admin to handle environment headers and base logic
 */
export async function omsFetch(url: string, options: RequestInit = {}) {
  // Get environment from localStorage
  const environment = typeof window !== 'undefined' ? (localStorage.getItem('oms_environment') || 'production') : 'production';
  
  const headers = new Headers(options.headers || {});
  headers.set('x-environment', environment);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  return response;
}

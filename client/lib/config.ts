export const siteConfig = {
  name: "Earning Area",
  domain: "https://panel.logicpay.in/",
  help_mail: "help@earningarea.com",
  telegram: "@toolsadda_support",
}

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
}

export async function authFetch(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    credentials: 'include',
  })
}

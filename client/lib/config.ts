export const siteConfig = {
  name: "Earning Area",
  domain: "https://panel.logicpay.in/",
  help_mail: "help@earningarea.com",
  telegram: "@toolsadda_support",
};

export const apiConfig = {
  baseUrl: "https://backend5.logicpay.in",
};

export async function authFetch(url: string, options?: RequestInit) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
}

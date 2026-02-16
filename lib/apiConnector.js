export const apiConnector = async (method, url, body = null, headers = {}) => {
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
     method: method.toUpperCase(),
    credentials: "include",
    headers: {
           ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : null,
  });

  const data = await res.json().catch(() => ({})); // if the req is empty

if (!res.ok || data?.success === false) {
  const err = new Error(data?.message || "Request failed");
  err.status = res.status;
  err.data = data;
  err.error = res.error
  throw err;
}


  return data;
};

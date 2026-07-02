async function getPesapalToken(): Promise<string> {
  const key = process.env.PESAPAL_CONSUMER_KEY;
  const secret = process.env.PESAPAL_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("Pesapal credentials not configured");

  const isLive = process.env.PESAPAL_ENV === "live";
  const base = isLive
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

  const res = await fetch(`${base}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ consumer_key: key, consumer_secret: secret }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Pesapal auth failed");
  return data.token as string;
}

export async function verifyPesapalTransaction(orderTrackingId: string): Promise<boolean> {
  if (!orderTrackingId) return false;

  try {
    const token = await getPesapalToken();
    const isLive = process.env.PESAPAL_ENV === "live";
    const base = isLive
      ? "https://pay.pesapal.com/v3"
      : "https://cybqa.pesapal.com/pesapalv3";

    const res = await fetch(
      `${base}/api/Transactions/GetTransactionStatus?orderTrackingId=${encodeURIComponent(orderTrackingId)}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = (await res.json()) as {
      payment_status_description?: string;
      status_code?: number;
    };

    const status = (data.payment_status_description ?? "").toLowerCase();
    return status === "completed" || data.status_code === 1;
  } catch {
    return false;
  }
}

export async function sendSms(params: { to: string; message: string }) {
  const apiKey = process.env.AFRICASTALKING_API_KEY;
  const username = process.env.AFRICASTALKING_USERNAME ?? "sandbox";

  if (!apiKey) {
    return { sent: false, reason: "SMS not configured" };
  }

  const phone = params.to.replace(/\D/g, "").replace(/^0/, "254");
  if (!phone) return { sent: false, reason: "Invalid phone number" };

  try {
    const res = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        apiKey,
      },
      body: new URLSearchParams({
        username,
        to: `+${phone.startsWith("254") ? phone : `254${phone}`}`,
        message: params.message,
      }),
    });

    const data = await res.json();
    const success = data.SMSMessageData?.Recipients?.[0]?.status === "Success";
    return { sent: success, data };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "SMS failed",
    };
  }
}

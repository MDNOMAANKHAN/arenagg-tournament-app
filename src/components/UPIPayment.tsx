
"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface UPIPaymentProps {
  amount: number;
  tournamentName: string;
  teamName: string;
}

export default function UPIPayment({
  amount,
  tournamentName,
  teamName,
}: UPIPaymentProps) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    const upi =
      `upi://pay?pa=7330804540@ybl` +
      `&pn=ArenaGG` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(
        `${tournamentName} - ${teamName}`
      )}`;

    QRCode.toDataURL(upi).then(setQr);
  }, [amount, tournamentName, teamName]);

  return (
    <div className="rounded-xl border p-4 text-center">
      <h2 className="text-xl font-bold">
        Pay ₹{amount}
      </h2>

      <p className="mt-2">
        UPI ID: 7330804540@ybl
      </p>

      {qr && (
        <img
          src={qr}
          alt="ArenaGG UPI QR"
          className="mx-auto mt-4 w-56"
        />
      )}

      <p className="mt-3 text-sm">
        Scan using Google Pay, PhonePe,
        Paytm or any UPI app.
      </p>
    </div>
  );
}

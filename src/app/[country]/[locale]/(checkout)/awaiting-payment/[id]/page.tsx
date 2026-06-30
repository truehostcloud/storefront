"use client";

import { CircleAlert, Loader2, Smartphone } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { use, useEffect, useRef, useState } from "react";
import { getOrderPaymentStatus } from "@/lib/data/payment";
import { extractBasePath } from "@/lib/utils/path";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

interface AwaitingPaymentPageProps {
  params: Promise<{
    id: string;
    country: string;
    locale: string;
  }>;
}

export default function AwaitingPaymentPage({
  params,
}: AwaitingPaymentPageProps) {
  const { id: cartId } = use(params);
  const t = useTranslations("checkout");
  const router = useRouter();
  const pathname = usePathname();
  const basePath = extractBasePath(pathname);
  const [timedOut, setTimedOut] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let active = true;
    const deadline = Date.now() + POLL_TIMEOUT_MS;

    async function poll() {
      while (active) {
        let state: "pending" | "completed" | "failed" = "pending";
        try {
          ({ state } = await getOrderPaymentStatus(cartId));
        } catch {
          state = "pending";
        }
        if (!active) return;

        if (state === "completed") {
          router.replace(`${basePath}/order-placed/${cartId}`);
          return;
        }
        if (state === "failed") {
          const message = encodeURIComponent(t("mpesaPaymentFailed"));
          router.replace(
            `${basePath}/checkout/${cartId}?payment_error=${message}`,
          );
          return;
        }
        if (Date.now() >= deadline) {
          setTimedOut(true);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
    }

    poll();

    return () => {
      active = false;
    };
  }, [cartId, basePath, router, t]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 px-4 text-center">
        <CircleAlert className="h-8 w-8 text-amber-500" />
        <h1 className="text-lg font-bold text-gray-900">
          {t("mpesaTimeoutTitle")}
        </h1>
        <p className="text-sm text-gray-500 max-w-md">
          {t("mpesaTimeoutBody")}
        </p>
        <button
          type="button"
          onClick={() => router.replace(basePath || "/")}
          className="mt-2 rounded-sm bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          {t("mpesaContinueShopping")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 px-4 text-center">
      <Smartphone className="h-10 w-10 text-green-600" />
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <h1 className="text-lg font-bold text-gray-900">
        {t("mpesaAwaitTitle")}
      </h1>
      <p className="text-sm text-gray-500 max-w-md">{t("mpesaAwaitBody")}</p>
    </div>
  );
}

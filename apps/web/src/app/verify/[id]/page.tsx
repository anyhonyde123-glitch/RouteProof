import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfigErrorState } from "@/components/ui/EmptyState";
import { VerifyResult } from "@/features/verify/VerifyResult";
import { CONFIG_ERROR_MESSAGE, isContractsConfigured } from "@/lib/constants";
import {
  getHandoffsForShipment,
  getLatestInspection,
  getSettlement,
  getShipment,
} from "@/lib/contracts";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyShipmentPage({ params }: PageProps) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id < 1) {
    notFound();
  }

  if (!isContractsConfigured()) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ConfigErrorState message={CONFIG_ERROR_MESSAGE} />
      </div>
    );
  }

  let shipment;
  try {
    shipment = await getShipment(id);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ConfigErrorState message="Unable to verify shipment. Check Soroban RPC connectivity." />
      </div>
    );
  }

  if (!shipment) {
    notFound();
  }

  const [handoffs, inspection, settlement] = await Promise.all([
    getHandoffsForShipment(id),
    getLatestInspection(id),
    getSettlement(id),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/verify" className="text-sm text-amber-brand hover:underline">
        ← Back to verify
      </Link>
      <div className="mt-6">
        <VerifyResult
          shipment={shipment}
          handoffs={handoffs}
          inspection={inspection}
          settlement={settlement}
        />
      </div>
    </div>
  );
}

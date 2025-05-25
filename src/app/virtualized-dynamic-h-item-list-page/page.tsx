import { DynamicHeightComparison } from "@/components/virtuailzationDynamicHeightItemDemo";
import Link from "next/link";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>loading...</div>}>
      <div>
        <Link href="/">回目錄</Link>
        <hr />
        <DynamicHeightComparison />
      </div>
    </Suspense>
  );
}

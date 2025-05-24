import VirtualizationDemo from "@/components/virtualizationDemo";
import Link from "next/link";

export default function Page() {
  return (
    <div>
      <Link href="/">回目錄</Link>
      <hr />
      <VirtualizationDemo />
    </div>
  );
}

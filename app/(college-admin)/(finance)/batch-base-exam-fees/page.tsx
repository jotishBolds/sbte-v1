import { CreateBaseExamFee } from "@/components/batch-base-exam-fee/create-base-exam-fee";
import { BaseExamFeeList } from "@/components/batch-base-exam-fee/base-exam-fee-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SideBarLayout from "@/components/sidebar/layout";

export default function BatchBaseExamFeePage() {
  return (
    <SideBarLayout>
      <div className="container mx-auto p-4">
        <CreateBaseExamFee />
        <BaseExamFeeList />
      </div>
    </SideBarLayout>
  );
}

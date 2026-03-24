"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { toast } from "sonner"
export const CopyButton = ({ text }: { text: string }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const link = text;

  return (
    <div className="flex items-center justify-between overflow-hidden rounded-xl border bg-muted/70 p-0.75 ps-0">
      <p className=" select-all overflow-hidden text-ellipsis whitespace-nowrap pr-2 pl-3 text-sm">
        {link}
      </p>
      <Button onClick={() => {
        copyToClipboard(link);
        toast.success("Copied to clipboard")
      }} size="icon">
        {isCopied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
};



export default CopyButton;
 
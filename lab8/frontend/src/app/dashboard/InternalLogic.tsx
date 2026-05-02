import { Lock } from "lucide-react";

export default function InternalLogic() {
  return (
    <div className="p-4 border border-dashed rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 flex items-center gap-3">
      <Lock className="h-5 w-5" />
      <div>
        <p className="font-bold">Internal component</p>
        <p className="text-sm">This component is used for internal calculations and is not a public route.</p>
      </div>
    </div>
  );
}

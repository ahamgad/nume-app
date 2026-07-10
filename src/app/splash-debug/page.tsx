import { SplashStrokeDebugPanel } from "@/components/screens/splash-stroke-debug-panel";
import { AuthV2DevEntry } from "@/dev/auth-v2-dev-entry";

export default function SplashDebugPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SplashStrokeDebugPanel />
      <AuthV2DevEntry />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

/** Prototype stroke-reveal splash — not for production (see splash-feature-flags). */
export function SplashStrokePrototype() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center">
        <div className="relative flex size-[6.5rem] items-center justify-center">
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            className="size-[5.5rem] text-foreground"
          >
            <path
              d="M6.44938 77.8931C6.04258 79.1603 6.26759 80.5448 7.0516 81.6203C7.83592 82.696 9.08538 83.3333 10.4167 83.3333H33.3333C35.1433 83.3333 36.7468 82.1634 37.3006 80.4403L56.0506 22.1069C56.4574 20.8398 56.2324 19.4552 55.4484 18.3797C54.6641 17.304 53.4146 16.6667 52.0833 16.6667L29.1667 16.6667C27.3567 16.6667 25.7532 17.8366 25.1994 19.5597L6.44938 77.8931Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              pathLength="100"
              className="nume-splash-stroke-path nume-splash-stroke-path-a"
            />
            <path
              d="M43.9494 77.8931C43.5426 79.1603 43.7676 80.5448 44.5516 81.6203C45.3359 82.696 46.5854 83.3333 47.9167 83.3333H70.8333C72.6433 83.3333 74.2468 82.1634 74.8006 80.4403L93.5506 22.1069C93.9574 20.8398 93.7324 19.4552 92.9484 18.3797C92.1641 17.304 90.9146 16.6667 89.5833 16.6667L66.6667 16.6667C64.8567 16.6667 63.2532 17.8366 62.6994 19.5597L43.9494 77.8931Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              pathLength="100"
              className="nume-splash-stroke-path nume-splash-stroke-path-b"
            />
            <path
              d="M70.8333 79.1667L52.0833 20.8333L29.1667 20.8333L47.9167 79.1667H70.8333Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              pathLength="100"
              className="nume-splash-stroke-path nume-splash-stroke-path-c"
            />
          </svg>
        </div>
        <p
          aria-hidden
          className={cn(
            "mt-2.5 text-xl font-semibold tracking-[0.24em] text-foreground",
            "animate-nume-splash-wordmark",
          )}
        >
          NUME
        </p>
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

/**
 * Hook that applies "visible" class to elements with "fade-in-view" class
 * when they enter the viewport. Uses IntersectionObserver for performance.
 */
export function useIntersectionObserver(rootMargin = "-60px 0px") {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".fade-in-view");

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            // Once visible, stop observing for performance
            observerRef.current?.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold: 0.1 },
    );

    for (const el of elements) {
      observerRef.current?.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  });
}

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  animateIn?: string;
  animateOnce?: boolean;
  delay?: number;
}

export function Reveal({
  children,
  animateIn = 'animate__fadeInUp',
  animateOnce = true,
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (animateOnce) {
            observer.disconnect();
          }
          return;
        }

        if (!animateOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [animateOnce]);

  return (
    <div
      ref={ref}
      className={isVisible ? `animate__animated ${animateIn}` : undefined}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        opacity: isVisible ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
}

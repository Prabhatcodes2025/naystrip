import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

export default function Counter({ to, suffix = "", prefix = "", duration = 1.6, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setValue(Math.floor(v)),
    });
    return () => controls.stop();
  }, [isInView, to, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

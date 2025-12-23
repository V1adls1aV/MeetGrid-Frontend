import React, { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedCalendarWrapperProps {
  date: Date;
  onDateChange: (next: Date) => void;
  children: React.ReactNode;
  isMobile: boolean;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
  }),
};

const AnimatedCalendarWrapper: React.FC<AnimatedCalendarWrapperProps> = ({
  date,
  onDateChange,
  children,
  isMobile,
}) => {
  const prevDateRef = useRef(date);
  useEffect(() => {
    prevDateRef.current = date;
  }, [date]);
  const prevDate = prevDateRef.current;
  const direction = prevDate && date < prevDate ? -1 : 1;

  const slide = (offset: number) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + offset);
    onDateChange(nextDate);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => isMobile && slide(1),
    onSwipedRight: () => isMobile && slide(-1),
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div
      {...handlers}
      style={{ position: "relative", flex: 1, overflow: "hidden" }}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={date.toISOString()}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          style={{ height: "100%", width: "100%" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedCalendarWrapper;

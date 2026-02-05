/**
 * @file src/components/common/FloatingMenu.tsx
 * @description
 * Floating Menu component.
 */

"use client";

import { useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";

const STORAGE_KEY = "floating-menu-hidden";

export function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const hidden = localStorage.getItem(STORAGE_KEY) === "true";
    setIsHidden(hidden);
  }, []);

  const getScrollContainer = () => {
    return (
      document.getElementById("main-content") ||
      document.querySelector("main") ||
      document.documentElement
    );
  };

  const scrollUp = () => {
    const container = getScrollContainer();
    container.scrollBy({ top: -300, behavior: "smooth" });
  };

  const scrollDown = () => {
    const container = getScrollContainer();
    container.scrollBy({ top: 300, behavior: "smooth" });
  };

  const handleClose = () => {
    setIsHidden(true);
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.setItem(STORAGE_KEY, "false");
  };

  const menuItems = [
    { icon: "keyboard_arrow_down", label: "Down", action: scrollDown },
    { icon: "keyboard_arrow_up", label: "Up", action: scrollUp },
  ];

  if (isHidden) {
    return (
      <button
        onClick={handleShow}
        className="fixed bottom-6 right-6 z-[70] size-10 rounded-full
          bg-gradient-to-br from-primary/50 to-purple-600/50
          flex items-center justify-center shadow-lg hover:shadow-xl
          hover:from-primary hover:to-purple-600
          transition-all duration-300"
        title="Show Menu"
      >
        <Icon name="widgets" size="sm" className="text-white" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-[70]"
      onMouseLeave={() => setIsOpen(false)}
    >
      <div
        className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          onClick={handleClose}
          className="group flex items-center gap-2 justify-end"
          style={{ transitionDelay: "0ms" }}
        >
          <span
            className={`px-2 py-1 rounded bg-red-900 text-white text-xs whitespace-nowrap
              transition-all duration-200 ${
                isOpen
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-2"
              }`}
            style={{ transitionDelay: "100ms" }}
          >
            Close
          </span>
          <div
            className="size-10 rounded-full bg-red-700 hover:bg-red-600
              flex items-center justify-center shadow-lg transition-colors"
          >
            <Icon name="close" size="sm" className="text-white" />
          </div>
        </button>

        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="group flex items-center gap-2 justify-end"
            style={{ transitionDelay: `${(index + 1) * 50}ms` }}
          >
            <span
              className={`px-2 py-1 rounded bg-slate-900 text-white text-xs whitespace-nowrap
                transition-all duration-200 ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2"
                }`}
              style={{ transitionDelay: `${(index + 1) * 50 + 100}ms` }}
            >
              {item.label}
            </span>
            <div
              className="size-10 rounded-full bg-slate-700 hover:bg-primary
                flex items-center justify-center shadow-lg transition-colors"
            >
              <Icon name={item.icon} size="sm" className="text-white" />
            </div>
          </button>
        ))}
      </div>

      <button
        onMouseEnter={() => setIsOpen(true)}
        className={`size-14 rounded-full bg-gradient-to-br from-primary to-purple-600
          flex items-center justify-center shadow-xl hover:shadow-2xl
          transition-all duration-300 ${isOpen ? "rotate-180 scale-110" : "rotate-0 scale-100"}`}
      >
        <Icon name={isOpen ? "expand_less" : "widgets"} size="lg" className="text-white" />
      </button>
    </div>
  );
}

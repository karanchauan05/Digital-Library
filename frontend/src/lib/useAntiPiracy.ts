"use client";
import { useEffect } from "react";

export const useAntiPiracy = (enabled: boolean = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block PrintScreen
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                alert("Screenshots are disabled for security reasons.");
                navigator.clipboard.writeText(""); // Clear clipboard
            }

            // Block Ctrl+P (Print), Ctrl+S (Save), Ctrl+U (Source), Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && (e.key === 'p' || e.key === 's' || e.key === 'u' || (e.shiftKey && e.key === 'I'))) {
                e.preventDefault();
                return false;
            }
            
            // Block Win+Shift+S or Cmd+Shift+4 is hard/impossible in JS, 
            // but we can detect when the window loses focus.
        };

        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // You could trigger some action here, like adding a blur overlay
            }
        };

        const handleBlur = () => {
             // Optional: Add blur effect to content when window loses focus
             document.body.classList.add('secure-blur');
        };

        const handleFocus = () => {
             document.body.classList.remove('secure-blur');
        };

        window.addEventListener("keydown", handleKeyDown);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        window.addEventListener("focus", handleFocus);

        // Add CSS to disable user selection and dragging
        const style = document.createElement('style');
        style.id = 'anti-piracy-styles';
        style.innerHTML = `
            .no-select {
                user-select: none !important;
                -webkit-user-select: none !important;
                -moz-user-select: none !important;
                -ms-user-select: none !important;
            }
            .secure-blur {
                filter: blur(20px) !important;
                transition: filter 0.3s ease;
            }
            img {
                -webkit-user-drag: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
                user-drag: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("focus", handleFocus);
            document.getElementById('anti-piracy-styles')?.remove();
            document.body.classList.remove('secure-blur');
        };
    }, [enabled]);
};

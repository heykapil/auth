"use client";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
const ThemeSwitch2 = ({ className }: { className: string }) => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div
        className="flex w-full h-full items-center justify-center cursor-pointer"
        onClick={() =>
          theme === "dark" ? setTheme("light") : setTheme("dark")
        }
      >
        {mounted && (
          <>
            {theme === "dark" ? (
              <SunIcon className={className} />
            ) : (
              <MoonIcon className={className} />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ThemeSwitch2;

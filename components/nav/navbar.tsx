"use client"

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AlignJustify, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Login", href: "/login" },
  { name: "Signup", href: "/signup" },
  { name: "Profile", href: "/profile" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all text-primary items-center justify-center mx-auto",
        isScrolled
          ? "border-b backdrop-blur supports-[backdrop-filter]:bg-transparent/60"
          : "bg-transparent border-b",
      )}
    >
      <div className="container flex flex-row mx-auto h-16  items-center justify-between">
        <div className="flex items-center gap-2 mx-2">
          <Link href="/" className="text-normal text-gray-500 items-center text-normal flex flex-row gap-2">
          <Image
            className="rounded-full"
            alt='logo'
            src="/icon.png"
            width={30}
            height={30}
            />
            auth.kapil.app
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="text-sm font-medium transition-colors hover:text-primary">
              {item.name}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild className="mr-2">
              <Button variant="ghost" size='icon'>
                <AlignJustify />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="font-normal transition-colors hover:bg-sidebar-accent p-2 rounded-lg hover:text-sidebar-accent-foreground"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <Moon className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Sun className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

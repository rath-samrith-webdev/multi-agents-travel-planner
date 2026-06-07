/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type Theme = "dark" | "light" | "system"
type ColorScheme = "purple" | "blue" | "orange" | "green"
type ResolvedTheme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultColorScheme?: ColorScheme
  storageKey?: string
  colorSchemeStorageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  colorScheme: ColorScheme
  setColorScheme: (scheme: ColorScheme) => void
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const THEME_VALUES: Theme[] = ["dark", "light", "system"]
const COLOR_SCHEME_VALUES: ColorScheme[] = ["purple", "blue", "orange", "green"]

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function isTheme(value: string | null): value is Theme {
  if (value === null) {
    return false
  }
  return THEME_VALUES.includes(value as Theme)
}

function isColorScheme(value: string | null): value is ColorScheme {
  if (value === null) {
    return false
  }
  return COLOR_SCHEME_VALUES.includes(value as ColorScheme)
}

function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }
  return "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable) return true
  return !!target.closest("input, textarea, select, [contenteditable='true']")
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorScheme = "purple",
  storageKey = "theme",
  colorSchemeStorageKey = "colorScheme",
  disableTransitionOnChange = true,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey)
    return isTheme(storedTheme) ? storedTheme : defaultTheme
  })

  const [colorScheme, setColorSchemeState] = React.useState<ColorScheme>(() => {
    const storedScheme = localStorage.getItem(colorSchemeStorageKey)
    return isColorScheme(storedScheme) ? storedScheme : defaultColorScheme
  })

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      localStorage.setItem(storageKey, nextTheme)
      setThemeState(nextTheme)
    },
    [storageKey]
  )

  const setColorScheme = React.useCallback(
    (nextScheme: ColorScheme) => {
      localStorage.setItem(colorSchemeStorageKey, nextScheme)
      setColorSchemeState(nextScheme)
    },
    [colorSchemeStorageKey]
  )

  const applyTheme = React.useCallback(
    (nextTheme: Theme, nextScheme: ColorScheme) => {
      const root = document.documentElement
      const resolvedTheme =
        nextTheme === "system" ? getSystemTheme() : nextTheme
      const restoreTransitions = disableTransitionOnChange
        ? disableTransitionsTemporarily()
        : null

      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)

      root.removeAttribute("data-color-scheme")
      if (nextScheme !== "purple") {
        root.setAttribute("data-color-scheme", nextScheme)
      }

      if (restoreTransitions) {
        restoreTransitions()
      }
    },
    [disableTransitionOnChange]
  )

  React.useEffect(() => {
    applyTheme(theme, colorScheme)

    if (theme !== "system") return undefined

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      applyTheme("system", colorScheme)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, colorScheme, applyTheme])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (isEditableTarget(event.target)) return
      if (event.key.toLowerCase() !== "d") return

      setThemeState((currentTheme) => {
        const nextTheme =
          currentTheme === "dark"
            ? "light"
            : currentTheme === "light"
              ? "dark"
              : getSystemTheme() === "dark"
                ? "light"
                : "dark"
        localStorage.setItem(storageKey, nextTheme)
        return nextTheme
      })
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [storageKey])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return

      if (event.key === storageKey) {
        if (isTheme(event.newValue)) {
          setThemeState(event.newValue)
        } else {
          setThemeState(defaultTheme)
        }
      }

      if (event.key === colorSchemeStorageKey) {
        if (isColorScheme(event.newValue)) {
          setColorSchemeState(event.newValue)
        } else {
          setColorSchemeState(defaultColorScheme)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [defaultTheme, defaultColorScheme, storageKey, colorSchemeStorageKey])

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      colorScheme,
      setColorScheme,
    }),
    [theme, setTheme, colorScheme, setColorScheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}

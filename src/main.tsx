import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { NextUIProvider } from '@nextui-org/react'
import { createTheme } from "@nextui-org/react"
import { getDocumentTheme } from '@nextui-org/react'


const lightTheme = createTheme({
  type: 'light',
  theme: {
    colors: {},
  }
})

const darkTheme = createTheme({
  type: 'dark',
  theme: {
    colors: {},
  }
})


const Main = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // you can use any storage
    const theme = window.localStorage.getItem('data-theme');
    setIsDark(theme === 'dark');

    const observer = new MutationObserver((_) => {
      const newTheme = getDocumentTheme(document?.documentElement);
      setIsDark(newTheme === 'dark');
    });

    // Observe the document theme changes
    observer.observe(document?.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'style']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <NextUIProvider theme={isDark ? darkTheme : lightTheme}>
      <App />
    </NextUIProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
)

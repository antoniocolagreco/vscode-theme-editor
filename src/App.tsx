import { HashRouter, Route, Routes } from "react-router-dom"
import { UIThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui"
import { ThemeProvider } from "@/context"
import { AppLayout } from "@/layout/app-layout"
import { ColorsPage, HomePage, SemanticTokensPage, TokenColorsPage, UIColorsPage } from "@/pages"

function App() {
  return (
    <UIThemeProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path='/colors' element={<ColorsPage />} />
              <Route path='/ui-colors' element={<UIColorsPage />} />
              <Route path='/token-colors' element={<TokenColorsPage />} />
              <Route path='/semantic-tokens' element={<SemanticTokensPage />} />
            </Route>
          </Routes>
          <Toaster />
        </HashRouter>
      </ThemeProvider>
    </UIThemeProvider>
  )
}

export default App

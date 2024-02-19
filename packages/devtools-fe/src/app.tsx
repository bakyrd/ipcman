import { Fluent2WebDarkTheme } from '@fluentui/fluent2-theme'
import type { IRawStyle, PartialTheme } from '@fluentui/react'
import { ThemeProvider } from '@fluentui/react'
import type { FC } from 'react'
import styles from './app.module.scss'
import { Root } from './components/root'

const defaultFontStyle: IRawStyle = {
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Noto Sans', 'Helvetica Neue', Helvetica, sans-serif",
  fontWeight: 400,
  fontStyle: 'normal',
  fontStretch: 'normal',
  textRendering: 'optimizeLegibility',
  textIndent: '0',
  textShadow: 'none',
  textDecoration: 'none',
  writingMode: 'horizontal-tb',
  letterSpacing: 'normal',
  wordSpacing: 'normal',
}

const appFontTheme: PartialTheme = {
  defaultFontStyle,
  fonts: {
    tiny: defaultFontStyle,
    xSmall: defaultFontStyle,
    small: defaultFontStyle,
    smallPlus: defaultFontStyle,
    medium: defaultFontStyle,
    mediumPlus: defaultFontStyle,
    large: defaultFontStyle,
    xLarge: defaultFontStyle,
  },
}

const appDarkTheme: PartialTheme = {
  ...Fluent2WebDarkTheme,
  ...appFontTheme,
}

export const App: FC = () => (
  <ThemeProvider className={styles.themeProvider} theme={appDarkTheme}>
    <Root />
  </ThemeProvider>
)

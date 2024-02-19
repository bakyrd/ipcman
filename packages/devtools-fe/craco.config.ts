import type { CracoConfig } from '@craco/types'

const config: CracoConfig = {
  webpack: {
    configure: (webpackConfig, ctx) => {
      if (ctx.env === 'production') webpackConfig.devtool = false

      return webpackConfig
    },
  },
}

// eslint-disable-next-line import/no-default-export
export default config

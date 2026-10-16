/// <reference types="@dcloudio/types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare const uni: UniApp.Uni

/**
 * uni-app 在构建时会把 `process.env.UNI_PLATFORM` 内联为字符串字面量
 * （实测：小程序产物中 `process.env` 出现 0 次，该值被替换为 `"mp-weixin"`）。
 * 因此这里是编译期常量，可用于代替 `// #ifdef` 做平台分支——
 * 而未命中的分支会被摇掉。
 */
declare const process: {
  env: {
    NODE_ENV: 'development' | 'production'
    UNI_PLATFORM: 'h5' | 'mp-weixin' | string
  }
}

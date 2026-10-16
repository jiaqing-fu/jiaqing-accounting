/**
 * uni-app 内置组件事件 ↔ DOM 事件的类型桥
 *
 * 背景：`<input>` / `<textarea>` 在 uni-app 里是**内置组件**，`@input` 派发的载荷是
 * `{ detail: { value: string } }`；而 vue-tsc 在 `lib: ["DOM"]` 下会把同名标签当成
 * DOM 元素，认为载荷是 `InputEvent`（其 `detail` 是 number）。两者不可能同时满足，
 * 且 `@dcloudio/types` 未提供组件事件类型。
 *
 * 处理方式：让处理函数收 `unknown`（对任意入参类型都可赋值，因此能挂到 DOM 的
 * `@input` 上），再经此处的显式收窄取出值。好处是——
 *   - 不用 `@ts-ignore` / `as any` 掩盖问题，边界只在这一个文件里声明；
 *   - 运行时零开销，纯粹是类型层的事；
 *   - uni-app 若将来修正事件模型，只需改这里。
 */
export interface UniInputEvent {
  detail: { value: string }
}

/** 从 `<input>` / `<textarea>` 的 input 事件中取出当前文本 */
export function readInputValue(e: unknown): string {
  return (e as UniInputEvent).detail.value
}

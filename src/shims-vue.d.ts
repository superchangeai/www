/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // Make component definition more permissive for prop spreading
  const component: DefineComponent<any, any, any>
  export default component
}
import { createGlobalState } from 'react-hooks-global-state'

export const { GlobalStateProvider, useGlobalState } = createGlobalState({
  theme:
    typeof window !== 'undefined'
      ? localStorage.getItem('theme') || 'light'
      : 'light',
})

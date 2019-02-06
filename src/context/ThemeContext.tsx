import React, { createContext, useReducer, FunctionComponent } from 'react'

interface ThemeContextState {
  theme: string
}

interface ThemeContextProviderProps {
  children: JSX.Element | JSX.Element[] | string | number
}

const initialState: any = {
  theme:
    typeof window !== 'undefined'
      ? localStorage.getItem('theme') || 'light'
      : 'light',
}
export const ThemeContext = createContext(initialState)

const reducer = (state: any, action: { type: string; payload: any }) => {
  switch (action.type) {
    case 'RESET_THEME':
      return initialState
    case 'SET_THEME':
      return { ...state, theme: action.payload }
  }
}

export const ThemeContextProvider: FunctionComponent<
  ThemeContextProviderProps
> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = { state, dispatch }
  return (
    <ThemeContext.Provider value={value as any}>
      {children}
    </ThemeContext.Provider>
  )
}

export const ThemeContextConsumer = ThemeContext.Consumer

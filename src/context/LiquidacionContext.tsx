import React, {
  createContext,
  Dispatch,
  useReducer,
} from "react";
import {
    LiquidacionActions,
    LiquidacionReducer,
    LiquidacionState,
    initialState,
} from "../reducers/liquidacion-reducer";


type LiquidacionContextType = {
    state: LiquidacionState;
    dispatch: Dispatch<LiquidacionActions>;
  };
  

export const LiquidacionContext = createContext<LiquidacionContextType | null>(null);

type AdminProviderType = {
  children: React.ReactNode;
};

export const LiquidacionProvider = ({ children }: AdminProviderType) => {
  const [state, dispatch] = useReducer(LiquidacionReducer, initialState);

  const registrarLiquidacion = (liquidacion) => {
    console.log(liquidacion)
  }
  
  return (
    <LiquidacionContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </LiquidacionContext.Provider>
  );
};

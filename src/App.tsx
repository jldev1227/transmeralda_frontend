import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import { LiquidacionProvider } from "./context/LiquidacionContext";

function App() {
  return (
    <LiquidacionProvider>
      <Routes>
        <Route element={<IndexPage />} path="/" />
      </Routes>
    </LiquidacionProvider>
  );
}

export default App;

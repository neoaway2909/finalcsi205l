import { useState } from "react";
import "./App.css";
import AuthPage from "./components/AuthPage";

function App() {
  const [count, setCount] = useState(0);

  return (
    // นำ AuthPage มาใช้งานแทนโค้ดเก่า
    <div className="App">
      <AuthPage />
    </div>
  );
}

export default App;

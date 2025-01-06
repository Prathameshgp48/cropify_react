import "./App.css";
// import backgroundImage from '/assets/bgimg.jpg'
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Recommend from "./Pages/Recommend/Recommend.jsx";
import Disease from "./Pages/Disease.jsx";
import Navbar from "./components/Navbar.jsx";
import Records from "./Pages/Records.jsx";
import 'react-toastify/dist/ReactToastify.css';
import { Bounce, ToastContainer } from "react-toastify";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/crop-recommendation" element={<Recommend />} />
        <Route path="/disease-prediction" element={<Disease />} />
        <Route path="/records" element={<Records/>}/>
      </Routes>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={true}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          transition={Bounce}
        />
    </div>
  );
}

export default App;

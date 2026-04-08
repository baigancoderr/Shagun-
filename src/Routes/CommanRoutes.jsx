import { Routes, Route } from "react-router-dom";
import HomePage from "../Common/Page/Home";
import PrivacyPolicy from "../Common/Page/PrivacyPolicy";
import TermsAndConditions from "../Common/Page/TermsAndConditions";
import Contactus from "../Common/Page/ContactUs"
// import Disclaimer from "../Common/Pages/Disclaimer";


const CommanRoutes = () => {
  return (
    <Routes>
       
      <Route path="/" element={<HomePage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/contact" element={<Contactus />} />
      {/* <Route path="/disclaimer" element={<Disclaimer />} /> */}
       
    </Routes>
  );
};

export default CommanRoutes;

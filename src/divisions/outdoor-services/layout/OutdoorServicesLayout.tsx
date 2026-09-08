import { Outlet } from "react-router-dom";

import OutdoorServicesFooter from "./OutdoorServicesFooter";
import OutdoorServicesHeader from "./OutdoorServicesHeader";

function OutdoorServicesLayout() {
  return (
    <div className="outdoor-services-app">
      <OutdoorServicesHeader />
      <main className="outdoor-services-app__main">
        <Outlet />
      </main>
      <OutdoorServicesFooter />
    </div>
  );
}

export default OutdoorServicesLayout;

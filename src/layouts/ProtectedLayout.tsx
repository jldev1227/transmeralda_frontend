import { Outlet } from "react-router-dom";

const ProtectedLayout = () => {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;

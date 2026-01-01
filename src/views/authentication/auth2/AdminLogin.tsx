import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";
import AdminAuthLogin from "../authforms/AdminAuthLogin";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";

const AdminLogin = () => {
  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Admin Login</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Sign in to access the admin panel
            </p>
            <AdminAuthLogin />
            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <p>Not an admin?</p>
              <Link
                to={"/auth/auth2/login"}
                className="text-primary text-sm font-medium"
              >
                User Login
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;


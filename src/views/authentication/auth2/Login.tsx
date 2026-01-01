import { Link } from "react-router";
import CardBox from "src/components/shared/CardBox";

import AuthLogin from "../authforms/AuthLogin";

import FullLogo from "src/layouts/full/shared/logo/FullLogo";


const Login = () => {
  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div>
              <FullLogo />
            </div>
            <AuthLogin />
            <div className="flex gap-2 text-base text-ld font-medium mt-6 items-center justify-center">
              <p>New to TailwindAdmin?</p>
              <Link
                to={"/auth/auth2/register"}
                className="text-primary text-sm font-medium"
              >
                Create an account
              </Link>
            </div>
            <div className="flex gap-2 text-base text-ld font-medium mt-4 items-center justify-center">
              <p>Admin?</p>
              <Link
                to={"/auth/admin/login"}
                className="text-primary text-sm font-medium"
              >
                Admin Login
              </Link>
            </div>
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default Login;

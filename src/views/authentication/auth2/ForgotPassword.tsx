import CardBox from "src/components/shared/CardBox";
import AuthForgotPassword from "../authforms/AuthForgotPassword";
import FullLogo from "src/layouts/full/shared/logo/FullLogo";

const ForgotPassword = () => {
  return (
    <>
      <div className="relative overflow-hidden h-screen bg-lightprimary dark:bg-darkprimary">
        <div className="flex h-full justify-center items-center px-4">
          <CardBox className="md:w-[450px] w-full border-none">
            <div className="mx-auto">
              <FullLogo />
            </div>
            <h2 className="text-2xl font-bold text-center mb-4">Forgot Password</h2>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <AuthForgotPassword />
          </CardBox>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

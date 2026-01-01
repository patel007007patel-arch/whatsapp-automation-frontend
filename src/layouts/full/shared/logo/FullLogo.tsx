



import logoImage from "src/assets/images/logos/logo.jpeg";

const FullLogo = () => {

  return (
    <img 
      src={logoImage} 
      alt="WhatsApp Automation" 
      className="h-auto max-h-28 object-contain rtl:scale-x-[-1] m-0 p-0 block mx-auto"
    />
  );
};

export default FullLogo;

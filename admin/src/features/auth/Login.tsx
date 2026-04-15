import { FormBuilder } from "@/components/form/FormBuilder";
import { tokenStorage } from "@/lib/axios";
import { useNavigate } from "@tanstack/react-router";
import CryptoJS from "crypto-js";
import { AuthAPI } from "./api";
import { LoginVal } from "./validation";
import Logo from "@/assets/Manage Your Building the Smart Way!.jfif"

export const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    const response: any = await AuthAPI.login(values);
    
    if (response) {
      const { token, id } = response;
      tokenStorage.setAccessToken(token);
      const userData = { id: id };
      const encryptedData = CryptoJS.AES.encrypt(
        JSON.stringify(userData),
        import.meta.env.VITE_SECRET_KEY_FOR_DATA
      ).toString();
      sessionStorage.setItem("userData", encryptedData);

      navigate({ to: "/users" });
    }
  };

  const fields = [
    [
      {
        name: "email",
        label: "Administrator Email",
        type: "email",
        placeholder: "admin@damascus-transport.sy",
        wrapperClass: "col-span-2",
      },
      {
        name: "password",
        label: "Access Password",
        type: "password",
        placeholder: "••••••••",
        wrapperClass: "col-span-2",
      },
    ],
  ];

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#010a08] relative overflow-x-hidden p-4 md:p-8 font-sans selection:bg-emerald-500/30">
      {/* Background Lighting Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[100%] md:w-[60%] h-[40%] md:h-[60%] bg-emerald-900/20 rounded-full blur-[80px] md:blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[80%] md:w-[50%] h-[30%] md:h-[50%] bg-green-600/10 rounded-full blur-[80px] md:blur-[120px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98105_1px,transparent_1px),linear-gradient(to_bottom,#10b98105_1px,transparent_1px)] bg-[size:30px_30px] md:bg-[size:45px_45px]"></div>
      </div>

      <div className="w-full max-w-[1050px] z-10">
        <div className="flex flex-col md:grid md:grid-cols-2 bg-slate-900/40 backdrop-blur-3xl rounded-[2rem] md:rounded-[3rem] border border-emerald-500/10 shadow-2xl overflow-hidden">
          
          {/* Left Side: Branding & Mission */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-gradient-to-br from-emerald-600/10 via-transparent to-transparent border-b md:border-b-0 md:border-r border-white/5">
            <div className="space-y-4 md:space-y-8 text-center flex justify-center items-center flex-col ">
              <img src={Logo} alt="Damascus Transport Logo" className="w-20 " />
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                Streamlining <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">Transit Flow</span> <br className="hidden md:block" />
                in Damascus.
              </h1>

              <p className="text-slate-400 text-sm md:text-base lg:text-lg leading-relaxed max-w-sm mx-auto md:mx-0">
                The unified control portal for smart fleet management. Monitor routes, track assets, and optimize urban mobility.
              </p>
            </div>
          </div>

          {/* Right Side: Authentication Form */}
          <div className="p-8 md:p-12 lg:p-20 flex flex-col justify-center bg-emerald-950/5">
            <div className="max-w-sm mx-auto w-full">
              <div className="mb-8 md:mb-12 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 md:mb-3">Portal Login</h2>
                <p className="text-slate-500 text-xs md:text-sm">Secure administrative access. Please enter your credentials.</p>
              </div>
              
              <div
                dir="ltr"
                className="
                  [&_label]:text-slate-400 [&_label]:text-[10px] md:[&_label]:text-[11px] [&_label]:font-bold [&_label]:uppercase [&_label]:tracking-[2px] [&_label]:mb-2 md:[&_label]:mb-3 [&_label]:block
                  [&_input]:bg-slate-900/80 [&_input]:border-slate-800 [&_input]:text-emerald-50 [&_input]:rounded-[14px] md:[&_input]:rounded-[18px] [&_input]:h-12 md:[&_input]:h-14 [&_input]:px-5 md:[&_input]:px-6 [&_input]:transition-all [&_input]:placeholder:text-slate-700 [&_input]:text-sm md:[&_input]:text-base
                  [&_input:focus]:border-emerald-500/50 [&_input:focus]:ring-4 [&_input:focus]:ring-emerald-500/10 [&_input:focus]:bg-slate-800
                  [&_button]:bg-emerald-600 [&_button]:hover:bg-emerald-500 [&_button]:text-white [&_button]:font-black [&_button]:rounded-[14px] md:[&_button]:rounded-[18px] [&_button]:h-12 md:[&_button]:h-14 [&_button]:w-full [&_button]:shadow-xl [&_button]:shadow-emerald-900/40 [&_button]:transition-all [&_button]:mt-4 md:[&_button]:mt-8 [&_button]:uppercase [&_button]:tracking-widest [&_button]:text-[10px] md:[&_button]:text-xs [&_button]:active:scale-[0.98]
                "
              >
                <FormBuilder
                  validationSchema={LoginVal}
                  fields={fields}
                  query={handleLogin}
                  loadingButtonLabel={'Authenticating...'}
                  className="space-y-4 md:space-y-6"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
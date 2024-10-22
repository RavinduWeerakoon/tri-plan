import { AuthPage } from "@refinedev/chakra-ui";
import AuthTemplate from "../../components/auth-template/auth-template";
import { ThemedTitleV2 } from "@refinedev/chakra-ui";
import { Logo } from "../../assets/logo";

export function Register() {
  return (
    <AuthTemplate>
      <AuthPage
        type="register"
        title={
          <ThemedTitleV2 text="TriPlan" icon={<Logo />} collapsed={false} />
        }
        wrapperProps={{
          p: { base: "4", md: "8" }, // Smaller padding on mobile
          maxWidth: { base: "100%", md: "50%" }, // Full width on mobile, reduced width on desktop
        }}
      />
    </AuthTemplate>
  );
}

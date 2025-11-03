import { sendEmail } from "@/lib/email";
import {
    Body,
    Container,
    Font,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface PasswordResetSuccessEmailProps {
  email: string;
}

const PasswordResetSuccessEmail = ({
  email,
}: PasswordResetSuccessEmailProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Linden Hill"
          fallbackFontFamily="Georgia"
          webFont={{
            url: "https://fonts.gstatic.com/s/lindenhill/v21/j_u-06m3a0I_bYd1i_7a1i8.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>Your password has been reset successfully</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
            width="48"
            height="48"
            alt="kapil.app"
            style={logo}
          />
          <Heading style={heading}>Password Reset Successful</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              The password for your account ({email}) has been successfully
              reset.
            </Text>
            <Text style={paragraph}>
              If you did not initiate this change, please contact our support
              team immediately to secure your account.
            </Text>
          </Section>
          <Text style={paragraph}>
            Best,
            <br />- The kapil.app Team
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            <Link href="https://kapil.app" target="_blank" style={footerLink}>
              kapil.app
            </Link>
            , by Kapil Chaudhary
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export async function sendPasswordResetSuccessEmail(email: string) {
  try {
    await sendEmail(
      email,
      "Your Password Has Been Reset",
      <PasswordResetSuccessEmail email={email} />,
    );
  } catch (error) {
    console.error("Failed to send password reset success email:", error);
    throw new Error("Failed to send password reset success email.");
  }
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '"Linden Hill", "Georgia", serif',
  color: "#333333",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
};

const logo = {
  margin: "0 auto",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const body = {
  padding: "0 40px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "center" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  textAlign: "center" as const,
};

const footerLink = {
  color: "#8898aa",
  textDecoration: "underline",
};

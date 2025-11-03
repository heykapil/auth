import { sendEmail } from "@/lib/email";
import {
    Body,
    Button,
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

interface ResetPasswordEmailProps {
  url: string;
}

const ResetPasswordEmail = ({ url }: ResetPasswordEmailProps) => {
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
      <Preview>Reset your password for kapil.app</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
            width="48"
            height="48"
            alt="kapil.app"
            style={logo}
          />
          <Heading style={heading}>Reset Your Password</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              Someone recently requested a password change for your kapil.app
              account. If this was you, you can set a new password here:
            </Text>
            <Button style={button} href={url}>
              Reset Password
            </Button>
            <Text style={paragraph}>
              If you did not request a password change, please ignore this
              email.
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

export async function sendResetPasswordEmail(email: string, url: string) {
  try {
    await sendEmail(
      email,
      "Reset your password",
      <ResetPasswordEmail url={url} />,
    );
  } catch (error) {
    console.error("Failed to send reset password email:", error);
    throw new Error("Failed to send reset password email.");
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

const button = {
  backgroundColor: "#2754C5",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "100%",
  padding: "12px",
  margin: "24px 0",
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

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

interface VerificationEmailProps {
  url: string;
}

export const VerificationEmail = ({ url }: VerificationEmailProps) => (
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
    <Preview>Verify your email address</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
          width="48"
          height="48"
          alt="Kapil Chaudhary"
          style={logo}
        />
        <Heading style={heading}>Verify Your Email Address</Heading>
        <Section style={body}>
          <Text style={paragraph}>
            Welcome! We're excited to have you on board. To complete your
            registration, please verify your email address by clicking the
            button below.
          </Text>
          <Button style={button} href={url}>
            Verify Email
          </Button>
          <Text style={paragraph}>
            If the button above doesn't work, you can copy and paste the
            following link into your browser:
          </Text>
          <Link href={url} style={link}>
            {url}
          </Link>
          <Hr style={hr} />
          <Text style={paragraph}>
            This verification link is valid for <strong>10 minutes</strong>.
          </Text>
          <Text style={paragraph}>
            <strong>Note:</strong> This email was sent because an account was
            created on auth.kapil.app with this address. If you didn't create an
            account, you can safely ignore this email.
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

export async function sendVerificationLink(email: string, url: string) {
  try {
    await sendEmail(
      email,
      "Verify your email address",
      <VerificationEmail url={url} />,
    );
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Optionally rethrow or handle the error as needed
    throw new Error("Failed to send verification email.");
  }
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: "'Linden Hill', serif",
  color: "#333333",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  border: "1px solid #e6ebf1",
  borderRadius: "8px",
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
};

const link = {
  color: "#2754C5",
  wordBreak: "break-all" as const,
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

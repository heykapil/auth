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

interface DeleteAccountEmailProps {
  url: string;
}

const DeleteAccountEmail = ({ url }: DeleteAccountEmailProps) => {
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
      <Preview>Delete your kapil.app account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
            width="48"
            height="48"
            alt="kapil.app"
            style={logo}
          />
          <Heading style={heading}>Delete Your Account</Heading>
          <Section style={body}>
            <Text style={paragraph}>
              We received a request to delete your account on kapil.app. To
              confirm this action, please click the button below.
            </Text>
            <Button style={button} href={url}>
              Delete Account
            </Button>
            <Text style={paragraph}>
              This action is irreversible and will permanently delete all your
              data associated with this account. The confirmation link is valid
              for <strong>10 minutes</strong>.
            </Text>
            <Text style={paragraph}>
              If you did not request this, please ignore this email and your
              account will remain safe.
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

export async function sendDeleteAccountEmail(email: string, url: string) {
  try {
    await sendEmail(
      email,
      "Account Deletion Request",
      <DeleteAccountEmail url={url} />,
    );
  } catch (error) {
    console.error("Failed to send delete account email:", error);
    throw new Error("Failed to send delete account email.");
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
  backgroundColor: "#d9534f",
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

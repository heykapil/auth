import { sendEmail } from "@/lib/email";
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Text,
} from '@react-email/components';

interface VerificationEmailProps {
  url?: string;
  token?: string;
}

export const VerificationEmail = ({
  url, token
}: VerificationEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Preview>Verify your account</Preview>
      <Container style={container}>
        <Heading style={h1}>Verify your account</Heading>
        <Link
          href={url}
          target="_blank"
          style={{
            ...link,
            display: 'block',
            marginBottom: '16px',
          }}
        >
          Click here to verify your account with this link
        </Link>
        <Text style={{ ...text, marginBottom: '14px' }}>
          Or, copy and paste this token code
          <Link
            href="https://auth.kapil.app/verify-email"
            target="_blank"
            style={{
              ...link,
              display: 'block',
              marginBottom: '16px',
            }}
          > here
          </Link>
        </Text>
        <code style={code}>{token}</code>
        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '14px',
            marginBottom: '16px',
          }}
        >
          This token or link is valid for 10 mins.
        </Text>
        <Text
          style={{
            ...text,
            color: '#ababab',
            marginTop: '12px',
            marginBottom: '38px',
          }}
        >
         <strong>Note:</strong> This email was sent to you because someone used this email address to create an account on auth.kapil.app. If you didn&apos;t try to create an account, you can safely ignore this email.
        </Text>
        <Img
          src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
          width="32"
          height="32"
          alt="Kapil Chaudhary"
        />
        <Text style={footer}>
          <Link
            href="https://kapil.app"
            target="_blank"
            style={{ ...link, color: '#898989' }}
          >
            kapil.app
          </Link>
          , Kapil Chaudhary
          <br />
        </Text>
      </Container>
    </Body>
  </Html>
);


const main = {
  backgroundColor: '#ffffff',
};

const container = {
  paddingLeft: '12px',
  paddingRight: '12px',
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
};

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
};

const footer = {
  color: '#898989',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '12px',
  lineHeight: '22px',
  marginTop: '12px',
  marginBottom: '24px',
};

const code = {
  display: 'inline-block',
  padding: '16px 4.5%',
  width: '90.5%',
  backgroundColor: '#f4f4f4',
  borderRadius: '5px',
  border: '1px solid #eee',
  color: '#333',
};

export async function sendVerificationLink(email: string, url: string, token: string) {
  try {
    const res = await sendEmail(
      email,
      "Verify your email!",
      <>
        <VerificationEmail url={url} token={token} />
      </>,
    );
    return res;
  } catch (error) {
    return error;
  }
}

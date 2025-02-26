import { sendEmail } from "@/lib/email";
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';


const MagicLinkEmailBody = ({ email, url }: { email: string; url: string }) => {
  return (
    <Html>
        <Head />
        <Body style={main}>
          <Preview>Log in with this magic link.</Preview>
          <Container style={container}>
            <Img
              src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
              width={48}
              height={48}
              alt="kapil.app"
            />
            <Heading style={heading}>🪄 Your magic link</Heading>
            <Section style={body}>
              <Text style={paragraph}>
                <Link style={link} href={url}>
                  👉 Click here to sign in 👈
                </Link>
              </Text>
              <Text style={paragraph}>
                This email was sent to <strong>{email}</strong> and is valid for <strong>10 mins</strong>.
                <br/>
                 If you did not request this, please ignore this email.
              </Text>
            </Section>
            <Text style={paragraph}>
              Best,
              <br />- Kapil Chaudhary
            </Text>
            <Hr style={hr} />
            <Img
              src={`https://cf.kapil.app/images/website/favicons/android-icon-192x192.png`}
              width={32}
              height={32}
              style={{
                WebkitFilter: 'grayscale(100%)',
                filter: 'grayscale(100%)',
                margin: '20px 0',
              }}
            />
            <Text style={footer}>kapil.app</Text>
            <Text style={footer}>
              Kapil Chaudhary
            </Text>
          </Container>
        </Body>
      </Html>
  );
};

export async function sendMagicLink(email: string, url: string) {
  try {
    const res = await sendEmail(
      email,
      "Continue with your Email",
      <>
        <MagicLinkEmailBody email={email} url={url} />
      </>,
    );
    return res;
  } catch (error) {
    return error;
  }
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 25px 48px',
  backgroundImage: 'url("/static/raycast-bg.png")',
  backgroundPosition: 'bottom',
  backgroundRepeat: 'no-repeat, no-repeat',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '48px',
};

const body = {
  margin: '24px 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
};

const link = {
  color: '#FF6363',
};

const hr = {
  borderColor: '#dddddd',
  marginTop: '48px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  marginLeft: '4px',
};

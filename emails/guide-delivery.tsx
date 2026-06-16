import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components'

export interface GuideDeliveryEmailProps {
  guideTitle: string
  downloadUrl: string
}

export default function GuideDeliveryEmail({
  guideTitle,
  downloadUrl,
}: GuideDeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your download link for {guideTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>KnownIssues.co.uk</Text>
          </Section>

          <Section style={body}>
            <Heading style={h1}>Here's your guide</Heading>
            <Text style={paragraph}>
              Thanks for downloading <strong>{guideTitle}</strong>. Click the
              button below to get your PDF.
            </Text>

            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button style={button} href={downloadUrl}>
                Download {guideTitle}
              </Button>
            </Section>

            <Text style={smallText}>
              Or copy and paste this link into your browser:
            </Text>
            <Text style={linkText}>
              <Link href={downloadUrl} style={{ color: '#000000' }}>
                {downloadUrl}
              </Link>
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This link expires in 5 minutes. If it has expired, log back in
              to{' '}
              <Link href="https://knownissues.co.uk" style={{ color: '#888888' }}>
                knownissues.co.uk
              </Link>{' '}
              to download again.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
  padding: '40px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  margin: '0 auto',
  maxWidth: '520px',
  overflow: 'hidden',
}

const header = {
  padding: '32px 40px 24px',
  borderBottom: '1px solid #e0e0e0',
}

const brand = {
  margin: 0,
  fontSize: '18px',
  fontWeight: 700,
  color: '#000000',
  letterSpacing: '-0.3px',
}

const body = {
  padding: '32px 40px',
}

const h1 = {
  margin: '0 0 16px',
  fontSize: '22px',
  fontWeight: 700,
  color: '#000000',
}

const paragraph = {
  margin: '0 0 8px',
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#444444',
}

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  letterSpacing: '0.1px',
}

const smallText = {
  margin: '0 0 8px',
  fontSize: '13px',
  color: '#888888',
}

const linkText = {
  margin: 0,
  fontSize: '13px',
  color: '#888888',
  wordBreak: 'break-all' as const,
}

const hr = {
  borderColor: '#e0e0e0',
  margin: 0,
}

const footer = {
  padding: '20px 40px',
  backgroundColor: '#fafafa',
}

const footerText = {
  margin: 0,
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#aaaaaa',
}

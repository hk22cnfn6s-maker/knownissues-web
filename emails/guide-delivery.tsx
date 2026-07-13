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
} from '@react-email/components'

export interface GuideDeliveryEmailProps {
  guideTitle: string
}

export default function GuideDeliveryEmail({
  guideTitle,
}: GuideDeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your copy of {guideTitle} is attached</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={brand}>KnownIssues.co.uk</Text>
          </Section>

          <Section style={body}>
            <Heading style={h1}>Here's your guide</Heading>
            <Text style={paragraph}>
              Thanks for downloading <strong>{guideTitle}</strong>. Your PDF
              is attached to this email, watermarked with your account
              details for your personal use only.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Lost the attachment? Log back in to{' '}
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

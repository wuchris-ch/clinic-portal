import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
} from "@react-email/components";

interface DenialEmailProps {
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  isSameDay: boolean;
  adminNotes?: string;
  dashboardUrl: string;
}

export function DenialEmail({
  userName,
  leaveType,
  startDate,
  endDate,
  isSameDay,
  adminNotes,
  dashboardUrl,
}: DenialEmailProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>StaffHub</Text>
          </Section>

          <Section style={content}>
            <div style={iconContainer}>
              <Text style={xIcon}>✕</Text>
            </div>

            <Heading style={heading}>Request Denied</Heading>

            <Text style={paragraph}>Hi {userName},</Text>

            <Text style={paragraph}>
              Unfortunately, your time-off request has been <strong>denied</strong>.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLabel}>Type</Text>
              <Text style={detailValue}>{leaveType}</Text>

              <Text style={detailLabel}>Date(s)</Text>
              <Text style={detailValue}>
                {isSameDay
                  ? formatDate(startDate)
                  : `${formatDate(startDate)} - ${formatDate(endDate)}`}
              </Text>

              {adminNotes && (
                <>
                  <Text style={detailLabel}>Reason</Text>
                  <Text style={{ ...detailValue, marginBottom: 0 }}>
                    {adminNotes}
                  </Text>
                </>
              )}
            </Section>

            <Text style={paragraph}>
              If you have questions about this decision, please speak with your
              manager or HR administrator.
            </Text>

            <Button style={button} href={dashboardUrl}>
              View in Dashboard
            </Button>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by StaffHub Time-Off Portal.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  marginBottom: "64px",
  borderRadius: "12px",
  maxWidth: "560px",
};

const header = {
  padding: "20px 40px",
  borderBottom: "1px solid #e6ebf1",
};

const logo = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#14b8a6",
  margin: "0",
};

const content = {
  padding: "40px",
};

const iconContainer = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const xIcon = {
  display: "inline-block",
  width: "64px",
  height: "64px",
  lineHeight: "64px",
  borderRadius: "50%",
  backgroundColor: "#ef4444",
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "bold",
  margin: "0 auto",
};

const heading = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "26px",
  color: "#525f7f",
  margin: "0 0 16px",
};

const detailsBox = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: "4px solid #ef4444",
};

const detailLabel = {
  fontSize: "12px",
  fontWeight: "600",
  color: "#8898aa",
  textTransform: "uppercase" as const,
  margin: "0 0 4px",
};

const detailValue = {
  fontSize: "16px",
  fontWeight: "500",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const button = {
  backgroundColor: "#525f7f",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "14px 24px",
  margin: "24px 0 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  padding: "0 40px",
};

const footerText = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#8898aa",
  textAlign: "center" as const,
  margin: "0",
};

export default DenialEmail;


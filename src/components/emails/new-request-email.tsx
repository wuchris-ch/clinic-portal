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

interface NewRequestEmailProps {
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  isSameDay: boolean;
  reason: string;
  totalDays: number;
  submissionDate: string;
  payPeriodLabel?: string | null;
  coverageName?: string | null;
  coverageEmail?: string | null;
  adminUrl: string;
}

export function NewRequestEmail({
  employeeName,
  employeeEmail,
  leaveType,
  startDate,
  endDate,
  isSameDay,
  reason,
  totalDays,
  submissionDate,
  payPeriodLabel,
  coverageName,
  coverageEmail,
  adminUrl,
}: NewRequestEmailProps) {
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
              <Text style={bellIcon}>🔔</Text>
            </div>

            <Heading style={heading}>New Time-Off Request</Heading>

            <Text style={paragraph}>
              A new time-off request has been submitted and requires your review.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLabel}>Employee</Text>
              <Text style={detailValue}>{employeeName}</Text>

              <Text style={detailLabel}>Email</Text>
              <Text style={detailValue}>{employeeEmail}</Text>

              <Text style={detailLabel}>Type</Text>
              <Text style={detailValue}>{leaveType}</Text>

              <Text style={detailLabel}>Submitted</Text>
              <Text style={detailValue}>{formatDate(submissionDate)}</Text>

              {payPeriodLabel && (
                <>
                  <Text style={detailLabel}>Pay Period</Text>
                  <Text style={detailValue}>{payPeriodLabel}</Text>
                </>
              )}

              <Text style={detailLabel}>Date(s) Requested Off</Text>
              <Text style={detailValue}>
                {isSameDay
                  ? formatDate(startDate)
                  : `${formatDate(startDate)} - ${formatDate(endDate)}`}
              </Text>

              <Text style={detailLabel}>Total Days</Text>
              <Text style={detailValue}>{totalDays} day{totalDays > 1 ? "s" : ""}</Text>

              <Text style={detailLabel}>Reason</Text>
              <Text style={{ ...detailValue, marginBottom: 0 }}>{reason}</Text>

              {(coverageName || coverageEmail) && (
                <>
                  <Text style={detailLabel}>Coverage</Text>
                  <Text style={detailValue}>
                    {coverageName || "N/A"}
                    {coverageEmail ? ` (${coverageEmail})` : ""}
                  </Text>
                </>
              )}
            </Section>

            <Button style={button} href={adminUrl}>
              Review Request
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

const bellIcon = {
  display: "inline-block",
  width: "64px",
  height: "64px",
  lineHeight: "64px",
  borderRadius: "50%",
  backgroundColor: "#fbbf24",
  fontSize: "32px",
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
  backgroundColor: "#fffbeb",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
  borderLeft: "4px solid #fbbf24",
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
  backgroundColor: "#14b8a6",
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

export default NewRequestEmail;


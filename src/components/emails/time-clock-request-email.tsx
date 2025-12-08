import * as React from "react";
import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Heading,
    Hr,
} from "@react-email/components";

interface TimeClockRequestEmailProps {
    employeeName: string;
    employeeEmail: string;
    payPeriodLabel: string | null;
    clockInDate: string | null;
    clockInTime: string | null;
    clockInReason: string | null;
    clockOutDate: string | null;
    clockOutTime: string | null;
    clockOutReason: string | null;
}

export function TimeClockRequestEmail({
    employeeName,
    employeeEmail,
    payPeriodLabel,
    clockInDate,
    clockInTime,
    clockInReason,
    clockOutDate,
    clockOutTime,
    clockOutReason,
}: TimeClockRequestEmailProps) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A";
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
                            <Text style={iconText}>⏰</Text>
                        </div>

                        <Heading style={heading}>Time Clock Request</Heading>

                        <Text style={paragraph}>
                            A time clock adjustment request has been submitted and requires your attention.
                        </Text>

                        <Section style={detailsBox}>
                            <Text style={detailLabel}>Employee</Text>
                            <Text style={detailValue}>
                                {employeeName} ({employeeEmail})
                            </Text>

                            <Text style={detailLabel}>Pay Period</Text>
                            <Text style={detailValue}>{payPeriodLabel || "N/A"}</Text>
                        </Section>

                        {/* Clock-In Section */}
                        {clockInDate && (
                            <Section style={clockSection}>
                                <Text style={sectionTitle}>Missed Clock-In</Text>

                                <Text style={detailLabel}>Date</Text>
                                <Text style={detailValue}>{formatDate(clockInDate)}</Text>

                                <Text style={detailLabel}>Time</Text>
                                <Text style={detailValue}>{clockInTime || "N/A"}</Text>

                                <Text style={detailLabel}>Reason</Text>
                                <Text style={detailValue}>{clockInReason || "N/A"}</Text>
                            </Section>
                        )}

                        {/* Clock-Out Section */}
                        {clockOutDate && (
                            <Section style={clockSection}>
                                <Text style={sectionTitle}>Missed Clock-Out</Text>

                                <Text style={detailLabel}>Date</Text>
                                <Text style={detailValue}>{formatDate(clockOutDate)}</Text>

                                <Text style={detailLabel}>Time</Text>
                                <Text style={detailValue}>{clockOutTime || "N/A"}</Text>

                                <Text style={detailLabel}>Reason</Text>
                                <Text style={detailValue}>{clockOutReason || "N/A"}</Text>
                            </Section>
                        )}
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

const iconText = {
    fontSize: "48px",
    margin: "0",
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
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    borderLeft: "4px solid #f97316",
};

const clockSection = {
    backgroundColor: "#fefce8",
    borderRadius: "8px",
    padding: "20px",
    margin: "16px 0",
    borderLeft: "4px solid #eab308",
};

const sectionTitle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0 0 12px",
};

const detailLabel = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8898aa",
    textTransform: "uppercase" as const,
    margin: "12px 0 4px",
};

const detailValue = {
    fontSize: "16px",
    color: "#1a1a1a",
    margin: "0 0 8px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "0",
};

const footer = {
    padding: "20px 40px",
};

const footerText = {
    fontSize: "12px",
    color: "#8898aa",
    margin: "0",
    textAlign: "center" as const,
};

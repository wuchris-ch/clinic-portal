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
    Link,
} from "@react-email/components";

interface SickDayEmailProps {
    employeeName: string;
    employeeEmail: string;
    payPeriodLabel: string | null;
    submissionDate: string;
    sickDate: string;
    hasDoctorNote: boolean;
    doctorNoteLink: string | null;
}

export function SickDayEmail({
    employeeName,
    employeeEmail,
    payPeriodLabel,
    submissionDate,
    sickDate,
    hasDoctorNote,
    doctorNoteLink,
}: SickDayEmailProps) {
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
                            <Text style={iconText}>🤒</Text>
                        </div>

                        <Heading style={heading}>Sick Day Submission</Heading>

                        <Text style={paragraph}>
                            A sick day submission has been received and requires your attention.
                        </Text>

                        <Section style={detailsBox}>
                            <Text style={detailLabel}>Employee</Text>
                            <Text style={detailValue}>
                                {employeeName} ({employeeEmail})
                            </Text>

                            <Text style={detailLabel}>Pay Period</Text>
                            <Text style={detailValue}>{payPeriodLabel || "N/A"}</Text>

                            <Text style={detailLabel}>Submission Date</Text>
                            <Text style={detailValue}>{formatDate(submissionDate)}</Text>

                            <Text style={detailLabel}>Sick Day Date</Text>
                            <Text style={detailValue}>{formatDate(sickDate)}</Text>

                            <Text style={detailLabel}>Doctor Note Submitted?</Text>
                            <Text style={detailValue}>{hasDoctorNote ? "Yes" : "No"}</Text>

                            {hasDoctorNote && doctorNoteLink && (
                                <>
                                    <Text style={detailLabel}>Doctor Note</Text>
                                    <Link href={doctorNoteLink} style={linkStyle}>
                                        View Doctor Note →
                                    </Link>
                                </>
                            )}
                        </Section>
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
    backgroundColor: "#fff7ed",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    borderLeft: "4px solid #f97316",
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

const linkStyle = {
    fontSize: "16px",
    color: "#f97316",
    textDecoration: "none",
    fontWeight: "600",
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

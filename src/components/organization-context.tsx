"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Organization } from "@/lib/types/database";

interface OrganizationContextValue {
    organization: Organization;
    orgSlug: string;
    /** Prefix for all org-scoped paths, e.g., "/org/acme-clinic" */
    basePath: string;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function useOrganization() {
    const context = useContext(OrganizationContext);
    if (!context) {
        throw new Error("useOrganization must be used within an OrganizationProvider");
    }
    return context;
}

export function OrganizationProvider({
    children,
    organization,
}: {
    children: ReactNode;
    organization: Organization;
}) {
    const value: OrganizationContextValue = {
        organization,
        orgSlug: organization.slug,
        basePath: `/org/${organization.slug}`,
    };

    return (
        <OrganizationContext.Provider value={value}>
            {children}
        </OrganizationContext.Provider>
    );
}

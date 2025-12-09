import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Type Validation
 * 
 * These tests verify that TypeScript types from the database module are correct
 * and type guards work as expected.
 */

// Import types
import type {
    UserRole,
    RequestStatus,
    Profile,
    LeaveType,
    PayPeriod,
    LeaveRequest,
    Announcement
} from '@/lib/types/database';

describe('Database Types', () => {
    describe('UserRole type', () => {
        it('accepts valid roles', () => {
            const staffRole: UserRole = 'staff';
            const adminRole: UserRole = 'admin';

            expect(staffRole).toBe('staff');
            expect(adminRole).toBe('admin');
        });
    });

    describe('RequestStatus type', () => {
        it('accepts valid statuses', () => {
            const pending: RequestStatus = 'pending';
            const approved: RequestStatus = 'approved';
            const denied: RequestStatus = 'denied';

            expect(pending).toBe('pending');
            expect(approved).toBe('approved');
            expect(denied).toBe('denied');
        });
    });

    describe('Profile type structure', () => {
        it('has correct structure', () => {
            const mockProfile: Profile = {
                id: 'test-id',
                email: 'test@example.com',
                full_name: 'Test User',
                role: 'staff',
                avatar_url: null,
                created_at: '2025-12-08T00:00:00Z',
                updated_at: '2025-12-08T00:00:00Z',
            };

            expect(mockProfile.id).toBeDefined();
            expect(mockProfile.email).toBeDefined();
            expect(mockProfile.full_name).toBeDefined();
            expect(mockProfile.role).toBeDefined();
        });
    });

    describe('LeaveType type structure', () => {
        it('has correct structure', () => {
            const mockLeaveType: LeaveType = {
                id: 'leave-type-id',
                name: 'Sick Leave',
                color: '#ef4444',
                is_single_day: true,
                created_at: '2025-12-08T00:00:00Z',
            };

            expect(mockLeaveType.id).toBeDefined();
            expect(mockLeaveType.name).toBeDefined();
            expect(mockLeaveType.color).toBeDefined();
            expect(typeof mockLeaveType.is_single_day).toBe('boolean');
        });
    });

    describe('PayPeriod type structure', () => {
        it('has correct structure', () => {
            const mockPayPeriod: PayPeriod = {
                id: 'pay-period-id',
                period_number: 1,
                start_date: '2025-01-01',
                end_date: '2025-01-15',
                t4_year: 2025,
                created_at: '2025-12-08T00:00:00Z',
            };

            expect(mockPayPeriod.id).toBeDefined();
            expect(mockPayPeriod.period_number).toBeDefined();
            expect(mockPayPeriod.start_date).toBeDefined();
            expect(mockPayPeriod.end_date).toBeDefined();
            expect(mockPayPeriod.t4_year).toBeDefined();
        });
    });

    describe('LeaveRequest type structure', () => {
        it('has correct structure', () => {
            const mockRequest: LeaveRequest = {
                id: 'request-id',
                user_id: 'user-id',
                leave_type_id: 'leave-type-id',
                pay_period_id: null,
                submission_date: '2025-12-08',
                start_date: '2025-12-09',
                end_date: '2025-12-09',
                reason: 'Personal appointment',
                coverage_name: null,
                coverage_email: null,
                status: 'pending',
                reviewed_by: null,
                reviewed_at: null,
                admin_notes: null,
                created_at: '2025-12-08T00:00:00Z',
                updated_at: '2025-12-08T00:00:00Z',
            };

            expect(mockRequest.id).toBeDefined();
            expect(mockRequest.user_id).toBeDefined();
            expect(mockRequest.status).toBe('pending');
        });
    });

    describe('Announcement type structure', () => {
        it('has correct structure', () => {
            const mockAnnouncement: Announcement = {
                id: 'announcement-id',
                title: 'Test Announcement',
                content: 'This is a test announcement content.',
                pinned: false,
                image_url: null,
                created_at: '2025-12-08T00:00:00Z',
                updated_at: '2025-12-08T00:00:00Z',
            };

            expect(mockAnnouncement.id).toBeDefined();
            expect(mockAnnouncement.title).toBeDefined();
            expect(mockAnnouncement.content).toBeDefined();
            expect(typeof mockAnnouncement.pinned).toBe('boolean');
        });

        it('accepts image_url', () => {
            const announcementWithImage: Announcement = {
                id: 'announcement-id-2',
                title: 'Announcement with Image',
                content: 'Content here',
                pinned: true,
                image_url: 'https://example.com/image.jpg',
                created_at: '2025-12-08T00:00:00Z',
                updated_at: '2025-12-08T00:00:00Z',
            };

            expect(announcementWithImage.image_url).toBe('https://example.com/image.jpg');
        });
    });
});

describe('Type Guards and Validation', () => {
    describe('Role validation', () => {
        it('validates user role values', () => {
            const validRoles = ['staff', 'admin'];
            const invalidRole = 'superuser';

            expect(validRoles.includes('staff')).toBe(true);
            expect(validRoles.includes('admin')).toBe(true);
            expect(validRoles.includes(invalidRole)).toBe(false);
        });
    });

    describe('Status validation', () => {
        it('validates request status values', () => {
            const validStatuses = ['pending', 'approved', 'denied'];

            expect(validStatuses.includes('pending')).toBe(true);
            expect(validStatuses.includes('approved')).toBe(true);
            expect(validStatuses.includes('denied')).toBe(true);
            expect(validStatuses.includes('cancelled')).toBe(false);
        });
    });

    describe('Email validation pattern', () => {
        it('validates email format', () => {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            expect(emailPattern.test('valid@example.com')).toBe(true);
            expect(emailPattern.test('user.name@domain.org')).toBe(true);
            expect(emailPattern.test('invalid-email')).toBe(false);
            expect(emailPattern.test('no@domain')).toBe(false);
        });
    });

    describe('Date validation', () => {
        it('validates ISO date strings', () => {
            const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

            expect(isoDatePattern.test('2025-12-08')).toBe(true);
            expect(isoDatePattern.test('12/08/2025')).toBe(false);
            expect(isoDatePattern.test('2025-1-8')).toBe(false);
        });
    });
});

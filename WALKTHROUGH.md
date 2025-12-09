# Employee Portal Walkthrough

## Overview

**The Employee Portal** is a tool that lets staff submit time-off requests, time clock adjustments, and overtime submissions. The app has a unique design where **you don't need to sign in to access the forms**, but you can also sign in for additional features.

## Using the App Without Signing In (Public Access)

Anyone can access the app and use the quick forms **without creating an account or logging in**. This makes it easy for employees to submit requests quickly.

### What You Can Do Without Signing In

When you visit the home page without being logged in, you'll see:

1. **Home**: The main landing page with employee information, including:
   - Clinic Protocols
   - Employee Handbook info
   - BC Employment Standards links
   - Employee Merit System details
   - Employee Evaluation information

2. **Announcements**: View any announcements from the clinic (like the upcoming Christmas dinner)

3. **Documentation**: Access clinic protocols and employee handbook chapters

4. **Quick Forms** (visible in the sidebar): Submit forms without logging in:
   - **Request 1 Day Off**: Submit a request to take a single day off
   - **Time Clock Request**: Fix missed clock-in/clock-out punches
   - **Overtime Submission**: Submit overtime hours for approval

### How the Quick Forms Work (No Login)

When you submit a form without being logged in:
- You **must manually enter your name and email** in the form
- The form sends an **email notification to the admin** (Dr. Ma) with your request
- **The request is NOT saved to the database**; it is just emailed for processing
- You'll see a success message after submitting

## Signing In as a Regular Employee (Staff)

If you sign in with a regular employee account, you get a few more features.

### How to Sign In

1. Click **"Sign In"** in the sidebar footer (or go to `/login`)
2. Sign in with your email/password or Google account

### What Staff Members See When Logged In

Once logged in, the sidebar changes:

- **Help Center** section stays the same
- **Quick Forms** is replaced with **"My Workspace"** which has:
   - Request 1 Day Off
   - Time Clock Request
   - Overtime Submission
   - **Team Calendar** (only visible when logged in)

### Differences When Submitting Forms as a Logged-In Staff Member

- Your **name and email are pre-filled** from your profile (you can still edit them)
- The request is **sent via email** to the admin, just like public submissions
- Requests **may be tracked in the database** depending on the form type

### Team Calendar

This is **only available to logged-in users**. It shows approved time-off across the organization so you can see when colleagues are out.

## Singing In as an Admin

Admins have access to a dashboard to review and organize incoming requests.

### Admin Features

- **Admin Dashboard**: A central place to view and handle employee requests.
- **Manage Staff**: Overview of current staff profiles.

Note: This portal is primarily for collecting requests. Final scheduling adjustments are handled separately.

## Summary Table

| Feature | No Sign-In | Staff (Logged In) | Admin (Logged In) |
|---------|------------|-------------------|-------------------|
| View Help Center & Info | Yes | Yes | Yes |
| View Announcements | Yes | Yes | Yes |
| View Documentation | Yes | Yes | Yes |
| Submit Day Off Request | Yes (via Quick Forms) | Yes | Yes |
| Submit Time Clock Request | Yes (via Quick Forms) | Yes | Yes |
| Submit Overtime | Yes (via Quick Forms) | Yes | Yes |
| Pre-filled Name/Email | No | Yes | Yes |
| View Team Calendar | No | Yes | Yes |
| View Admin Dashboard | No | No | Yes |
| Process Requests | No | No | Yes |
| Manage Email Recipients | No | No | Yes |
| Manage Staff Profiles | No | No | Yes |

## Conclusion

The system is designed to provide flexibility for employees while maintaining necessary oversight for the clinic administration. It allows for quick submission of requests without barriers, while offering additional tools for regular users.

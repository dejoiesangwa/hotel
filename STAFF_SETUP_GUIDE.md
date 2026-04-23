# 🔐 Staff Authentication & RBAC Guide

This guide explains how to set up and manage your staff accounts (Admins and Receptionists) using Supabase.

## 1. How Login Works
The **Team Portal** (`/admin/login`) uses Supabase Auth. When a staff member logs in:
1.  The system authenticates their **Email** and **Password**.
2.  It then looks up their **Role** in the `public.profiles` table.
3.  If the role is `admin`, they go to `/admin`. If `receptionist`, they go to `/receptionist`.
4.  If they have no entry in the `profiles` table, the login is rejected.

---

## 2. Setting Up Your First Admin
Since you cannot create an admin from the dashboard until you are already logged in as one, you must promote your first user manually:

1.  **Sign Up:** Go to your website's login page or use the Supabase Dashboard to create a user with your email and password.
2.  **Open Supabase SQL Editor:** Go to your Supabase project dashboard -> **SQL Editor**.
3.  **Run this command** (replace with your email):
    ```sql
    -- Promote a user to admin
    UPDATE public.profiles
    SET role = 'admin'
    WHERE email = 'your-email@example.com';
    ```
4.  **Login:** You can now log in at `/admin/login` and you will be directed to the Admin Dashboard.

---

## 3. Creating Receptionist Accounts
Once you are logged in as an **Admin**, you can create receptionist accounts directly from the dashboard:
1.  Go to the **Staff** tab in the Admin Dashboard.
2.  Enter the staff member's **Full Name**, **Email**, and a **Password**.
3.  Click **Create Receptionist Account**.

**Note:** This feature requires the Supabase Edge Function to be deployed.

---

## 4. Deploying the Edge Function
To make the "Create Staff" button work, you must deploy the function I created:
1.  Ensure you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
2.  Run the following command in your terminal:
    ```bash
    supabase functions deploy create-receptionist
    ```
3.  Ensure your `SUPABASE_SERVICE_ROLE_KEY` is set in your Supabase project's secret manager (usually automatic for Edge Functions).

---

## 5. Why the "usual ones" might not work
If your login is failing even with the correct email/password, it is likely because:
*   The user exists in **Auth > Users**, but does not have a row in the **public.profiles** table.
*   The user exists in `profiles`, but their `role` is not set to `admin` or `receptionist`.

You can check this by running:
```sql
SELECT * FROM public.profiles;
```
If a user is missing, you can add them manually:
```sql
INSERT INTO public.profiles (id, email, role, full_name)
VALUES ('USER_ID_FROM_AUTH_TABLE', 'email@example.com', 'admin', 'Your Name');
```

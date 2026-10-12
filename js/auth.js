import { supabase, getCurrentUser } from './supabase.js';

// Dashboard destinations based on account role
const ROLE_ROUTES = {
  client: '/pages/client-dashboard.html',
  jobseeker: '/pages/jobseeker-dashboard.html'
};

// REGISTER A NEW ACCOUNT
export async function registerUser({ email, password, fullName, role }) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role: role
        }
      }
    });

    if (error) {
      throw error;
    }

    // Supabase should return a user when registration succeeds.
    if (!data.user) {
      throw new Error(
        'Supabase did not return a user. Please try again.'
      );
    }

    // If email confirmation is enabled, there may be no active session yet.
    if (!data.session) {
      alert(
        'Your registration was submitted successfully. ' +
        'Please check your email for a confirmation link before logging in.'
      );

      window.location.href = '/pages/login.html';
      return;
    }

    // A session exists, so the user can proceed to the dashboard.
    alert('Your account was created successfully!');

    const destination =
      ROLE_ROUTES[role] || ROLE_ROUTES.jobseeker;

    window.location.href = destination;

  } catch (err) {
    console.error('Registration failed:', err);

    alert(
      'Registration failed: ' +
      (err.message || 'An unexpected error occurred.')
    );
  }
}

// LOGIN AN EXISTING ACCOUNT
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      throw error;
    }

    const user = await getCurrentUser();

    // Use the role stored in the profile or user metadata.
    const role =
      user?.role ||
      data.user?.user_metadata?.role ||
      'jobseeker';

    redirectToDashboard(role);

  } catch (err) {
    console.error('Login failed:', err);

    alert(
      'Login failed: ' +
      (err.message || 'An unexpected error occurred.')
    );
  }
}

// REDIRECT BASED ON ACCOUNT ROLE
export function redirectToDashboard(role) {
  const destination =
    ROLE_ROUTES[role] || ROLE_ROUTES.jobseeker;

  window.location.href = destination;
}

// LOG OUT THE CURRENT USER
export async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw error;
        }

        // Navigate only after Supabase confirms sign-out.
        window.location.replace('/pages/login.html');

    } catch (err) {
        console.error('Logout failed:', err);

        alert(
            'Logout failed: ' +
            (err.message || 'An unexpected error occurred.')
        );
    }
}
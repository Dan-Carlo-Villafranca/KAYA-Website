import { supabase, getCurrentUser } from './supabase.js';

// Route targets by user role
const ROLE_ROUTES = {
  client: '/pages/client-dashboard.html',
  jobseeker: '/pages/jobseeker-dashboard.html'
};

/**
 * Handles user login and redirects based on role.
 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    const user = await getCurrentUser();
    redirectToDashboard(user.role);
  } catch (err) {
    console.error('Login failed:', err.message);
    alert(err.message);
  }
}

/**
 * Redirects user to their designated dashboard.
 */
export function redirectToDashboard(role) {
  const destination = ROLE_ROUTES[role] || ROLE_ROUTES.jobseeker;
  window.location.href = destination;
}

/**
 * Handles secure logout.
 */
export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = '/pages/login.html';
}
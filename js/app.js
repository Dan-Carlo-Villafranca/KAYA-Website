import { supabase, getCurrentUser } from './supabase.js';

(async function enforceRBAC() {
  const user = await getCurrentUser();
  const currentPath = window.location.pathname;

  const isAuthPage = currentPath.endsWith('login.html') || currentPath.endsWith('register.html');
  const isClientDashboard = currentPath.endsWith('client-dashboard.html');
  const isJobseekerDashboard = currentPath.endsWith('jobseeker-dashboard.html');

  // 1. If user is NOT logged in and trying to access a protected page
  if (!user && !isAuthPage && currentPath !== '/' && !currentPath.endsWith('index.html')) {
    window.location.href = '/pages/login.html';
    return;
  }

  // 2. If user IS logged in and attempts to access Login/Register pages
  if (user && isAuthPage) {
    if (user.role === 'client') {
      window.location.href = '/pages/client-dashboard.html';
    } else {
      window.location.href = '/pages/jobseeker-dashboard.html';
    }
    return;
  }

  // 3. Enforce Role Isolation (Prevent Client from accessing Jobseeker page & vice versa)
  if (user) {
    if (isClientDashboard && user.role !== 'client') {
      window.location.href = '/pages/jobseeker-dashboard.html';
    } else if (isJobseekerDashboard && user.role !== 'jobseeker') {
      window.location.href = '/pages/client-dashboard.html';
    }
  }
})();

// Listen for Auth state changes (e.g., Session Expiry, Multi-tab logout)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/pages/login.html';
  }
});

import { supabase, getCurrentUser } from './supabase.js';

async function initSessionGuard() {
  const user = await getCurrentUser();
  const currentPath = window.location.pathname;

  const isAuthPage = currentPath.endsWith('login.html') || currentPath.endsWith('register.html');
  const isClientDashboard = currentPath.endsWith('client-dashboard.html');
  const isJobseekerDashboard = currentPath.endsWith('jobseeker-dashboard.html');

  // A. Protect Private Pages (Dashboards, Profile)
  if (!user && (isClientDashboard || isJobseekerDashboard)) {
    window.location.href = '/pages/login.html';
    return;
  }

  // B. Prevent Logged-In Users from seeing Login/Register
  if (user && isAuthPage) {
    window.location.href = user.role === 'client' 
      ? '/pages/client-dashboard.html' 
      : '/pages/jobseeker-dashboard.html';
    return;
  }

  // C. Enforce Role Isolation (Clients can't view Jobseeker pages & vice versa)
  if (user) {
    if (isClientDashboard && user.role !== 'client') {
      window.location.href = '/pages/jobseeker-dashboard.html';
    } else if (isJobseekerDashboard && user.role !== 'jobseeker') {
      window.location.href = '/pages/client-dashboard.html';
    }
  }

  // D. Update Navbar UI across the site dynamically
  updateNavbarUI(user);
}

// Function to update header links (Log In vs Dashboard/Logout)
function updateNavbarUI(user) {
  const authContainer = document.getElementById('navbarAuth'); // Give your navbar auth div this ID
  if (!authContainer) return;

  if (user) {
    const dashboardLink = user.role === 'client' 
      ? '/pages/client-dashboard.html' 
      : '/pages/jobseeker-dashboard.html';

    authContainer.innerHTML = `
      <a href="${dashboardLink}" class="btn btn-secondary">Dashboard</a>
      <button class="btn btn-outline" onclick="logout()">Log Out</button>
    `;
  } else {
    authContainer.innerHTML = `
      <a href="/pages/login.html" class="btn btn-secondary">Log In</a>
      <a href="/pages/register.html" class="btn btn-primary">Sign Up</a>
    `;
  }
}

// Run session check on page load
initSessionGuard();

// Automatically handle multi-tab logouts or session expiry
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    window.location.href = '/pages/login.html';
  }
});

import { getCurrentUser } from './supabase.js';

async function loadJobseekerDashboard() {
    try {
        const user = await getCurrentUser();

        // Redirect users who are not logged in.
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        // Keep this page for job seekers only.
        if (user.role !== 'jobseeker') {
            window.location.href = 'client-dashboard.html';
            return;
        }

        // Use the actual name returned by Supabase.
        const name = user.fullName?.trim() || 'Job Seeker';

        // Safely update an element when it exists.
        function setText(id, value) {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = value;
            }
        }

        // Navbar and welcome heading.
        setText('navbarUserName', name);
        setText('welcomeName', name);

        // Profile summary.
        setText('profileName', name);
        setText(
            'profileLocation',
            user.location || 'Location not added yet'
        );
        setText(
            'profileSkill',
            user.primarySkill || 'Not added yet'
        );
        setText(
            'profileBio',
            user.bio || 'No bio added yet.'
        );

        // Helpful debugging information.
        console.log('KAYA dashboard loaded.');
        console.log('User name:', name);
        console.log('Profile:', user.profile);

    } catch (error) {
        console.error(
            'Unable to load the job-seeker dashboard:',
            error
        );
    }
}

loadJobseekerDashboard();

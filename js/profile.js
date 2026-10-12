
import { supabase, getCurrentUser } from './supabase.js';

const DASHBOARD_URL = '/pages/jobseeker-dashboard.html';
const LOGIN_URL = '/pages/login.html';

async function initProfile() {
    const form = document.getElementById('profileForm');
    const saveButton = document.getElementById('saveProfileButton');
    const message = document.getElementById('profileMessage');

    try {
        const user = await getCurrentUser();

        if (!user) {
            window.location.replace(LOGIN_URL);
            return;
        }

        // This page is for job seekers only.
        if (user.role !== 'jobseeker') {
            window.location.replace('/pages/client-dashboard.html');
            return;
        }

        const setValue = (id, value) => {
            const element = document.getElementById(id);

            if (element) {
                element.value = value || '';
            }
        };

        const setText = (id, value) => {
            const element = document.getElementById(id);

            if (element) {
                element.textContent = value || '';
            }
        };

        const name = user.fullName?.trim() || '';

        setText('navbarUserName', name || 'Job Seeker');
        setText('profileName', name || 'Your Name');
        setText('profileEmail', user.email || 'Email unavailable');
        setText('profileRole', user.role.toUpperCase());

        const initials = name
            ? name
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part.charAt(0).toUpperCase())
                .join('')
            : 'JS';

        setText('profileInitials', initials);

        setValue('fullNameInput', name);
        setValue('phoneInput', user.phone);
        setValue('locationInput', user.location);
        setValue('primarySkillInput', user.primarySkill);
        setValue('bioInput', user.bio);

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const fullName =
                document.getElementById('fullNameInput').value.trim();

            const phone =
                document.getElementById('phoneInput').value.trim();

            const location =
                document.getElementById('locationInput').value.trim();

            const primarySkill =
                document.getElementById('primarySkillInput').value.trim();

            const bio =
                document.getElementById('bioInput').value.trim();

            if (!fullName || !phone || !location || !primarySkill || !bio) {
                message.textContent =
                    'Please complete all required fields.';
                message.dataset.type = 'error';
                return;
            }

            saveButton.disabled = true;
            saveButton.textContent = 'Saving Profile...';
            message.textContent = '';

            try {
                const { error } = await supabase
                    .from('profiles')
                    .upsert(
                        {
                            id: user.id,
                            full_name: fullName,
                            role: user.role,
                            phone,
                            location,
                            primary_skill: primarySkill,
                            bio,
                            profile_completed: true
                        },
                        {
                            onConflict: 'id'
                        }
                    );

                if (error) {
                    throw error;
                }

                message.textContent =
                    'Profile saved successfully. Redirecting to your dashboard...';
                message.dataset.type = 'success';

                window.location.replace(DASHBOARD_URL);

            } catch (error) {
                console.error('Profile save failed:', error);

                message.textContent =
                    'Unable to save your profile. ' +
                    (error.message || 'Please try again.');

                message.dataset.type = 'error';

                saveButton.disabled = false;
                saveButton.textContent = 'Save Profile and Continue';
            }
        });

    } catch (error) {
        console.error('Unable to load profile:', error);

        if (message) {
            message.textContent =
                'Unable to load your profile. Please refresh and try again.';
            message.dataset.type = 'error';
        }
    }
}

document.addEventListener('DOMContentLoaded', initProfile);

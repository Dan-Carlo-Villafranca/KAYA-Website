import { supabase, getCurrentUser } from './supabase.js';

async function initProfile() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Display user info on page
  const nameDisplay = document.getElementById('profileName');
  const emailDisplay = document.getElementById('profileEmail');
  const roleDisplay = document.getElementById('profileRole');

  const fullNameInput = document.getElementById('fullNameInput');
  const bioInput = document.getElementById('bioInput');

  if (nameDisplay) nameDisplay.textContent = user.fullName;
  if (emailDisplay) emailDisplay.textContent = user.email;
  if (roleDisplay) roleDisplay.textContent = user.role.toUpperCase();

  if (fullNameInput) fullNameInput.value = user.fullName;
  if (bioInput) bioInput.value = user.user_metadata?.bio || '';

  // Profile Update Handler
  const editForm = document.getElementById('editProfileForm');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newFullName = fullNameInput.value.trim();
      const newBio = bioInput.value.trim();

      const { error } = await supabase.auth.updateUser({
        data: { full_name: newFullName, bio: newBio }
      });

      if (error) {
        alert('Failed to update profile: ' + error.message);
      } else {
        alert('Profile updated successfully!');
        window.location.reload();
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initProfile);
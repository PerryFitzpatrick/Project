import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-user-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.scss']
})
export class UserProfileModalComponent {
  @Input() isOpen: boolean = false;
  @Input() user: any = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() userUpdated = new EventEmitter<any>();

  // Edit states
  editingUsername = false;
  editingPassword = false;
  
  // Form data
  editData = {
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // UI state
  loading = false;
  error = '';
  success = '';

  private readonly apiBaseUrl = 'https://perry-api.sawatzky-perry.workers.dev';

  constructor(private http: HttpClient) {}

  onClose() {
    this.closeModal.emit();
    this.resetForm();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  startEditUsername() {
    this.editingUsername = true;
    this.editData.username = this.user?.username || '';
    this.resetMessages();
  }

  startEditPassword() {
    this.editingPassword = true;
    this.resetMessages();
  }

  cancelEdit() {
    this.editingUsername = false;
    this.editingPassword = false;
    this.resetForm();
  }

  async saveUsername() {
    if (!this.editData.username.trim()) {
      this.error = 'Username cannot be empty';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const token = localStorage.getItem('authToken');
      const response: any = await this.http.put(`${this.apiBaseUrl}/auth/update-username`, {
        username: this.editData.username
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).toPromise();

      if (response.status === 'success') {
        this.success = 'Username updated successfully!';
        this.user.username = this.editData.username;
        this.editingUsername = false;
        
        // Emit updated user data
        this.userUpdated.emit(this.user);
        
        // Update JWT token if a new one is provided
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        setTimeout(() => {
          this.resetMessages();
        }, 2000);
      } else {
        this.error = response.message || 'Failed to update username';
      }
    } catch (error: any) {
      console.error('Update username error:', error);
      this.error = error.error?.message || 'Failed to update username. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async resetPassword() {
    if (!this.editData.currentPassword || !this.editData.newPassword || !this.editData.confirmPassword) {
      this.error = 'Please fill in all password fields';
      return;
    }

    if (this.editData.newPassword !== this.editData.confirmPassword) {
      this.error = 'New passwords do not match';
      return;
    }

    if (this.editData.newPassword.length < 6) {
      this.error = 'New password must be at least 6 characters long';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const token = localStorage.getItem('authToken');
      const response: any = await this.http.put(`${this.apiBaseUrl}/auth/reset-password`, {
        currentPassword: this.editData.currentPassword,
        newPassword: this.editData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).toPromise();

      if (response.status === 'success') {
        this.success = 'Password updated successfully!';
        this.editingPassword = false;
        
        // Update JWT token if a new one is provided
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        
        setTimeout(() => {
          this.resetMessages();
        }, 2000);
      } else {
        this.error = response.message || 'Failed to update password';
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      this.error = error.error?.message || 'Failed to update password. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private resetForm() {
    this.editData = {
      username: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    this.editingUsername = false;
    this.editingPassword = false;
  }

  private resetMessages() {
    this.error = '';
    this.success = '';
  }
}

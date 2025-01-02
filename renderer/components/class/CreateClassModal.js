// renderer/components/class/CreateClassModal.js
export default class CreateClassModal {
    constructor(onClose, onSubmit) {
        this.onClose = onClose;
        this.onSubmit = onSubmit;
        this.modal = null;
    }

    createModalContent() {
        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3>Create New Class</h3>
            <button class="close-btn">&times;</button>
        `;

        const form = document.createElement('form');
        form.className = 'modal-form';
        form.innerHTML = `
            <div class="form-group">
                <label for="className">Class Name*</label>
                <input type="text" id="className" required>
            </div>
            <div class="form-group">
                <label for="classDescription">Description</label>
                <textarea id="classDescription" rows="3"></textarea>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Class</button>
            </div>
        `;

        // Event Listeners
        header.querySelector('.close-btn').addEventListener('click', () => this.close());
        form.querySelector('.cancel-btn').addEventListener('click', () => this.close());
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: form.querySelector('#className').value,
                description: form.querySelector('#classDescription').value
            };

            try {
                await this.onSubmit(formData);
                this.close();
            } catch (error) {
                console.error('Failed to create class:', error);
                // Show error message
                this.showError(error.message);
            }
        });

        content.appendChild(header);
        content.appendChild(form);

        return content;
    }

    showError(message) {
        let errorDiv = this.modal.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            this.modal.querySelector('.modal-form').prepend(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    render() {
        this.modal = document.createElement('div');
        this.modal.className = 'modal';
        
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.close();
            }
        });

        modalOverlay.appendChild(this.createModalContent());
        this.modal.appendChild(modalOverlay);

        return this.modal;
    }

    close() {
        if (this.modal) {
            this.modal.remove();
            this.onClose?.();
        }
    }
}
/**
 * Modal dialog for creating a new class
 * Provides a user interface for inputting class details and handling class creation
 */
export default class CreateClassModal {
    /**
     * Initialize the create class modal
     * @param {Function} onClose - Callback function to execute when modal is closed
     * @param {Function} onSubmit - Callback function to execute when class creation is submitted
     */
    constructor(onClose, onSubmit) {
        // Store callback functions for modal interactions
        this.onClose = onClose;
        this.onSubmit = onSubmit;
        
        // Reference to the modal DOM element
        this.modal = null;
    }

    /**
     * Create the content for the modal dialog
     * Generates form elements and sets up event listeners
     * @returns {HTMLElement} Modal content container
     */
    createModalContent() {
        // Create main modal content container
        const content = document.createElement('div');
        content.className = 'modal-content';

        // Create modal header with title and close button
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3>Create New Class</h3>
            <button class="close-btn">&times;</button>
        `;

        // Create form for class creation
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

        // Add event listener for close button
        header.querySelector('.close-btn').addEventListener('click', () => this.close());

        // Add event listener for cancel button
        form.querySelector('.cancel-btn').addEventListener('click', () => this.close());
        
        // Add event listener for form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMessage = this.modal.querySelector('.error-message');
            try {
                const formData = {
                    name: this.modal.querySelector('#className').value,
                    description: this.modal.querySelector('#classDescription').value
                };
                await this.onSubmit(formData);
                this.close();
            } catch (error) {
                // Display error message if class creation fails
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
            }
        });

        // Append header and form to content
        content.appendChild(header);
        content.appendChild(form);

        return content;
    }

    /**
     * Render the complete modal dialog
     * Creates modal structure and adds event listeners
     * @returns {HTMLElement} Complete modal element
     */
    render() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.className = 'modal';

        // Create modal overlay for background dimming and click-outside-to-close functionality
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.addEventListener('click', (e) => {
            // Close modal if clicking outside the modal content
            if (e.target === modalOverlay) {
                this.close();
            }
        });

        // Add modal content to overlay
        modalOverlay.appendChild(this.createModalContent());
        this.modal.appendChild(modalOverlay);

        return this.modal;
    }

    /**
     * Close the modal and trigger onClose callback
     * Removes modal from the DOM and calls optional close handler
     */
    close() {
        if (this.modal) {
            this.modal.remove();
            this.onClose?.();
        }
    }
}
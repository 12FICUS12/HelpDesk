class Modal {
    constructor(modalElement) {
        this.modalElement = modalElement;
    }

    open() {
        if (this.modalElement) {
            this.modalElement.style.display = 'block';
        }
    }

    close() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
        }
    }
}

export default Modal;
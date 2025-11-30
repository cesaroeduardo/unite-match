// Módulo para gerenciar upload de foto do usuário

class PhotoUpload {
  constructor() {
    this.storageKey = 'userPhoto';
  }

  // Salvar foto no storage
  async savePhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const base64Data = e.target.result;
          await chrome.storage.local.set({ [this.storageKey]: base64Data });
          resolve(base64Data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Obter foto do storage
  async getPhoto() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      return result[this.storageKey] || null;
    } catch (error) {
      console.error('Erro ao obter foto:', error);
      return null;
    }
  }

  // Remover foto do storage
  async removePhoto() {
    try {
      await chrome.storage.local.remove([this.storageKey]);
      return true;
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      return false;
    }
  }

  // Criar interface de upload
  createUploadInterface(callback) {
    const container = document.createElement('div');
    container.id = 'photo-upload-container';
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
      color: #ffffff;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
      z-index: 10001;
      font-family: "Sora", sans-serif;
      max-width: 400px;
      border: 1px solid #404040;
    `;

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-weight: 600; font-size: 20px; margin-bottom: 10px;">Upload de Foto</h3>
        <p style="color: #b0b0b0; font-size: 14px;">Selecione uma foto para usar na imagem de estatísticas</p>
      </div>
      
      <input type="file" id="photo-file-input" accept="image/*" style="display: none;">
      
      <div style="margin-bottom: 20px;">
        <button id="select-photo-btn" style="
          width: 100%;
          background: #FF4600;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 10px;
        ">Selecionar Foto</button>
        
        <div id="photo-preview" style="
          width: 100%;
          height: 200px;
          background: #2d2d2d;
          border-radius: 10px;
          display: none;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          overflow: hidden;
        ">
          <img id="preview-img" style="max-width: 100%; max-height: 100%; object-fit: contain;">
        </div>
      </div>
      
      <div style="display: flex; gap: 10px;">
        <button id="cancel-upload-btn" style="
          flex: 1;
          background: transparent;
          color: #b0b0b0;
          border: 1px solid #404040;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        ">Cancelar</button>
        
        <button id="save-photo-btn" style="
          flex: 1;
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: none;
        ">Salvar</button>
      </div>
    `;

    document.body.appendChild(container);

    const fileInput = container.querySelector('#photo-file-input');
    const selectBtn = container.querySelector('#select-photo-btn');
    const preview = container.querySelector('#photo-preview');
    const previewImg = container.querySelector('#preview-img');
    const saveBtn = container.querySelector('#save-photo-btn');
    const cancelBtn = container.querySelector('#cancel-upload-btn');

    selectBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImg.src = e.target.result;
          preview.style.display = 'flex';
          saveBtn.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    saveBtn.addEventListener('click', async () => {
      const file = fileInput.files[0];
      if (file) {
        try {
          await this.savePhoto(file);
          container.remove();
          if (callback) callback(true);
        } catch (error) {
          console.error('Erro ao salvar foto:', error);
          alert('Erro ao salvar foto. Tente novamente.');
        }
      }
    });

    cancelBtn.addEventListener('click', () => {
      container.remove();
      if (callback) callback(false);
    });
  }
}

// Exportar
console.log('🔧 PhotoUpload: Exportando classe...');
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PhotoUpload;
  console.log('📦 PhotoUpload: Exportado via module.exports');
} else {
  window.PhotoUpload = PhotoUpload;
  console.log('📦 PhotoUpload: Exportado no window', { PhotoUpload: !!window.PhotoUpload });
}


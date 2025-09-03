// Modal and UI Components Module
// Handles error modals, same language modals, and UI feedback

// Access functions from global scope directly

// Show same language modal with force translation option
function showSameLanguageModal(sourceLangName, targetLangName, detectedLanguage, onForceTranslate) {
  // Remove existing modal
  const existingModal = document.getElementById('ai-translation-same-language-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'ai-translation-same-language-modal';
  modal.innerHTML = `
    <div class="same-language-modal-overlay">
      <div class="same-language-modal-content">
        <div class="same-language-modal-header">
          <div class="same-language-icon">🌐</div>
          <h3 class="same-language-title">語言相同，不需要翻譯</h3>
        </div>
        <div class="same-language-modal-body">
          <p class="same-language-message">
            <strong>檢測到的語言：</strong>${sourceLangName}<br>
            <strong>目標語言：</strong>${targetLangName}<br><br>
            內容已經是您選擇的目標語言，通常不需要翻譯。
          </p>
        </div>
        <div class="same-language-modal-footer">
          <button class="same-language-close-btn">關閉</button>
          <button class="same-language-force-btn">仍要強制翻譯</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Add animation class
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);

  // Close button functionality
  const closeBtn = modal.querySelector('.same-language-close-btn');
  const overlay = modal.querySelector('.same-language-modal-overlay');
  const forceBtn = modal.querySelector('.same-language-force-btn');

  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });

  // Force translation button
  forceBtn.addEventListener('click', () => {
    closeModal();
    if (onForceTranslate) {
      onForceTranslate();
    }
  });

  // Auto-close after 10 seconds
  setTimeout(closeModal, 10000);
}

// Show error modal
function showErrorModal(title, message, autoCloseMs = 5000) {
  // Remove existing error modal
  const existingModal = document.getElementById('ai-translation-error-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.id = 'ai-translation-error-modal';
  modal.innerHTML = `
    <div class="error-modal-overlay">
      <div class="error-modal-content">
        <div class="error-modal-header">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">${title}</h3>
        </div>
        <div class="error-modal-body">
          <p class="error-message">${message}</p>
        </div>
        <div class="error-modal-footer">
          <button class="error-modal-close-btn">確定</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add animation class
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Close button functionality
  const closeBtn = modal.querySelector('.error-modal-close-btn');
  const overlay = modal.querySelector('.error-modal-overlay');
  
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
    }, 300);
  };
  
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  
  // Auto-close
  setTimeout(closeModal, autoCloseMs);
}

// Show translation error summary
function showTranslationErrorSummary(errors, successCount, totalCount) {
  // Group errors by type
  const errorGroups = {};
  errors.forEach(error => {
    if (!errorGroups[error.type]) {
      errorGroups[error.type] = [];
    }
    errorGroups[error.type].push(error.element);
  });

  // Build summary lines
  const summaryLines = [`成功翻譯 ${successCount}/${totalCount} 個元素`];
  
  Object.entries(errorGroups).forEach(([type, elements]) => {
    let typeDescription;
    switch(type) {
      case 'QUOTA_EXCEEDED':
        typeDescription = 'API 配額超限';
        break;
      case 'NETWORK_ERROR':
        typeDescription = '網路連線問題';
        break;
      case 'API_KEY_ERROR':
        typeDescription = 'API Key 錯誤';
        break;
      case 'EXTENSION_CONTEXT_INVALID':
        typeDescription = '擴充功能需要重新載入';
        break;
      default:
        typeDescription = '其他錯誤';
    }
    summaryLines.push(`<br>• ${typeDescription}: ${elements.length} 個元素`);
  });

  // Show detailed error summary
  if (errorGroups['EXTENSION_CONTEXT_INVALID']) {
    showErrorModal('擴充功能需要更新', '請重新整理頁面後再試翻譯。');
  } else if (errorGroups['QUOTA_EXCEEDED']) {
    showErrorModal('API 配額已達上限', 'API 使用額度已用完，請檢查您的 API 配額設定。');
  } else if (errorGroups['NETWORK_ERROR']) {
    showErrorModal('網路連線問題', '無法連接到翻譯服務，請檢查網路連線後重試。');
  } else {
    const title = '翻譯部分完成';
    const message = summaryLines.join('<br>');
    const autoCloseMs = Math.max(6000, Math.min(12000, summaryLines.length * 1000));
    
    showErrorModal(title, message, autoCloseMs);
  }
}

// Export functions to global scope
window.TransCraftModal = {
  showSameLanguageModal,
  showErrorModal,
  showTranslationErrorSummary
};
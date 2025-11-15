
function togglePdfSize(button) {
    const pdfContainer = button.closest('.pdf-preview-section').querySelector('.pdf-container');
    const iframe = pdfContainer.querySelector('iframe');
    const expandIcon = button.querySelector('.expand-icon');
    const collapseIcon = button.querySelector('.collapse-icon');
    
    if (pdfContainer.classList.contains('expanded')) {
      // 恢复正常大小
      pdfContainer.classList.remove('expanded');
      iframe.style.height = '800px';
      expandIcon.style.display = 'block';
      collapseIcon.style.display = 'none';
      
      // 移除遮罩层
      const overlay = document.querySelector('.pdf-overlay');
      if (overlay) {
        overlay.remove();
      }
    } else {
      // 放大显示
      pdfContainer.classList.add('expanded');
      iframe.style.height = '90vh';
      expandIcon.style.display = 'none';
      collapseIcon.style.display = 'block';
      
      // 添加遮罩层
      const overlay = document.createElement('div');
      overlay.className = 'pdf-overlay';
      document.body.appendChild(overlay);
      
      // 点击遮罩层时收起PDF
      overlay.addEventListener('click', () => {
        togglePdfSize(button);
      });
    }
  }

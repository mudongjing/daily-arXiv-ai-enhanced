import * as const_key from './const_key.js';


const key = const_key.init_key;
const global_data_key = const_key.global_data_key;
const current_date_key = const_key.current_date_key;
const current_papers_key = const_key.current_papers_key;
const current_paper_index_key = const_key.current_paper_index_key;
const active_keywords_key = const_key.active_keywords_key;
const text_search_query_key = const_key.text_search_query_key;
const active_authors_key = const_key.active_authors_key;

export function add_workers_with_data(handlers){
    handlers[key][const_key.data_key]= {};
    let workers = [];
    handlers[key][const_key.workers_key] = workers;
    workers.push(init_date_picker);
    workers.push(init_close);
    workers.push(init_info_card);
    workers.push(init_tags);
    workers.push(init_back_to_top);
    workers.push(init_search);
}

/**
 * 对日期选择的监听器
 * 对于信息卡片点击的监听器
 * 对标签的监听器
 * 对回到顶部按钮的监听器
 * 对搜索框的监听器
 */


function init_date_picker(handlers){
    // 日期选择器相关的事件监听
      const calendarButton = document.getElementById('calendarButton');
      calendarButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDatePicker(handlers);
      });
      
      const datePickerModal = document.querySelector('.date-picker-modal');
      datePickerModal.addEventListener('click', (event) => {
        if (event.target === datePickerModal) {
          toggleDatePicker(handlers);
        }
      });
      
      const datePickerContent = document.querySelector('.date-picker-content');
      datePickerContent.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    
      document.getElementById('dateRangeMode').addEventListener('change', toggleRangeMode(handlers));
}

function init_close(handlers){
  // 其他原有的事件监听器
    document.getElementById('closeModal').addEventListener('click', closeModal);
}

function init_info_card(handlers){
  document.querySelector('.paper-modal').addEventListener('click', (event) => {
      const modal = document.querySelector('.paper-modal');
      const pdfContainer = modal.querySelector('.pdf-container');
      
      // 如果点击的是模态框背景
      if (event.target === modal) {
        // 检查PDF是否处于放大状态
        if (pdfContainer && pdfContainer.classList.contains('expanded')) {
          // 如果PDF是放大的，先将其恢复正常大小
          const expandButton = modal.querySelector('.pdf-expand-btn');
          if (expandButton) {
            togglePdfSize(expandButton);
          }
          // 阻止事件继续传播，防止关闭整个模态框
          event.stopPropagation();
        } else {
          // 如果PDF不是放大状态，则关闭整个模态框
          closeModal();
        }
      }
    });
    
    // 添加键盘事件监听 - Esc 键关闭模态框，左右箭头键切换论文，R 键显示随机论文
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const paperModal = document.getElementById('paperModal');
        const datePickerModal = document.getElementById('datePickerModal');
        
        // 关闭论文模态框
        if (paperModal.classList.contains('active')) {
          closeModal();
        }
        // 关闭日期选择器模态框
        else if (datePickerModal.classList.contains('active')) {
          toggleDatePicker(handlers);
        }
      }
      // 左右箭头键导航论文（仅在论文模态框打开时）
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const paperModal = document.getElementById('paperModal');
        if (paperModal.classList.contains('active')) {
          event.preventDefault(); // 防止页面滚动
          if (event.key === 'ArrowLeft') {
            navigateToPreviousPaper(handlers);
          } else if (event.key === 'ArrowRight') {
            navigateToNextPaper(handlers);
          }
        }
      }
    });
}

function init_tags(handlers){
  // 添加鼠标滚轮横向滚动支持
  const categoryScroll = document.querySelector('.category-scroll');
  const subCategoryScroll = document.querySelector('.sub-category-scroll');
  const keywordScroll = document.querySelector('.keyword-scroll');
  const authorScroll = document.querySelector('.author-scroll');
  
  const add_scroll_listener = function(scroll){
    if (scroll) {
        scroll.addEventListener('wheel', function(e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                this.scrollLeft += e.deltaY;
            }
        });
    }
  }
  add_scroll_listener(categoryScroll);
  add_scroll_listener(subCategoryScroll);
  add_scroll_listener(keywordScroll);
  add_scroll_listener(authorScroll);

  // 其他事件监听器...
  const categoryButtons = document.querySelectorAll('.category-button');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      filterer.filterByCategory(category);
    });
  });
}

function init_back_to_top(handlers){
  // 回到顶部按钮：滚动显示/隐藏 + 点击回到顶部
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    const updateBackToTopVisibility = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      if (scrollTop > 300) {
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    };

    // 初始判断一次（防止刷新在中部时不显示）
    updateBackToTopVisibility();
    window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

function init_search(handlers){
    // 文本搜索：放大镜切换显示输入框
  const searchToggle = document.getElementById('textSearchToggle');
  const searchWrapper = document.querySelector('#textSearchContainer .search-input-wrapper');
  const searchInput = document.getElementById('textSearchInput');
  const searchClear = document.getElementById('textSearchClear');

  // 监听按键事件，当为enter时，才执行搜索操作
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止默认换行行为
      // 触发搜索操作（这里可以添加实际的搜索逻辑）
      console.log('搜索:', searchInput.value);
    }
  });

  if (searchToggle && searchWrapper && searchInput && searchClear) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchWrapper.style.display = 'flex';
      searchInput.focus();
    });

    // 输入时更新查询并重新渲染
    const handleInput = () => {
      const value = searchInput.value.trim();
      let textSearchQuery = value;
      // 有非空文本时：通过切换函数真正停用关键词/作者过滤，并记录之前状态
      if (textSearchQuery.length > 0) {
        if (previousActiveKeywords === null) {
          previousActiveKeywords = [...activeKeywords];
        }
        if (previousActiveAuthors === null) {
          previousActiveAuthors = [...activeAuthors];
        }
        // 逐个停用当前激活的关键词/作者
        // 注意：在遍历前复制数组，避免在切换过程中修改原数组导致遍历问题
        const keywordsToDisable = [...activeKeywords];
        const authorsToDisable = [...activeAuthors];
        keywordsToDisable.forEach(k => toggleKeywordFilter(k));
        authorsToDisable.forEach(a => toggleAuthorFilter(a));
      } else {
        // 文本删除为空，恢复之前记录的关键词/作者激活状态
        if (previousActiveKeywords && previousActiveKeywords.length > 0) {
          previousActiveKeywords.forEach(k => {
            // 若当前未激活则切换回激活
            if (!activeKeywords.includes(k)) toggleKeywordFilter(k);
          });
        }
        if (previousActiveAuthors && previousActiveAuthors.length > 0) {
          previousActiveAuthors.forEach(a => {
            if (!activeAuthors.includes(a)) toggleAuthorFilter(a);
          });
        }
        previousActiveKeywords = null;
        previousActiveAuthors = null;
        // 文本为空时自动隐藏输入框
        searchWrapper.style.display = 'none';
      }

      // 控制清除按钮显示
      searchClear.style.display = textSearchQuery.length > 0 ? 'inline-flex' : 'none';

      renderPapers();
    };

    searchInput.addEventListener('input', handleInput);

    // 清除按钮：清空文本，恢复其他过滤
    searchClear.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      textSearchQuery = '';
      searchClear.style.display = 'none';
      // 恢复之前的过滤状态（如有）
      if (previousActiveKeywords && previousActiveKeywords.length > 0) {
        previousActiveKeywords.forEach(k => {
          if (!activeKeywords.includes(k)) toggleKeywordFilter(k);
        });
      }
      if (previousActiveAuthors && previousActiveAuthors.length > 0) {
        previousActiveAuthors.forEach(a => {
          if (!activeAuthors.includes(a)) toggleAuthorFilter(a);
        });
      }
      previousActiveKeywords = null;
      previousActiveAuthors = null;
      renderPapers();
      // 清空后隐藏输入框
      searchWrapper.style.display = 'none';
    });

    // 失焦时：若文本为空则隐藏输入框（保持有文本时不隐藏）
    searchInput.addEventListener('blur', () => {
      const value = searchInput.value.trim();
      if (value.length === 0) {
        searchWrapper.style.display = 'none';
      }
    });
  }
}


// 导航到上一篇论文
function navigateToPreviousPaper(handlers) {
  let currentFilteredPapers = handlers[global_data_key][current_papers_key];
  if (currentFilteredPapers.length === 0) return;

  let currentPaperIndex = handlers[global_data_key][current_paper_index_key];
  currentPaperIndex = currentPaperIndex > 0 ? currentPaperIndex - 1 : currentFilteredPapers.length - 1;
  handlers[global_data_key][current_paper_index_key] = currentPaperIndex;
  const paper = currentFilteredPapers[currentPaperIndex];
  const_key.showPaperDetails(paper, currentPaperIndex + 1);
}

// 导航到下一篇论文
function navigateToNextPaper(handlers) {
  let currentFilteredPapers = handlers[global_data_key][current_papers_key];
  if (currentFilteredPapers.length === 0) return;
  let currentPaperIndex = handlers[global_data_key][current_paper_index_key];
  currentPaperIndex = currentPaperIndex < currentFilteredPapers.length - 1 ? currentPaperIndex + 1 : 0;
  handlers[global_data_key][current_paper_index_key] = currentPaperIndex;
  const paper = currentFilteredPapers[currentPaperIndex];
  const_key.showPaperDetails(paper, currentPaperIndex + 1);
}

function closeModal() {
  const modal = document.getElementById('paperModal');
  const modalBody = document.getElementById('modalBody');
  
  // 重置模态框的滚动位置
  modalBody.scrollTop = 0;
  
  modal.classList.remove('active');
  document.body.style.overflow = '';
}



function toggleDatePicker(handlers) {
  const datePicker = document.getElementById('datePickerModal');
  datePicker.classList.toggle('active');
  
  if (datePicker.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
    let flatpickrInstance = handlers[global_data_key][const_key.flatpickrInstance_key];
    // 重新初始化日期选择器以确保它反映最新的可用日期
    if (flatpickrInstance) {
      flatpickrInstance.setDate(handlers[global_data_key][const_key.current_date_key], false);
    }
  } else {
    document.body.style.overflow = '';
  }
}

function toggleRangeMode(handlers) {
  let isRangeMode = document.getElementById('dateRangeMode').checked;
  let flatpickrInstance = handlers[global_data_key][const_key.flatpickrInstance_key];
  if (flatpickrInstance) {
    flatpickrInstance.set('mode', isRangeMode ? 'range' : 'single');
  }
  handlers[global_data_key][const_key.is_range_mode_key] = isRangeMode;
}
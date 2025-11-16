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
      handlers[global_data_key][text_search_query_key] = searchInput.value.trim();
      const_key.render_current_view(null, null);
    }
  });

  if (searchToggle && searchWrapper && searchInput && searchClear) {
    searchToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      searchWrapper.style.display = 'flex';
      searchInput.focus();
    });

    // 输入时
    const handleInput = () => {
      const value = searchInput.value.trim();
      let textSearchQuery = value;
      if (textSearchQuery.length === 0) {
        // 文本为空时自动隐藏输入框
        searchWrapper.style.display = 'none';
        handlers[const_key.render_key][const_key.data_key][const_key.is_query_key] = false;
        const_key.render_current_view(null, null);
      }
      // 控制清除按钮显示
      searchClear.style.display = textSearchQuery.length > 0 ? 'inline-flex' : 'none';
    };

    searchInput.addEventListener('input', handleInput);

    // 清除按钮：清空文本，恢复其他过滤
    searchClear.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      searchClear.style.display = 'none';
      handlers[global_data_key][text_search_query_key] =null;
      handlers[const_key.render_key][const_key.data_key][const_key.is_query_key] = false;
      const_key.render_current_view(null, null);
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
  const data = handlers[const_key.render_key][const_key.data_key];
  const now_main_category = data[const_key.main_category_key];
  const query_result_index_dict = data[const_key.query_result_index_dict_key];
  const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];

  let local_index = handlers[global_data_key][const_key.paper_local_index_key];
  let date_index = handlers[global_data_key][const_key.current_paper_date_index_key];;
  let paper_index_in_date = handlers[global_data_key][const_key.current_paper_index_key];

  let total_paper_num = data[const_key.total_paper_num_key];
  let date_arr = Object.keys(query_result_index_dict);
  if(local_index - 1 ===0){
    handlers[global_data_key][const_key.current_paper_date_index_key] = date_arr.length-1;
    let paper_index_arr = query_result_index_dict[date_arr[date_arr.length-1]];
    handlers[global_data_key][const_key.current_paper_index_key] = paper_index_arr.length-1;
    handlers[global_data_key][const_key.paper_local_index_key] = total_paper_num;

    const paper = source_data[date_arr[date_arr.length-1]][const_key.source_data_key][paper_index_arr[paper_index_arr.length-1]];
    const paper_wrapper = new const_key.PaperWrapper(paper, date_arr.length-1, paper_index_arr.length-1, total_paper_num);
    const_key.showPaperDetails(paper_wrapper);
  }else{
    handlers[global_data_key][const_key.paper_local_index_key] = local_index - 1;
    if(paper_index_in_date === 0){
      date_index -= 1;
      let paper_index_arr = query_result_index_dict[date_arr[date_index]];
      paper_index_in_date = paper_index_arr.length-1;

      handlers[global_data_key][const_key.current_paper_date_index_key] = date_index;
      handlers[global_data_key][const_key.current_paper_index_key] = paper_index_in_date;

      const paper = source_data[date_arr[date_index]][const_key.source_data_key][paper_index_arr[paper_index_in_date]];
      const paper_wrapper = new const_key.PaperWrapper(paper, date_index, paper_index_in_date, local_index-1);
      const_key.showPaperDetails(paper_wrapper);
    }else{
      paper_index_in_date -= 1;

      handlers[global_data_key][const_key.current_paper_index_key] = paper_index_in_date;

      let paper_index_arr = query_result_index_dict[date_arr[date_index]];
      const paper = source_data[date_arr[date_index]][const_key.source_data_key][paper_index_arr[paper_index_in_date]];
      const paper_wrapper = new const_key.PaperWrapper(paper, date_index, paper_index_in_date, local_index-1);
      const_key.showPaperDetails(paper_wrapper);
    }
  }
}

// 导航到下一篇论文
function navigateToNextPaper(handlers) {
  const data = handlers[const_key.render_key][const_key.data_key];
  const now_main_category = data[const_key.main_category_key];
  const query_result_index_dict = data[const_key.query_result_index_dict_key];
  const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];

  let local_index = handlers[global_data_key][const_key.paper_local_index_key];
  let date_index = handlers[global_data_key][const_key.current_paper_date_index_key];;
  let paper_index_in_date = handlers[global_data_key][const_key.current_paper_index_key];
  let total_paper_num = data[const_key.total_paper_num_key];
  let date_arr = Object.keys(query_result_index_dict);
  if(local_index === total_paper_num){
    handlers[global_data_key][const_key.current_paper_date_index_key] = 0;
    handlers[global_data_key][const_key.current_paper_index_key] = 0;
    handlers[global_data_key][const_key.paper_local_index_key] = 1;

    let paper_index_arr = query_result_index_dict[date_arr[0]];
    const paper = source_data[date_arr[0]][const_key.source_data_key][paper_index_arr[0]];
    const paper_wrapper = new const_key.PaperWrapper(paper, 0, 0, 1);
    const_key.showPaperDetails(paper_wrapper);
  }else{
    handlers[global_data_key][const_key.paper_local_index_key] = local_index + 1;
    let paper_index_arr = query_result_index_dict[date_arr[date_index]];
    if(paper_index_in_date === paper_index_arr.length-1){
      date_index += 1;
      paper_index_in_date = 0;

      handlers[global_data_key][const_key.current_paper_date_index_key] = date_index;
      handlers[global_data_key][const_key.current_paper_index_key] = paper_index_in_date;

      paper_index_arr = query_result_index_dict[date_arr[date_index]];
      const paper = source_data[date_arr[date_index]][const_key.source_data_key][paper_index_arr[paper_index_in_date]];
      const paper_wrapper = new const_key.PaperWrapper(paper, date_index, paper_index_in_date, local_index+1);
      const_key.showPaperDetails(paper_wrapper); 
    }else{
      paper_index_in_date += 1;

      handlers[global_data_key][const_key.current_paper_index_key] = paper_index_in_date;
      
      const paper = source_data[date_arr[date_index]][const_key.source_data_key][paper_index_arr[paper_index_in_date]];
      const paper_wrapper = new const_key.PaperWrapper(paper, date_index, paper_index_in_date, local_index+1);
      const_key.showPaperDetails(paper_wrapper); 
    }
  }
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

import * as arxiv from './main_cat_loader/arxiv.js';
import * as my_enum from './main_cat_loader/common_enum.js';
import * as common from './main_cat_loader/common_loader.js';
async function countCategoriesAndKeywords(main_cat) {
    let result = new common.CountOfCategoriesAndKeywords();
    const response = await fetch(`data/${date}_ai_${main_cat}.jsonl`);
    const lines = await response.text().split('\n');
    result.setCount(lines.length)
    return result;
  }


export async function loadPapersByDate(date) {
  currentDate = date;
  document.getElementById('currentDate').textContent = formatDate(date);
  
  // 更新日期选择器中的选中日期
  if (flatpickrInstance) {
    flatpickrInstance.setDate(date, false);
  }
  
  // 不再重置激活的关键词和作者
  // 而是保持当前选择状态
  
  const container = document.getElementById('paperContainer');
  let now_count_of_cat_and_keys = {};// 主分类对应的总数和关键词的计数
  Object.values(my_enum.MAIN_CAT).forEach((cat) => {
    now_count_of_cat_and_keys[cat] = countCategoriesAndKeywords(cat);
  });

  // 先渲染主分类过滤标签
  renderCategoryFilter(now_count_of_cat_and_keys);


  let now_main_cat = localStorage.getItem('now_main_cat') || my_enum.MAIN_CAT.ARXIV;
  if (now_main_cat === my_enum.MAIN_CAT.ARXIV) {
    await arxiv.loadPapersByDate(date,container,now_count_of_cat_and_keys);
  } else if (now_main_cat === my_enum.MAIN_CAT.TELEGRAM) {
    await telegram.loadInformationByDate(date,container,now_count_of_cat_and_keys);
  } else if (now_main_cat === my_enum.MAIN_CAT.NEWS) {
    await news.loadNewsByDate(date,container,now_count_of_cat_and_keys);
  }

  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading paper...</p>
    </div>
  `;
  
  try {
    const selectedLanguage = selectLanguageForDate(date);
    const response = await fetch(`data/${date}_AI_enhanced_${selectedLanguage}.jsonl`);
    // 如果文件不存在（例如返回 404），在论文展示区域提示没有论文
    if (!response.ok) {
      if (response.status === 404) {
        container.innerHTML = `
          <div class="loading-container">
            <p>No papers found for this date.</p>
          </div>
        `;
        paperData = {};
        renderCategoryFilter({ sortedCategories: [], categoryCounts: {} });
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    // 空文件也提示没有论文
    if (!text || text.trim() === '') {
      container.innerHTML = `
        <div class="loading-container">
          <p>No papers found for this date.</p>
        </div>
      `;
      paperData = {};
      renderCategoryFilter({ sortedCategories: [], categoryCounts: {} });
      return;
    }
    
    paperData = parseJsonlData(text, date);
    
    const categories = getAllCategories(paperData);
    
    renderCategoryFilter(categories);
    
    renderPapers();
  } catch (error) {
    console.error('加载论文数据失败:', error);
    container.innerHTML = `
      <div class="loading-container">
        <p>Loading data fails. Please retry.</p>
        <p>Error messages: ${error.message}</p>
      </div>
    `;
  }
}
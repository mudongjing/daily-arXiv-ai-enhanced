
// 渲染主分类过滤标签
export function renderCategoryFilter(now_count_of_cat_and_keys) {
  const container = document.querySelector('.category-scroll');
  let main_cats = Object.keys(now_count_of_cat_and_keys);
  main_cats.forEach(main_cat => {
    const button = document.createElement('button');
    button.className = `category-button ${main_cat === currentCategory ? 'active' : ''}`;
    button.innerHTML = `${main_cat}<span class="category-count">${now_count_of_cat_and_keys[main_cat].count}</span>`;
    button.dataset.category = main_cat;
    button.addEventListener('click', () => {
        filterByCategory(main_cat);
    });
    container.appendChild(button);
  });
}

function filterByCategory(category) {
  localStorage.setItem('currentCategory', category);
  document.querySelectorAll('.category-button').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  
  // 保持当前激活的过滤标签
  renderFilterTags();
  
  // 重置页面滚动条到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
//   renderPapers();
}
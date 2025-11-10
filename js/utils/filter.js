import * as renderer from './render.js';


export function filterByCategory(category) {
  currentCategory = category;
  
  document.querySelectorAll('.category-button').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  
  // 保持当前激活的过滤标签
  renderer.renderFilterTags();
  
  // 重置页面滚动条到顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
  
  renderer.renderPapers();
}
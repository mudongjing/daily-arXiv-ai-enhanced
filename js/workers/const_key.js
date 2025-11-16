
export const info_source_key = ['arxiv'] // 文章详情来源['arxiv', 'telegram','news']
export const all_sign = 'all'; // 所有分类的标志


// 局部数据键名
export const date_index_arr_key = 'date_index_arr'; // 日期索引数组
export const sub_category_index_dict_key = 'sub_category_index_dict'; // 次分类索引数组
export const authors_index_dict_key = 'authors_index_dict'; // 作者索引数组
export const keywords_index_dict_key = 'keyword_index_dict'; // 关键词索引数组
export const query_result_index_dict_key = 'query_result_index_dict'; // 查询结果索引数组
export const is_query_key = 'is_query'; // 是否为查询
export const total_paper_num_key = 'total_paper_num'; // 总文章数

//全局数据键名
export const global_data_key = 'global_data';
export const flatpickrInstance_key = 'flatpickrInstance';
export const current_date_key = 'current_date'; // 同时作为时间范围的开始日期
export const current_papers_key = 'current_papers';
export const current_paper_index_key = 'current_paper_index';
export const active_keywords_key = 'active_keywords'; // 后台指定过滤的关键词
export const text_search_query_key = 'text_search_query';
export const active_authors_key = 'active_authors'; // 后台指定过滤的作者
export const main_category_key = 'main_category'; // 后台指定过滤的主分类
export const sub_category_key = 'sub_category'; // 后台指定过滤的次分类
export const end_date_key = 'end_date'; // 如果不为null，则作为时间范围的结束日期，否则表示当前为单一日期查询
export const force_refresh_key = 'force_refresh'; // 指定是否强制刷新数据
export const info_data_dir_key = 'info_data_dir'; // 文章详情数据目录
export const current_view_key = 'current_view'; // 当前视图
export const is_range_mode_key = 'is_range_mode'; // 是否为时间范围查询
export const is_first_load_key = 'is_first_load'; // 是否为首次加载
export const local_sub_category_key = 'local_sub_category'; // 本地次分类
export const paper_local_index_key = 'paper_local_index'; // 论文本地序号
export const current_paper_date_index_key = 'current_paper_date_index'; // 当前在主分类下，当前选择的论文对应的日期索引

export const title_or_summary_query_key = 'title_or_summary_query'; // 标题或摘要格式化查询
export const authors_query_key = 'authors_query'; // 作者格式化查询
export const keywords_query_key = 'keywords_query'; // 关键词格式化查询
export const sub_category_query_key = 'sub_category_query'; // 次分类格式化查询

// 阶段名
export const load_resource_key = 'load_resource'; 
export const init_key = 'init';
export const render_key = 'render';

// handlers中阶段处理函数与数据的键名
export const data_key = 'data'; // 存放数据的对象
export const workers_key = 'workers'; // 存放工作函数

// 信息数据按日期记录，每个日期对应有一个存储所有原始数据信息的数组，其他键值对应的是对原始数据的索引，用于快速查找
export const source_data_key = 'source_data'; // 信息原始数据
export const author_index_key = 'author_index'; // 作者索引
export const category_index_key = 'category_index'; // 分类索引
export const keyword_index_key = 'keyword_index'; // 关键词索引

export const  handlers = {};// 利用流水线模式，对不同阶段执行对应的函数
export async function  handle_workers(worker_name){
  var workers_with_data = handlers[worker_name];
  if(workers_with_data){
    var workers = workers_with_data[workers_key];
    for(let worker of workers){
      if(isAsyncFunction(worker)){
        await worker(handlers);
      } else{
        worker(handlers);
      }
    }
  }
}

export async function refresh_render(){
  await handle_workers(load_resource_key);
  await handle_workers(render_key);
}

export async function render_current_view(main_category, sub_category){
  if(main_category){
    handlers[global_data_key][main_category_key] = main_category;
  }
  if(sub_category){
    handlers[global_data_key][sub_category_key] = sub_category;
  }
  await handle_workers(render_key);
}

function isAsyncFunction(fn) {
  return Object.prototype.toString.call(fn) === '[object AsyncFunction]';
}



export function showPaperDetails(paper_wrapper) {
  let data = handlers[render_key][data_key];
  let paper = paper_wrapper.paper;
  let local_index = handlers[global_data_key][paper_local_index_key];
  let is_matched = data[is_query_key];
  let total_paper_num = data[total_paper_num_key];
  const modal = document.getElementById('paperModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const paperLink = document.getElementById('paperLink');
  const pdfLink = document.getElementById('pdfLink');
  const htmlLink = document.getElementById('htmlLink');
  
  // 重置模态框的滚动位置
  modalBody.scrollTop = 0;
  // 高亮标题
  const highlightedTitle = is_matched ? highlightMatches(paper.title, handlers[global_data_key][title_or_summary_query_key],'keyword-highlight') : paper.title;
  
  // 在标题前添加索引号
  modalTitle.innerHTML = local_index ? `<span class="paper-index-badge">${local_index}</span> ${highlightedTitle}` : highlightedTitle;
  const sub_category_query = handlers[global_data_key][sub_category_query_key];
  const keywords_query = handlers[global_data_key][keywords_query_key];
  const categoryDisplay = is_matched && sub_category_query.length > 0 ? paper.categories.map(cat => 
                            sub_category_query.includes(cat)?  `<span class="category-tag keyword-highlight">${cat}</span>`:`<span class="category-tag">${cat}</span>`).join('') 
                    :paper.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('') ;
  const keywordsDisplay = is_matched && keywords_query.length > 0 ? paper.keywords.map(keyword => 
                            keywords_query.includes(keyword)?  `<span class="keywords-tag keyword-highlight">${keyword}</span>`:`<span class="keywords-tag">${keyword}</span>`).join('') 
                    :paper.keywords.map(keyword => `<span class="keywords-tag">${keyword}</span>`).join('') ;
  const highlightedAuthors =  is_matched ? highlightWithIn(paper.authors, handlers[global_data_key][authors_query_key],'author-highlight') : paper.authors.join(', ');
  // 高亮详情（Abstract/details）
  const highlightedAbstract = is_matched ? highlightMatches(paper.summary, handlers[global_data_key][title_or_summary_query_key],'keyword-highlight') : paper.summary;
  
  // 添加匹配标记
  const matchedPaperClass = is_matched ? 'matched-paper-details' : '';
  
  const modalContent = `
    <div class="paper-details ${matchedPaperClass}">
      <p><strong>Authors: </strong>${highlightedAuthors}</p>
      <p><strong>Categories: </strong>${categoryDisplay}</p>
      <p><strong>Date: </strong>${paper.submitted_date}</p>
      
      <div class="paper-sections">
        ${paper.keywords ? `<div class="paper-section"><h4>Keywords</h4><p>${keywordsDisplay}</p></div>` : ''}
      </div>
      
      ${highlightedAbstract ? `<h3>Abstract</h3><p class="original-abstract">${highlightedAbstract}</p>` : ''}
      
      <div class="pdf-preview-section">
        <div class="pdf-header">
          <h3>PDF Preview</h3>
          <button class="pdf-expand-btn" onclick="togglePdfSize(this)">
            <svg class="expand-icon" viewBox="0 0 24 24" width="24" height="24">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
            <svg class="collapse-icon" viewBox="0 0 24 24" width="24" height="24" style="display: none;">
              <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
            </svg>
          </button>
        </div>
        <div class="pdf-container">
          <iframe src="${paper.url.replace('abs', 'pdf')}" width="100%" height="800px" frameborder="0" allow="fullscreen"></iframe>
        </div>
      </div>
    </div>
  `;
  
  // Update modal content
  document.getElementById('modalBody').innerHTML = modalContent;
  document.getElementById('paperLink').href = paper.url;
  document.getElementById('pdfLink').href = paper.url.replace('abs', 'pdf');
  document.getElementById('htmlLink').href = paper.url.replace('abs', 'html');
  // 提示词来自：https://papers.cool/
  prompt = `请你阅读这篇文章${paper.url.replace('abs', 'pdf')},总结一下这篇文章解决的问题、相关工作、研究方法、做了什么实验及其结果、结论，最后整体总结一下这篇文章的内容`
  document.getElementById('kimiChatLink').href = `https://www.kimi.com/_prefill_chat?prefill_prompt=${prompt}&system_prompt=你是一个学术助手，后面的对话将围绕着以下论文内容进行，已经通过链接给出了论文的PDF和论文已有的FAQ。用户将继续向你咨询论文的相关问题，请你作出专业的回答，不要出现第一人称，当涉及到分点回答时，鼓励你以markdown格式输出。&send_immediately=true&force_search=true`;
  
  // 更新论文位置信息
  const paperPosition = document.getElementById('paperPosition');
  if (paperPosition && total_paper_num > 0) {
    paperPosition.textContent = `${local_index} / ${total_paper_num}`;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function is_arr_same(arr1,arr2){
    if(!arr1 && !arr2){
        return true;
    }
    if(arr1.length !== arr2.length){
        return false;
    }
    arr1 = arr1.sort((a,b)=>a-b);
    arr2 = arr2.sort((a,b)=>a-b);
    for(let i=0;i<arr1.length;i++){
        if(arr1[i] !== arr2[i]){
            return false;
        }
    }
    return true;
}

export class PaperWrapper{
    constructor(paper,date_index,paper_index_in_date,local_index){
        this.paper = paper;
        this.date_index = date_index;
        this.paper_index_in_date = paper_index_in_date;
        this.local_index = local_index;
    }

}

// 帮助函数：高亮文本中的匹配内容
export function highlightMatches(text, terms, className = 'highlight-match') {
  if (!terms || terms.length === 0 || !text) {
    return text;
  }
  let result = text;
  // 按照长度排序关键词，从长到短，避免短词先替换导致长词匹配失败
  const sortedTerms = [...terms].sort((a, b) => b.length - a.length);
  // 为每个词创建一个正则表达式，使用 'gi' 标志进行全局、不区分大小写的匹配
  sortedTerms.forEach(term => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
    result = result.replace(regex, `<span class="${className}">$1</span>`);
  });
  return result;
}

export function highlightWithIn(arr,terms,className = 'highlight-match'){
    if(!terms || terms.length === 0){
        return arr.join(', ');
    }
    let res = [];
    for(let item of arr){
        if(terms.includes(item)){
            res.push(`<span class="${className}">${item}</span>`);
        }else{
            res.push(item);
        }
    }
    return res.join(', ');
}
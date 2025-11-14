import * as const_key from './const_key.js';
import { format_date } from './time_utils.js';

const key = const_key.render_key;

export function add_workers_with_data(handlers){
    // 过滤子分类，过滤日期，过滤关键词，过滤作者
    handlers[key][const_key.data_key] = {};
    let workers = [];
    handlers[key][const_key.workers_key] = workers;
    workers.push(filter_main_category);// 检查当前局部的主分类是否与全局活跃的主分类匹配，不匹配则设置局部的强制刷新，或者全局为强制刷新也更新局部的强制刷新
    workers.push(filter_date); // 同样检查强制刷新，或日期不匹配时，更新局部的索引列表
    workers.push(filter_sub_category); // 检查是否有强制刷新，或者局部的次分类是否与全局活跃的次分类不匹配，重新读取主分类原始数据，更新局部的索引列表
    workers.push(filter_keywords); // 类似的，更新局部的索引列表
    workers.push(filter_author); // 诸如上述的关键词，如果没有设置，则表示不做过滤，复制前一步的索引列表
    workers.push(search_query); // 检查是否有文本搜索查询，搜索默认对标题和摘要进行搜索，使用&& 隔离，可同时指定搜索作者，关键词。没有则复制前一步的索引列表，有则添加标记说明
    workers.push(render_result); // 利用前一步的索引列表，读取主分类的原始数据，并结合主分类的情况，有主分类对应的渲染器，完成渲染，搜索结果使用特殊格式渲染
}

function filter_main_category(handlers){
    let data = handlers[key][const_key.data_key];
    if(handlers[const_key.global_data_key][const_key.force_refresh_key]){
        data[const_key.force_refresh_key] = true;
        data[const_key.main_category_key] = handlers[const_key.global_data_key][const_key.main_category_key];
    }else{
        if(data[const_key.main_category_key] !== handlers[const_key.global_data_key][const_key.main_category_key]){
            data[const_key.force_refresh_key] = true;
            data[const_key.main_category_key] = handlers[const_key.global_data_key][const_key.main_category_key];
        }
    }
}

function render_date(start_date,end_date){
    if(end_date){
        document.getElementById('currentDate').textContent = format_date(start_date)+' - '+format_date(end_date);    
    }else{
        document.getElementById('currentDate').textContent = format_date(start_date);    
    }
}

function filter_date(handlers){
    let data = handlers[key][const_key.data_key];
    let global_start_date = handlers[const_key.global_data_key][const_key.current_date_key];
    let global_end_date = handlers[const_key.global_data_key][const_key.end_date_key];
    if(data[const_key.force_refresh_key] || data[const_key.current_date_key] !== global_start_date || data[const_key.end_date_key] !== global_end_date){
        data[const_key.force_refresh_key] = true;
        data[const_key.current_date_key] = global_start_date;
        data[const_key.end_date_key] = global_end_date;
        render_date(global_start_date, global_end_date);
        if(!global_end_date){
            data[const_key.date_index_arr_key] = [format_date(global_start_date)];
        }else{
            data[const_key.date_index_arr_key] = get_date_range_arr(global_start_date, global_end_date);
        }
    }
}

function filter_sub_category(handlers){
    let data = handlers[key][const_key.data_key];
    let local_sub_category = handlers[key][const_key.sub_category_key];
    if(data[const_key.force_refresh_key] || local_sub_category !== handlers[const_key.global_data_key][const_key.sub_category_key]){
        data[const_key.force_refresh_key] = true;
        data[const_key.sub_category_key] = handlers[const_key.global_data_key][const_key.sub_category_key];
        let now_sub_category = data[const_key.sub_category_key];
        console.log('当前次分类',now_sub_category);
        const now_main_category = data[const_key.main_category_key];
        const date_index_arr = data[const_key.date_index_arr_key];
        
        const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
        if(now_sub_category.includes(const_key.all_sign)){
            data[const_key.sub_category_index_dict_key] = date_index_arr.reduce((dict, date) => {
                dict[date] = range(source_data[date][const_key.source_data_key].length);
                return dict;
            }, {});
        }else{
            data[const_key.sub_category_index_dict_key] = date_index_arr.reduce((dict, date) => {
                let arrs = [];
                for(let sub_category of now_sub_category){
                    arrs.push(source_data[date][const_key.category_index_key][sub_category] || []);
                }
                dict[date] = union(arrs);
                return dict;
            }, {});
        }
    }
    
}

function filter_keywords(handlers){
    let data = handlers[key][const_key.data_key];
    let local_keywords = handlers[key][const_key.active_keywords_key];
    let global_keywords = handlers[const_key.global_data_key][const_key.active_keywords_key];
    const now_main_category = data[const_key.main_category_key];
    if(data[const_key.force_refresh_key] || !is_arr_same(local_keywords, global_keywords)){
        data[const_key.force_refresh_key] = true;
        data[const_key.active_keywords_key] = global_keywords;
        const sub_category_index_dict = data[const_key.sub_category_index_dict_key];
        if(!global_keywords || global_keywords.length === 0){
            data[const_key.keywords_index_dict_key] = deep_clone(sub_category_index_dict);
        }else{
            let keywords_index_dict = {};
            const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
            const date_index_arr = data[const_key.date_index_arr_key];
            date_index_arr.forEach(date => {
                let arrs = [];
                arrs.push(sub_category_index_dict[date]);
                for(let key_word of global_keywords){
                    arrs.push(source_data[date][const_key.keyword_index_key][key_word] || []);
                }
                keywords_index_dict[date] = intersection(arrs);
            });
            data[const_key.keywords_index_dict_key] = keywords_index_dict;
        }
    }
}

function filter_author(handlers){
    let data = handlers[key][const_key.data_key];
    let local_authors = data[const_key.active_authors_key];
    let global_authors = handlers[const_key.global_data_key][const_key.active_authors_key];
    if(data[const_key.force_refresh_key] || !is_arr_same(local_authors, global_authors)){
        data[const_key.force_refresh_key] = true;
        data[const_key.active_authors_key] = global_authors;
        const now_main_category = data[const_key.main_category_key];
        const date_index_arr = data[const_key.date_index_arr_key];
        const keywords_index_dict = data[const_key.keywords_index_dict_key];
        if(!global_authors || global_authors.length === 0){
            data[const_key.authors_index_dict_key] = deep_clone(keywords_index_dict);
        }else{
            let authors_index_dict = {};
            const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
            date_index_arr.forEach(date => {
                let arrs = [];
                arrs.push(keywords_index_dict[date]);
                for(let author of global_authors){
                    arrs.push(source_data[date][const_key.author_index_key][author] || []);
                }
                authors_index_dict[date] = intersection(arrs);
            });
            data[const_key.authors_index_dict_key] = authors_index_dict;
        }
    }
}

function search_query(handlers){
    let data = handlers[key][const_key.data_key];
    let query = handlers[const_key.global_data_key][const_key.text_search_query_key];
    const index_dict = data[const_key.authors_index_dict_key];
    console.log('author index_dict',index_dict);
    const now_sub_category = data[const_key.sub_category_key];
    if (!query || query.trim() === ''){
        data[const_key.query_result_index_dict_key] = deep_clone(index_dict);
    } else{
        let query_parts = query.split('&&');
        let title_or_summary_query = [];
        let authors_query = [];
        let keywords_query = [];
        let sub_category_query = [];
        for(let query_part of query_parts){
            query_part = query_part.trim();
            if(query_part === ''){
                continue;
            }
            if(query_part.startsWith('author:')){
                let query = query_part.substring('author:'.length);
                if(!authors_query.includes(query)){
                    authors_query.push(query);
                }
            }else if(query_part.startsWith('keyword:')){
                let query = query_part.substring('keyword:'.length);
                if(!keywords_query.includes(query)){
                    keywords_query.push(query);
                }
            }else if(query_part.startsWith('sub_category:')){
                let query = query_part.substring('sub_category:'.length);
                if(!sub_category_query.includes(query)){
                    sub_category_query.push(query);
                }
            }else{
                if(!title_or_summary_query.includes(query_part)){
                    title_or_summary_query.push(query_part);    
                }
            }
        }
        
        // 如果上述查询内容为空，或者查询的子类与当前活跃的相同，则不执行实际搜索，直接复制原有的索引字典
        // 利用现有的索引字典，按日期逐个,先获取原始的索引列表，与对应的查询的作者的索引列表取交集，得到新的索引列表，如果作者不要求查询，则使用原始索引列表
        // 类似地，对关键词和子类进行处理，不断利用前一步得到的新索引列表，与查询要求的内容对应的索引列表取交集
        // 最后，利用最后的索引列表，去查询对应的原始数据，查询其标题和摘要是否有 title_or_summary_query 中的内容
        // 如果有，在新的索引列表中加入该数据对应的索引
        if(authors_query.length === 0 && keywords_query.length === 0  && title_or_summary_query.length === 0 && (sub_category_query.length === 0 || (sub_category_query.length === 1 && sub_category_query[0] === now_sub_category))){
            data[const_key.query_result_index_dict_key] = deep_clone(index_dict);
            data[const_key.is_query_key] = sub_category_query.length === 1 ;
        }else{
            let query_result_index_dict = {};
            const date_index_arr = data[const_key.date_index_arr_key];
            const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
            date_index_arr.forEach(date => {
                let arrs = [];
                arrs.push(index_dict[date]);
                for(let author of authors_query){
                    arrs.push(source_data[date][const_key.author_index_key][author] || []);
                }
                for(let keyword of keywords_query){
                    arrs.push(source_data[date][const_key.keyword_index_key][keyword] || []);
                }
                for(let sub_category of sub_category_query){
                    arrs.push(source_data[date][const_key.sub_category_index_dict_key][sub_category] || []);
                }
                let tmp_index = intersection(arrs);
                if(tmp_index.length === 0){
                    query_result_index_dict[date] = tmp_index;
                }else{
                    query_result_index_dict[date] = tmp_index.filter(index => {
                        let item = source_data[date][const_key.source_data_key][index];
                        return title_or_summary_query.some(query => item.title.includes(query) || item.summary.includes(query));
                    });
                }
                
            });
            data[const_key.query_result_index_dict_key] = query_result_index_dict;
            data[const_key.is_query_key] = true ;
        }
    }
    handlers[const_key.global_data_key][const_key.text_search_query_key] = null;
}


function render_result(handlers){
    let data = handlers[key][const_key.data_key];
    let query_result_index_dict = data[const_key.query_result_index_dict_key];
    console.log('query_result_index_dict',query_result_index_dict);
    const container = document.getElementById('paperContainer');
    const now_main_category = data[const_key.main_category_key];
    const source_data = handlers[const_key.load_resource_key][const_key.data_key][now_main_category];
    container.innerHTML = '';
    let current_view = handlers[const_key.global_data_key][const_key.current_view_key];
    container.className = `paper-container ${current_view === 'list' ? 'list-view' : ''}`;
    let is_matched = data[const_key.is_query_key];
    let html = '';
    let local_index = 1;
    for(let date in query_result_index_dict){
        let index_arr = query_result_index_dict[date];
        if(index_arr.length === 0){
            continue;
        }
        for(let index of index_arr){
            let paper = source_data[date][const_key.source_data_key][index];
            const paperCard = document.createElement('div');
            // 添加匹配高亮类
            paperCard.className = `paper-card ${is_matched ? 'matched-paper' : ''}`;
            paperCard.dataset.id = paper.id || paper.url;
            
            // if (is_matched) {
            //     // 添加匹配原因提示
            //     paperCard.title = `匹配: ${paper.matchReason.join(' | ')}`;
            // }
            
            const categoryTags = paper.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('');
            
            // // 组合需要高亮的词：关键词 + 文本搜索
            // const titleSummaryTerms = [];
            // if (activeKeywords.length > 0) {
            //     titleSummaryTerms.push(...activeKeywords);
            // }
            // if (textSearchQuery && textSearchQuery.trim().length > 0) {
            //     titleSummaryTerms.push(textSearchQuery.trim());
            // }

            // // 高亮标题和摘要（关键词与文本搜索）
            const highlightedTitle =  paper.title;
            const highlightedSummary =  paper.summary;

            // // 高亮作者（作者过滤 + 文本搜索）
            // const authorTerms = [];
            // if (activeAuthors.length > 0) authorTerms.push(...activeAuthors);
            // if (textSearchQuery && textSearchQuery.trim().length > 0) authorTerms.push(textSearchQuery.trim());
            const highlightedAuthors = paper.authors;
            
            paperCard.innerHTML = `
                <div class="paper-card-index">${local_index++}</div>
                // ${paper.isMatched ? '<div class="match-badge" title="匹配您的搜索条件"></div>' : ''}
                <div class="paper-card-header">
                    <h3 class="paper-card-title">${highlightedTitle}</h3>
                    <p class="paper-card-authors">${highlightedAuthors}</p>
                    <div class="paper-card-categories">
                    ${categoryTags}
                    </div>
                </div>
                <div class="paper-card-body">
                    <p class="paper-card-summary">${highlightedSummary}</p>
                    <div class="paper-card-footer">
                    <span class="paper-card-date">${paper.submitted_date}</span>
                    <span class="paper-card-link">Details</span>
                    </div>
                </div>
            `;
            
            paperCard.addEventListener('click', () => {
                handlers[const_key.global_data_key][const_key.current_paper_index_key] = index; // 记录当前点击的论文索引
                showPaperDetails(paper, index + 1,is_matched,handlers,query_result_index_dict.length);
            });
            
            container.appendChild(paperCard);
        }
    }
    if(local_index === 1){
        container.innerHTML = `
            <div class="loading-container">
                <p>No paper found.</p>
            </div>
        `;
    }
    handlers[const_key.global_data_key][const_key.force_refresh_key] = false;
    // container.innerHTML = html;
}

function showPaperDetails(paper, paperIndex,is_matched,handlers,total_paper_num) {
  const modal = document.getElementById('paperModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const paperLink = document.getElementById('paperLink');
  const pdfLink = document.getElementById('pdfLink');
  const htmlLink = document.getElementById('htmlLink');
  
  // 重置模态框的滚动位置
  modalBody.scrollTop = 0;
  // 高亮标题
  const highlightedTitle = paper.title;
  
  // 在标题前添加索引号
  modalTitle.innerHTML = paperIndex ? `<span class="paper-index-badge">${paperIndex}</span> ${highlightedTitle}` : highlightedTitle;
  
  const abstractText = paper.summary || '';
  
  const categoryDisplay = paper.categories ? 
    paper.categories.join(', ') : 
    '';
  
  const highlightedAuthors =  paper.authors;
  
  // 高亮摘要（关键词 + 文本搜索）
  const highlightedSummary =  paper.summary;
  
  // 高亮详情（Abstract/details）
  const highlightedAbstract = abstractText;
  
  // 添加匹配标记
  const matchedPaperClass = is_matched ? 'matched-paper-details' : '';
  
  const modalContent = `
    <div class="paper-details ${matchedPaperClass}">
      <p><strong>Authors: </strong>${highlightedAuthors}</p>
      <p><strong>Categories: </strong>${categoryDisplay}</p>
      <p><strong>Date: </strong>${paper.submitted_date}</p>
      
      <div class="paper-sections">
        ${paper.keywords ? `<div class="paper-section"><h4>Keywords</h4><p>${paper.keywords}</p></div>` : ''}
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
          <iframe src="${paper.url.replace('abs', 'pdf')}" width="100%" height="800px" frameborder="0"></iframe>
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
    paperPosition.textContent = `${handlers[const_key.global_data_key][const_key.current_paper_index_key] + 1} / ${total_paper_num}`;
  }
  
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function range(n){
    return Array.from({ length: n }, (_, i) => i);
}

function is_arr_same(arr1,arr2){
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

function deep_clone(obj){
    return _.cloneDeep(obj);
}

// arrs 保存多个数组，返回它们的交集
function intersection(arrs) {
    return arrs.reduce((acc, cur) => _.intersection(acc, cur));
}

function union(arrs){
    return arrs.reduce((acc, cur) => _.union(acc, cur));
}

export const global_data_key = 'global_data';
export const current_date_key = 'current_date'; // 同时作为时间范围的开始日期
export const flatpickrInstance_key = 'flatpickrInstance';
export const current_papers_key = 'current_papers';
export const current_paper_index_key = 'current_paper_index';
export const active_keywords_key = 'active_keywords'; // 后台指定过滤的关键词
export const text_search_query_key = 'text_search_query';
export const active_authors_key = 'active_authors'; // 后台指定过滤的作者
export const main_category_key = 'main_category'; // 后台指定过滤的主分类
export const sub_category_key = 'sub_category'; // 后台指定过滤的次分类
export const end_date_key = 'end_date'; // 如果不为null，则作为时间范围的结束日期，否则表示当前为单一日期查询
export const force_refresh_key = 'force_refresh'; // 指定是否强制刷新数据
export const info_source_key = ['arxiv'] // 文章详情来源['arxiv', 'telegram','news']
export const info_data_dir_key = 'info_data_dir'; // 文章详情数据目录

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


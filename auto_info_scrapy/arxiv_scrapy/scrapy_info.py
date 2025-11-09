"""
获取前一天提交的arXiv论文信息
"""

from datetime import datetime, timedelta,time
import arxiv
import os
import utils
import json

head = time(0,0,0 )
tail = time(23,59,59)
categories = ["cs.AI", "cs.CV","math.NT","math.AC","math.AG"]

def scrapy_info(data_dir: str) -> bool:
    target_date = utils.yesterday_date()
    # 在目录下创建以日期命名的jsonl文件    
    json_file = os.path.join(data_dir, f"{utils.format_date(target_date)}_arxiv.jsonl")
    start = utils.datetime_str(datetime.combine(target_date-timedelta(days=1), head))
    end = utils.datetime_str(datetime.combine(target_date, tail))
    print(f"Scraping arXiv papers submitted between {start} and {end}")
    cat_query = " OR ".join([f"cat:{cat}" for cat in categories])
    query = f"({cat_query}) AND (submittedDate:[{start} TO {end}])"
    print(query)
    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        # max_results=100,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )
    # papers = []
    sum = 0
    with open(json_file, 'w') as f:
        for result in client.results(search):
            r = {
                "title": result.title,
                "authors": [author.name for author in result.authors],
                "arxiv_id": result.get_short_id(),
                "summary": result.summary,
                "url": result.entry_id,
                "submitted_date": result.published.strftime("%Y-%m-%d %H:%M:%S"),
                "categories": result.categories
            }
            # papers.append(r)
            f.write(json.dumps(r, ensure_ascii=False) + '\n')
            sum += 1
        print(f"已处理 {sum} 篇论文")
    return sum > 0



# if __name__ == '__main__':
#     data_dir = './info_data/arxiv_scrapy'
#     os.makedirs(data_dir, exist_ok=True)
#     print(os.path.exists(data_dir)) 
#     print(f"数据保存路径：{os.path.abspath(data_dir)}")
#     papers = scrapy_info(data_dir)
#     print(f"共找到 {len(papers)} 篇符合条件的论文：")
#     for i, paper in enumerate(papers[:5]):
#         print(f"\n论文 {i+1}：")
#         print(f"标题：{paper['title']}")
#         print(f"提交时间：{paper['submitted_date']}")
#         print(f"链接：{paper['url']}")
#         print(f"分类：{', '.join(paper['categories'])}")
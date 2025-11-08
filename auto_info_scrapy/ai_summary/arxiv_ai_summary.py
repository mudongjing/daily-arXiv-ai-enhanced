"""
对arxiv论文的摘要进行总结，根据是否为理论性论文进行判断，剔除非理论性的论文，并提取关键词
生成新的jsonl文件
"""

import os
import utils
import json
from volcenginesdkarkruntime import Ark

client = Ark(api_key=os.environ.get("AI_API_KEY"),)
prompt_header = "你是一个对数学、计算机科学等领域有深入的研究和理解的学者，给我的回答简明扼要。我将给你一些论文的摘要，你根据内容，首先判断该论文是否是纯理论性的主题，是则回答1,不是回答0。然后总结出简单明了的关键词，用逗号分隔。判断与关键词的回答各占一行，中间不要有其他额外信息，所有回答之间尽量不要有额外信息。回答时尽量使用中文。"

def split_by_comma(s: str)->list:
    tmp = s.split('，')
    res = []
    for s in tmp:
        res.extend(s.split(','))
    return res

def do_loop(is_first:bool,info,data_dir: str)->int:
    completion = client.chat.completions.create(
        model=os.environ.get("AI_API_MODEL"),
        messages = [{"role": "system", "content": prompt_header},{"role": "user", "content": info['summary']}],
    )
    content = completion.choices[0].message.content
    print(content)
    lis =content.split('\n')
    lis = [x for x in lis if x.strip()!='']
    print('lis='+str(lis))
    # print(content)
    target_file = os.path.join(data_dir, f"{utils.yesterday_date_str()}_ai_arxiv.jsonl")
    sum = 0
    with open(target_file, 'w' if is_first else 'a') as f:
        l = len(lis)
        print('len='+str(l))
        i = 0  
        while(i<l):
            sum += 1
            print('i='+str(i))
            info['is_theoretical'] = lis[i]
            info['keywords'] = split_by_comma(lis[i+1])
            # line = {
            #     "is_theoretical": lis[i],
            #     "keywords": lis[i+1].split(','),
            # }
            i = i+2
            f.write(json.dumps(info, ensure_ascii=False) + '\n')
    return sum

def arxiv_ai_summary(data_dir: str):
    source_file= os.path.join(data_dir, f"{utils.yesterday_date_str()}_arxiv.jsonl")
    
    # ai_messages = [{"role": "system", "content": "你作为一个作为一个学术能力很强的学者，对数学、计算机科学等领域有深入的研究和理解，下面我将给出arxiv网站上论文的摘要内容，你根据内容，首先判断该论文是否是纯理论性的主题，是则回答1,不是回答0，不要有多余的内容。然后给出具有学术性的简单明了的关键词，用逗号分隔，全部使用中文回答。判断与关键词的回答各占一行，中间不要有其他额外信息，所有回答之间也不要有额外信息。"}]
    sum = 0
    with open(source_file, 'r') as f:
        lines = f.readlines()
        i = 0
        is_first = True
        for line in lines:
            i += 1
            info = json.loads(line)
            sum += do_loop(is_first,info,data_dir)
            is_first = False
            if i> 5:
                break
    print(f"AI共处理 {sum} 篇论文")
        
# if __name__ == '__main__':
#     data_dir = './info_data/arxiv_scrapy'
#     arxiv_ai_summary(data_dir)
    

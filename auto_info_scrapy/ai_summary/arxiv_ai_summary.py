"""
对arxiv论文的摘要进行总结，根据是否为理论性论文进行判断，剔除非理论性的论文，并提取关键词
生成新的jsonl文件
"""

import os
import utils
import json
from volcenginesdkarkruntime import Ark

def arxiv_ai_summary(data_dir: str):
    source_file= os.path.join(data_dir, f"{utils.yesterday_date_str()}.jsonl")
    ai_messages = [{"role": "system", "content": "你作为一个作为一个学术能力很强的学者，对数学，计算机科学等领域有深入的研究和理解，下面我将给出arxiv网站上论文的摘要内容，你根据内容，首先判断该论文是否是纯理论性的主题，给出简单的是或不是的回答，然后给出具有学术性的简单明了的关键词，用逗号分隔，全部使用中文回答，判断与关键词各占一行，中间不要有其他额外信息，所有回答之间也不要有额外信息。"}]
    with open(source_file, 'r') as f:
        lines = f.readlines()
        for line in lines:
            info = json.loads(line)
            ai_messages.append({"role": "user", "content": info['summary']})
    client = Ark(api_key=os.environ.get("AI_API_KEY"),)

    completion = client.chat.completions.create(
        model=os.environ.get("AI_API_MODEL"),
        # messages = [
        #     {"role": "system", "content": "你作为一个经济专家，下面我将给出一些政治经济的新闻，你根据内容，给出简单明了的关键词，我需要利用这些关键词做分类，因此关键词尽量具有普适性，不要过度涉及内容中具有特定含义的关键词。输出时，关键词用逗号分隔，不同新闻简单换行即可，不要输出额外信息。最后结合给出的相关新闻内容，思考其中可能存在的关联性，并给出一个未来经济发展的可能性预测，用一句话总结，内容放在新的一行，与前面的输出内容之前不要有额外的的信息。"},
        #     {"role": "user", "content": "11 月 5 日，在小鹏科技日上，小鹏汽车董事长、CEO 何小鹏发布了小鹏第二代 VLA 大模型，大众将成为小鹏第二代 VLA 首发客户，同时，这一技术将面向全球开源。在这一技术的支持下，小鹏的自动辅助驾驶功能将支持小路、园区内部的辅助驾驶，可以支持复杂交通下的小路辅助驾驶。同时，在这一技术的支持下，小鹏未来将首发 “无导航自动辅助驾驶”。据了解，新功能将于 2026 年 1 月底针对 Ultra 车型全量推送。（Auto 有范儿）正虹科技..."},
        #     {"role": "user", "content": "美国总统拜登当地时间11月3日签署了一项行政命令，要求联邦机构在采购时优先考虑使用美国制造的商品和服务。拜登在白宫签署该命令时表示，这一举措旨在支持美国工人和企业，促进国内制造业的发展。根据该命令，联邦机构在采购过程中将优先考虑那些在美国生产或组装的商品和服务，以推动本土经济增长和就业机会的增加。专家认为，这一政策有望提升美国制造业的竞争力，同时也可能对全球供应链产生一定影响。（新华网）"},            
        # ],
        messages = ai_messages,
    )
    print(completion.choices[0].message.content)
    # target_file = os.path.join(data_dir, f"{utils.yesterday_date_str()}_ai_arxiv.jsonl")

if __name__ == '__main__':
    data_dir = './info_data/arxiv_scrapy'
    arxiv_ai_summary(data_dir)
    

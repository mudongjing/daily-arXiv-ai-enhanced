import os
from datetime import datetime,timedelta

data_dir = '../data'
if __name__ == '__main__':
    print(os.path.abspath(data_dir))
    now_date =datetime.now().date()
    print(now_date)
    last_date = now_date - timedelta(days=1)
    print(last_date)
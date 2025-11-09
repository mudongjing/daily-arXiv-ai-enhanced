
class CountOfCategoriesAndKeywords {
  constructor() {    
    this.count = 0;
    this.keywords = {};//记录不同关键词出现的次数
  } 

  setCount(count) {  
    this.count = count;
  }

  addKeyword(keyword) {
    if (this.keywords[keyword]) {
      this.keywords[keyword]++;
    } else {
      this.keywords[keyword] = 1;
    }
  }
}